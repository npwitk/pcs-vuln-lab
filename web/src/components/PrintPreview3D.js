import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ViewHelper } from 'three/examples/jsm/helpers/ViewHelper.js';

// A4 aspect ratio (210:297mm), in arbitrary scene units.
const A4_WIDTH = 2.1;
const A4_HEIGHT = 2.97;
const THICKNESS = 0.02;
// Bumped up from 320 - with the view-cube gizmo and free rotation added,
// a taller canvas gives more room to actually see what you're orbiting to.
const VIEW_HEIGHT = 420;

const INITIAL_CAMERA_POSITION = new THREE.Vector3(0, 0, 5);
const INITIAL_TARGET = new THREE.Vector3(0, 0, 0);
const INITIAL_UP = new THREE.Vector3(0, 1, 0);

const RESET_DURATION_S = 0.6;
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
}

// BoxGeometry's material array is ordered [+x, -x, +y, -y, +z, -z] — a thin
// box (rather than a single double-sided plane) so front/back can each show
// a genuinely different, correctly-oriented texture instead of one texture
// mirrored onto both sides.
const FRONT_INDEX = 4;
const BACK_INDEX = 5;

const BLANK_COLOR = 0xe5e5ea;

// Safety cap before a canvas ever becomes a WebGL texture. A malformed
// source PDF (irregular/oversized page geometry - confirmed on one real
// file in this deployment, where Ghostscript was tiling a single page
// across 17x the normal page area) can make pdfjs-dist render a canvas
// large enough to fail a GPU texture upload. That failure loses the WebGL
// context; on restore, Three re-uploads the same oversized texture, fails
// again, loses it again — an infinite Lost/Restored loop, not a one-off.
// Downscaling here guarantees we never hand WebGL something that can fail
// this way, regardless of how large the source render came out.
const MAX_TEXTURE_DIM = 2048;

function toSafeTextureSource(canvas) {
  const { width, height } = canvas;
  if (width <= MAX_TEXTURE_DIM && height <= MAX_TEXTURE_DIM) return canvas;
  const scale = MAX_TEXTURE_DIM / Math.max(width, height);
  const small = document.createElement('canvas');
  small.width = Math.max(1, Math.round(width * scale));
  small.height = Math.max(1, Math.round(height * scale));
  small.getContext('2d').drawImage(canvas, 0, 0, small.width, small.height);
  return small;
}

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: ${VIEW_HEIGHT}px;
  border-radius: 12px;
  overflow: hidden;
`;

const Mount = styled.div`
  width: 100%;
  height: 100%;
`;

// Bottom-left, deliberately opposite the ViewHelper gizmo (top-right) so
// they never overlap.
const ResetButton = styled.button`
  position: absolute;
  left: 0.75rem;
  bottom: 0.75rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: ${props => props.theme.radius.full};
  background: rgba(255, 255, 255, 0.85);
  color: #333;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  backdrop-filter: blur(4px);

  &:hover {
    background: #fff;
  }
`;

/**
 * A single rotatable "sheet of paper" — front face from `frontCanvas`, back
 * face from `backCanvas` when `duplex` is on. This exists specifically to
 * make flip-edge orientation intuitive: long-edge vs short-edge produce a
 * visibly different back-page orientation once you spin the sheet around,
 * which is hard to convey with a flat diagram. This is a preview only —
 * duplex/flip-edge can't actually be enforced on the real print job (see
 * utils/pdfPrintProcessor.js's header comment for why).
 */
const PrintPreview3D = ({ frontCanvas, backCanvas, duplex, flipEdge }) => {
  const mountRef = useRef(null);
  const sceneStateRef = useRef(null);

  // One-time scene setup.
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const width = mount.clientWidth || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f1f3);

    const camera = new THREE.PerspectiveCamera(35, width / VIEW_HEIGHT, 0.1, 100);
    camera.position.copy(INITIAL_CAMERA_POSITION);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, VIEW_HEIGHT);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Without these, colors come out washed out / wrong (Three.js r152+
    // changed its color management defaults) - the renderer needs to know
    // to output sRGB. Deliberately no tone mapping curve (NoToneMapping,
    // the default) - a filmic/ACES curve compresses highlights, so a true
    // white page texture pixel renders as slightly-off-white/grey instead
    // of a real #FFFFFF. This is a flat page preview next to a light-grey
    // page background, not an HDR scene, so we want literal color fidelity
    // more than filmic highlight rolloff.
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(INITIAL_TARGET);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2.5;
    controls.maxDistance = 8;
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;

    // Blender-style view-cube gizmo, top-right - click an axis to snap the
    // camera to that view (top/front/right/etc.) instead of only free-dragging.
    const viewHelper = new ViewHelper(camera, renderer.domElement);
    viewHelper.location = { top: 0, right: 0, bottom: null, left: null };
    viewHelper.center.copy(INITIAL_TARGET);
    const handleGizmoPointerUp = (event) => {
      if (viewHelper.handleClick(event)) {
        // A click on the gizmo just started a new snap animation - cancel
        // any in-flight "reset view" tween so the two don't fight over the
        // camera at the same time.
        resetAnim = null;
        controls.enabled = true;
      }
    };
    renderer.domElement.addEventListener('pointerup', handleGizmoPointerUp);

    // This is meant to read as flat, evenly-lit paper, not a dramatically
    // shaded product shot. Ambient carries most of the brightness (it's
    // orientation-independent, so front and back start from the same
    // baseline); four modest directional lights - mirrored left/right AND
    // front/back - add a little dimension without favoring either face.
    // The previous version only had lights on the +z (front) side, so the
    // back face's -z-facing normal barely caught any of them at all.
    scene.add(new THREE.AmbientLight(0xffffff, 0.95));
    const lightPositions = [
      [-3, 2, 4], [3, 2, 4],   // front-left, front-right
      [-3, 2, -4], [3, 2, -4], // back-left, back-right
    ];
    lightPositions.forEach(([x, y, z]) => {
      const light = new THREE.DirectionalLight(0xffffff, 0.22);
      light.position.set(x, y, z);
      scene.add(light);
    });

    // Edges stay lit (MeshStandardMaterial) so the box still reads as a real
    // 3D object with some shading depth. The front/back FACES - where the
    // actual page content lives - are MeshBasicMaterial: unlit, so a white
    // texture pixel displays as literal #FFFFFF always, completely
    // independent of light intensity/tone mapping/PBR response. No amount
    // of light tuning on a lit material guarantees hitting true white -
    // this is the only way to actually guarantee it.
    const edgeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const materials = [
      edgeMaterial, edgeMaterial, // +x, -x (thin edges)
      edgeMaterial, edgeMaterial, // +y, -y (thin edges)
      new THREE.MeshBasicMaterial({ color: BLANK_COLOR }), // +z front
      new THREE.MeshBasicMaterial({ color: BLANK_COLOR }), // -z back
    ];

    const geometry = new THREE.BoxGeometry(A4_WIDTH, A4_HEIGHT, THICKNESS);
    const mesh = new THREE.Mesh(geometry, materials);
    scene.add(mesh);

    let frameId;
    let resetAnim = null; // { startPos, startTarget, startUp, elapsed } | null while a reset is animating
    // ViewHelper.render() internally calls renderer.render() again for its
    // own small corner viewport - with the default autoClear=true, THAT
    // call clears the entire canvas (a viewport restricts where things get
    // drawn, not what a clear touches), wiping out the main scene right
    // after it was drawn and leaving only the gizmo visible. autoClear=false
    // plus a manual renderer.clear() before the main render replaces that
    // automatic behavior with one explicit full clear per frame, so the
    // gizmo's own render just draws on top instead of erasing everything.
    renderer.autoClear = false;

    const clock = new THREE.Clock();
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      // ViewHelper drives the camera directly while animating a view snap;
      // controls.update() re-syncs its own internal state from the camera's
      // current transform every call, so running both each frame is safe -
      // it just settles onto wherever ViewHelper left the camera.
      if (viewHelper.animating) viewHelper.update(delta);
      if (resetAnim) {
        resetAnim.elapsed += delta;
        const t = easeInOutCubic(Math.min(resetAnim.elapsed / RESET_DURATION_S, 1));
        camera.position.lerpVectors(resetAnim.startPos, INITIAL_CAMERA_POSITION, t);
        controls.target.lerpVectors(resetAnim.startTarget, INITIAL_TARGET, t);
        camera.up.lerpVectors(resetAnim.startUp, INITIAL_UP, t).normalize();
        if (t >= 1) {
          resetAnim = null;
          controls.enabled = true;
        }
      }
      controls.update();
      renderer.clear();
      renderer.render(scene, camera);
      viewHelper.render(renderer);
    };
    animate();

    const handleResize = () => {
      const w = mount.clientWidth || 400;
      camera.aspect = w / VIEW_HEIGHT;
      camera.updateProjectionMatrix();
      renderer.setSize(w, VIEW_HEIGHT);
    };
    window.addEventListener('resize', handleResize);

    sceneStateRef.current = {
      materials,
      resetView: () => {
        // Same "spin back" treatment as clicking an axis on the gizmo,
        // rather than an instant jump - and cancels any in-flight ViewHelper
        // snap animation so the two can't fight over the camera.
        viewHelper.animating = false;
        controls.enabled = false;
        resetAnim = {
          startPos: camera.position.clone(),
          startTarget: controls.target.clone(),
          startUp: camera.up.clone(),
          elapsed: 0,
        };
      },
    };

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerup', handleGizmoPointerUp);
      viewHelper.dispose();
      controls.dispose();
      renderer.dispose();
      geometry.dispose();
      materials.forEach((m) => { m.map?.dispose(); m.dispose(); });
      sceneStateRef.current = null;
      mount.innerHTML = '';
    };
  }, []);

  // Push texture updates whenever the source canvases or flip settings change.
  useEffect(() => {
    const state = sceneStateRef.current;
    if (!state) return;
    const { materials } = state;

    // Every texture created here holds real GPU memory - without disposing
    // the one it's about to replace, each toggle of color/duplex/flip-edge
    // leaks one. Enough leaked textures piling up is what was causing
    // repeated "WebGLRenderer: Context Lost" - the browser forcibly
    // reclaiming GPU memory, not an actual render loop bug.
    materials[FRONT_INDEX].map?.dispose();
    materials[BACK_INDEX].map?.dispose();

    if (frontCanvas) {
      const tex = new THREE.CanvasTexture(toSafeTextureSource(frontCanvas));
      // A color/albedo texture (a rendered page, not data like a normal
      // map) - needs this set explicitly or it renders too pale/desaturated.
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      materials[FRONT_INDEX].map = tex;
      materials[FRONT_INDEX].color.set(0xffffff);
    } else {
      materials[FRONT_INDEX].map = null;
      materials[FRONT_INDEX].color.set(BLANK_COLOR);
    }
    materials[FRONT_INDEX].needsUpdate = true;

    if (duplex && backCanvas) {
      const tex = new THREE.CanvasTexture(toSafeTextureSource(backCanvas));
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      // BoxGeometry's own UV convention for the -z (back) face already
      // presents a non-mirrored, correctly-oriented image when the camera
      // orbits around to view it from behind - the same way a long-edge
      // duplex page's back content prints in the same reading orientation
      // as the front, and just reads correctly once the physical sheet is
      // flipped on its long edge. No transform needed for that case - the
      // previous single-axis mirror here was actually introducing the
      // wrong flip. Short-edge duplex is a different print convention: the
      // back page is rotated a full 180° relative to the front so it reads
      // correctly after a short-edge flip, hence mirroring both axes here.
      if (flipEdge === 'short') {
        tex.repeat.x = -1;
        tex.offset.x = 1;
        tex.repeat.y = -1;
        tex.offset.y = 1;
      }
      tex.needsUpdate = true;
      materials[BACK_INDEX].map = tex;
      materials[BACK_INDEX].color.set(0xffffff);
    } else {
      materials[BACK_INDEX].map = null;
      materials[BACK_INDEX].color.set(BLANK_COLOR);
    }
    materials[BACK_INDEX].needsUpdate = true;
  }, [frontCanvas, backCanvas, duplex, flipEdge]);

  const handleResetView = () => {
    sceneStateRef.current?.resetView?.();
  };

  return (
    <Wrapper>
      <Mount ref={mountRef} />
      <ResetButton type="button" onClick={handleResetView}>Reset view</ResetButton>
    </Wrapper>
  );
};

export default PrintPreview3D;
