import React from 'react';
import styled from 'styled-components';

const Stack = styled.div`
  display: flex;
  align-items: center;
`;

const Circle = styled.div`
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border-radius: 50%;
  border: 2px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;

  &:not(:first-child) {
    margin-left: ${props => -Math.round(props.$size * 0.4)}px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.bold};
`;

const MoreCircle = styled(Initial)`
  background: ${props => props.theme.colors.textSecondary};
`;

// A small overlapping stack of avatar circles — the uploader (people[0])
// first, most prominent (highest z-index, so it sits on top of the ones
// behind it), then up to `max` collaborators, with a "+N" circle for the
// rest, all shifted left over each other in DOM order.
export default function AvatarStack({ people, size = 32, max = 3 }) {
  if (!people || people.length === 0) return null;

  const shown = people.slice(0, max);
  const extra = people.length - shown.length;

  return (
    <Stack>
      {shown.map((person, i) => (
        <Circle key={i} $size={size} title={person.name || 'Collaborator'} style={{ zIndex: shown.length - i }}>
          {person.avatar_url ? (
            <img src={person.avatar_url} alt={person.name || ''} />
          ) : (
            <Initial>{(person.name || '?').charAt(0).toUpperCase()}</Initial>
          )}
        </Circle>
      ))}
      {extra > 0 && (
        <Circle $size={size} style={{ zIndex: 0 }}>
          <MoreCircle>+{extra}</MoreCircle>
        </Circle>
      )}
    </Stack>
  );
}
