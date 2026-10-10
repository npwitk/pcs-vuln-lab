import styled from 'styled-components';

// $variant: 'primary' | 'secondary' (default) | 'danger'
// $size: 'md' (default) | 'sm'
const Button = styled.button`
  padding: ${props => props.$size === 'sm' ? '0.625rem 1.25rem' : '0.875rem 2rem'};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.$size === 'sm' ? props.theme.typography.sizes.sm : props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  border: none;

  ${props => props.$variant === 'primary' && `
    background: ${props.theme.colors.primary};
    color: white;
    box-shadow: ${props.theme.shadows.sm};

    &:hover:not(:disabled) {
      background: ${props.theme.colors.primaryHover};
      transform: translateY(-1px);
      box-shadow: ${props.theme.shadows.md};
    }

    &:disabled {
      background: ${props.theme.colors.textTertiary};
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `}

  ${props => props.$variant === 'danger' && `
    background: ${props.theme.colors.error};
    color: white;

    &:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    &:disabled {
      background: ${props.theme.colors.textTertiary};
      cursor: not-allowed;
      transform: none;
    }
  `}

  ${props => (!props.$variant || props.$variant === 'secondary') && `
    background: transparent;
    color: ${props.theme.colors.text};
    border: 2px solid ${props.theme.colors.border};

    &:hover:not(:disabled) {
      border-color: ${props.theme.colors.textSecondary};
      background: ${props.theme.colors.backgroundSecondary};
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  `}
`;

export default Button;
