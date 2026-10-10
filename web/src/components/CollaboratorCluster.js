import React from 'react';
import styled from 'styled-components';

// Bubble clusters in the spirit of an iMessage group poster: sizes vary (the
// uploader is always the biggest) and bubbles sit beside each other with a
// small gap rather than piled on top of each other.
//
// These aren't eyeballed — they're the output of a greedy circle-packing
// pass (each bubble placed tangent to an already-placed one, no overlaps,
// scored for compactness with a bias toward spreading sideways rather than
// growing tall, since this has to fit in a single "Made by" row). Every
// pair has ~3px of air between it and its neighbours.
//
// Each layout carries its own exact bounding box, and that is load-bearing:
// the bubbles are absolutely positioned, so without an explicit width the
// container collapses to zero and the text beside it renders straight
// through the avatars.
const LAYOUTS = {
  2: {
    width: 97,
    height: 54,
    slots: [
      { size: 54, top: 0, left: 0 },
      { size: 40, top: 7, left: 57 },
    ],
  },
  3: {
    width: 97,
    height: 79,
    slots: [
      { size: 54, top: 0, left: 0 },
      { size: 40, top: 7, left: 57 },
      { size: 34, top: 45, left: 41 },
    ],
  },
  4: {
    width: 105,
    height: 79,
    slots: [
      { size: 54, top: 0, left: 0 },
      { size: 40, top: 7, left: 57 },
      { size: 34, top: 45, left: 41 },
      { size: 26, top: 47, left: 79 },
    ],
  },
  5: {
    width: 120,
    height: 79,
    slots: [
      { size: 54, top: 0, left: 0 },
      { size: 40, top: 7, left: 57 },
      { size: 34, top: 45, left: 41 },
      { size: 26, top: 47, left: 79 },
      { size: 22, top: 28, left: 98 },
    ],
  },
  6: {
    width: 128,
    height: 79,
    slots: [
      { size: 54, top: 0, left: 0 },
      { size: 40, top: 7, left: 57 },
      { size: 34, top: 45, left: 41 },
      { size: 26, top: 47, left: 79 },
      { size: 22, top: 28, left: 98 },
      { size: 20, top: 52, left: 108 },
    ],
  },
};

const MAX_SLOTS = 6;

const Cluster = styled.div`
  position: relative;
  flex-shrink: 0;
  width: ${props => props.$width}px;
  height: ${props => props.$height}px;
`;

// Flat circles — no ring/border, matching the reference. Depth comes from
// the size variation and the layering order, not from an outline.
const Circle = styled.div`
  position: absolute;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border-radius: 50%;
  background: ${props => props.theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const Initial = styled.div`
  width: 100%;
  height: 100%;
  background: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.$fontSize}px;
  font-weight: ${props => props.theme.typography.weights.bold};
  line-height: 1;
`;

const MoreLabel = styled(Initial)`
  background: ${props => props.theme.colors.textSecondary};
`;

const initialFontSize = (size) => Math.max(8, Math.round(size * 0.4));

export default function CollaboratorCluster({ uploaderName, uploaderAvatar, collaborators = [] }) {
  if (collaborators.length === 0) return null;

  const total = 1 + collaborators.length;
  const overflowing = total > MAX_SLOTS;
  const layout = LAYOUTS[Math.min(total, MAX_SLOTS)];

  // When there are more people than slots, the last slot becomes a "+N"
  // bubble instead of a person.
  const peopleSlotCount = overflowing ? MAX_SLOTS - 1 : total;
  const people = [
    { name: uploaderName, avatar_url: uploaderAvatar },
    ...collaborators.slice(0, peopleSlotCount - 1),
  ];
  const hiddenCount = collaborators.length - (peopleSlotCount - 1);

  return (
    <Cluster $width={layout.width} $height={layout.height}>
      {people.map((person, i) => {
        const slot = layout.slots[i];
        return (
          <Circle
            key={i}
            $size={slot.size}
            style={{ top: slot.top, left: slot.left, zIndex: slot.size }}
            title={person.name || (person.is_pending ? 'Pending invite' : 'Collaborator')}
          >
            {person.avatar_url ? (
              <img src={person.avatar_url} alt={person.name || ''} />
            ) : (
              <Initial $fontSize={initialFontSize(slot.size)}>
                {(person.name || '?').charAt(0).toUpperCase()}
              </Initial>
            )}
          </Circle>
        );
      })}

      {overflowing && (() => {
        const slot = layout.slots[MAX_SLOTS - 1];
        return (
          <Circle $size={slot.size} style={{ top: slot.top, left: slot.left, zIndex: slot.size }} title={`${hiddenCount} more`}>
            <MoreLabel $fontSize={Math.max(9, Math.round(slot.size * 0.36))}>+{hiddenCount}</MoreLabel>
          </Circle>
        );
      })()}
    </Cluster>
  );
}
