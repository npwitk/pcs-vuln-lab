import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import * as THREE from 'three';

// A cheat sheet as a rotatable sheet of paper (beta): the seller's photos or
// scans of the printed front and back on a thin box, drawn on a transparent
// canvas so it sits directly on the page, with no scene background.
//
// Same lighting and unlit page faces as PrintPreview3D (true paper white),
// but its own controls, because OrbitControls would fight the page:
//  - no wheel zoom, so the mouse wheel keeps scrolling the page;
//  - `touch-action: pan-y`, so a vertical swipe on a phone scrolls the page
//    and only a horizontal drag turns the sheet;
//  - drag spins (with inertia) and tilts a little; a tap or click flips it.
// Frames are only rendered while something is moving.

const THICKNESS = 0.015;
const SHEET_WIDTH = 2; // scene units; height follows the front image's aspect ratio
const FOV = 30;
const FILL = 0.8; // share of the viewport the sheet may occupy (room to tilt)
const MAX_PITCH = 0.45; // radians, about 25 degrees
const FRONT_INDEX = 4; // BoxGeometry faces: [+x, -x, +y, -y, +z, -z]
const BACK_INDEX = 5;

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  touch-action: pan-y;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;

  &:active {
    cursor: grabbing;
  }

  canvas {
    display: block;
    outline: none;
  }

  @media (max-width: 1023px) {
    height: min(70vh, 560px);
  }
`;

const Hint = styled.div`
  position: absolute;
  left: 50%;
  bottom: 0.75rem;
  transform: translateX(-50%);
  padding: 0.35rem 0.8rem;
  border-radius: ${props => props.theme.radius.full};
  background: ${props => props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.55)' : 'rgba(255, 255, 255, 0.85)'};
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.medium};
  white-space: nowrap;
  pointer-events: none;
  backdrop-filter: blur(6px);
  opacity: ${props => (props.$visible ? 1 : 0)};
  transition: opacity 0.4s ease;
`;

const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);

// Wrap an angle to (-PI, PI].
const wrapAngle = (a) => {
  const twoPi = Math.PI * 2;
  return a - twoPi * Math.floor((a + Math.PI) / twoPi);
};

function loadTexture(loader, url) {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}

export default function Sheet3DViewer({ frontUrl, backUrl, hint, onReady, onError }) {
  const mountRef = useRef(null);
  const [interacted, setInteracted] = useState(false);
  const callbacks = useRef({ onReady, onError });
  callbacks.current = { onReady, onError };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !frontUrl) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (err) {
      callbacks.current.onError?.(err);
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);

    // Same light setup as PrintPreview3D: mostly ambient, four soft
    // directional lights mirrored front/back so neither face is favored.
    scene.add(new THREE.AmbientLight(0xffffff, 0.95));
    [[-3, 2, 4], [3, 2, 4], [-3, 2, -4], [3, 2, -4]].forEach(([x, y, z]) => {
      const light = new THREE.DirectionalLight(0xffffff, 0.22);
      light.position.set(x, y, z);
      scene.add(light);
    });

    const edgeMaterial = new THREE.MeshStandardMaterial({ color: 0xf4f4f4 });
    const frontMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const backMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const materials = [edgeMaterial, edgeMaterial, edgeMaterial, edgeMaterial, frontMaterial, backMaterial];
    let geometry = new THREE.BoxGeometry(SHEET_WIDTH, SHEET_WIDTH * 1.414, THICKNESS);
    const sheet = new THREE.Mesh(geometry, materials);
    sheet.visible = false;
    scene.add(sheet);

    // --- motion state
    let yaw = 0;
    let pitch = 0;
    let yawVelocity = 0;
    let dragging = false;
    let flip = null; // { from, to, t }
    let peek = null; // { t }
    let frameId = null;
    let lastTime = 0;
    let sheetAspect = 1.414;
    let disposed = false;

    const render = () => renderer.render(scene, camera);

    const fitCamera = () => {
      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;
      renderer.setSize(width, height, false);
      renderer.domElement.style.width = `${width}px`;
      renderer.domElement.style.height = `${height}px`;
      camera.aspect = width / height;
      // Distance at which the sheet fills FILL of the view in both directions;
      // the diagonal-ish bound keeps corners inside the frame while it turns.
      const halfFov = THREE.MathUtils.degToRad(FOV / 2);
      const sheetH = SHEET_WIDTH * sheetAspect;
      const byHeight = (sheetH / 2) / Math.tan(halfFov);
      const byWidth = (SHEET_WIDTH / 2) / (Math.tan(halfFov) * camera.aspect);
      camera.position.set(0, 0, Math.max(byHeight, byWidth) / FILL + THICKNESS);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    };

    const isMoving = () => dragging || flip || peek || Math.abs(yawVelocity) > 0.0005 || Math.abs(pitch) > 0.001;

    const tick = (time) => {
      frameId = null;
      const dt = Math.min(0.05, lastTime ? (time - lastTime) / 1000 : 0.016);
      lastTime = time;

      if (flip) {
        flip.t = Math.min(1, flip.t + dt / 0.7);
        yaw = flip.from + (flip.to - flip.from) * easeInOut(flip.t);
        if (flip.t >= 1) {
          yaw = wrapAngle(flip.to);
          flip = null;
        }
      } else if (peek) {
        // A short turn to one side and back on first view, so it's clear the
        // sheet can be turned.
        peek.t = Math.min(1, peek.t + dt / 1.6);
        yaw = -0.45 * Math.sin(Math.PI * easeInOut(peek.t));
        if (peek.t >= 1) {
          yaw = 0;
          peek = null;
        }
      } else if (!dragging) {
        yaw += yawVelocity * dt * 60;
        yawVelocity *= 0.92; // inertia
        pitch *= 0.9; // tilt settles back to level
        if (Math.abs(pitch) < 0.001) pitch = 0;
      }

      sheet.rotation.set(pitch, yaw, 0);
      render();
      if (isMoving()) schedule();
      else lastTime = 0;
    };

    function schedule() {
      if (frameId === null && !disposed) frameId = requestAnimationFrame(tick);
    }

    // --- pointer controls
    let start = null; // { x, y, time }
    let last = null;
    const onPointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      start = { x: e.clientX, y: e.clientY, time: performance.now() };
      last = { x: e.clientX, y: e.clientY };
      dragging = true;
      flip = null;
      peek = null;
      yawVelocity = 0;
      try {
        renderer.domElement.setPointerCapture(e.pointerId);
      } catch {
        // No capture (e.g. the pointer already went away); dragging still works.
      }
      setInteracted(true);
      schedule();
    };
    const onPointerMove = (e) => {
      if (!dragging || !last) return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
      const perPixel = Math.PI / Math.max(240, mount.clientWidth * 0.9);
      yaw += dx * perPixel;
      yawVelocity = dx * perPixel;
      pitch = THREE.MathUtils.clamp(pitch + dy * perPixel * 0.6, -MAX_PITCH, MAX_PITCH);
      schedule();
    };
    const onPointerUp = (e) => {
      if (!dragging) return;
      dragging = false;
      try {
        renderer.domElement.releasePointerCapture(e.pointerId);
      } catch {
        // Already released; must not stop the tap-to-flip below.
      }
      const moved = start ? Math.hypot(e.clientX - start.x, e.clientY - start.y) : 99;
      const quick = start ? performance.now() - start.time < 350 : false;
      if (moved < 6 && quick) {
        // Tap/click: turn to the other face.
        yawVelocity = 0;
        const facingBack = Math.cos(wrapAngle(yaw)) < 0;
        const target = facingBack ? 0 : Math.PI;
        let delta = wrapAngle(target - yaw);
        if (Math.abs(delta) < 0.01) delta = Math.PI;
        flip = { from: yaw, to: yaw + delta, t: 0 };
      }
      start = null;
      schedule();
    };
    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    // --- sizing
    const resizeObserver = new ResizeObserver(() => {
      fitCamera();
      render();
    });
    resizeObserver.observe(mount);
    fitCamera();

    // --- textures
    const loader = new THREE.TextureLoader();
    const prepare = (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return texture;
    };
    const loaded = [];
    Promise.all([
      loadTexture(loader, frontUrl),
      backUrl ? loadTexture(loader, backUrl).catch(() => null) : Promise.resolve(null),
    ]).then(([front, back]) => {
      if (disposed) {
        front?.dispose();
        back?.dispose();
        return;
      }
      loaded.push(front, back);
      const { width, height } = front.image;
      sheetAspect = width && height ? height / width : 1.414;
      geometry.dispose();
      geometry = new THREE.BoxGeometry(SHEET_WIDTH, SHEET_WIDTH * sheetAspect, THICKNESS);
      sheet.geometry = geometry;

      frontMaterial.map = prepare(front);
      frontMaterial.needsUpdate = true;
      if (back) {
        backMaterial.map = prepare(back);
        backMaterial.needsUpdate = true;
      }
      materials[FRONT_INDEX] = frontMaterial;
      materials[BACK_INDEX] = backMaterial;
      sheet.visible = true;
      fitCamera();
      render();
      callbacks.current.onReady?.();

      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (!reduceMotion) {
        peek = { t: 0 };
        schedule();
      }
    }).catch((err) => {
      if (!disposed) callbacks.current.onError?.(err);
    });

    const onContextLost = (e) => {
      e.preventDefault();
      callbacks.current.onError?.(new Error('WebGL context lost'));
    };
    canvas.addEventListener('webglcontextlost', onContextLost);

    return () => {
      disposed = true;
      if (frameId !== null) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      loaded.forEach(t => t?.dispose());
      geometry.dispose();
      edgeMaterial.dispose();
      frontMaterial.dispose();
      backMaterial.dispose();
      renderer.dispose();
      // Browsers cap live WebGL contexts; release this one right away.
      renderer.forceContextLoss();
      if (canvas.parentNode === mount) mount.removeChild(canvas);
    };
  }, [frontUrl, backUrl]);

  return (
    <Wrapper ref={mountRef}>
      {hint && <Hint $visible={!interacted}>{hint}</Hint>}
    </Wrapper>
  );
}
