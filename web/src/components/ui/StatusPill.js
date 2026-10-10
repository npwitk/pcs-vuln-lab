import styled from 'styled-components';

// Small neutral tag after a label ("Beta", "Coming soon"). Outlined in the
// theme's border and text colours rather than a fixed fill, so it reads on
// any surface in both light and dark mode.
const StatusPill = styled.span`
  display: inline-block;
  margin-left: 0.5rem;
  padding: 0.0625rem 0.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.full};
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.6875rem;
  font-weight: ${props => props.theme.typography.weights.semibold};
  line-height: 1.5;
  vertical-align: 1px;
  white-space: nowrap;
`;

export default StatusPill;
