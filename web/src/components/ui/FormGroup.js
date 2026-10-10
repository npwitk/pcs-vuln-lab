import styled from 'styled-components';

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

// $required renders the red asterisk suffix.
export const Label = styled.label`
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.sizes.sm};

  span {
    color: ${props => props.theme.colors.error};
  }

  /* Optional leading icon: <Label><Clock size={15} /> Release date</Label> */
  > svg {
    vertical-align: -3px;
    margin-right: 0.4rem;
    color: ${props => props.theme.colors.textSecondary};
  }
`;

export const HelpText = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.25rem;
`;

export const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;
