import styled from 'styled-components';

export const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.lg};
  padding: 2rem;
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border};
`;

// A visually distinct grouped region inside a Card — the primitive behind
// the Upload/Edit redesign's Basics / Description / Files / Options &
// Schedule grouping.
export const Section = styled.section`
  padding: 1.5rem 0;
  border-bottom: 1px solid ${props => props.theme.colors.borderLight};

  &:first-of-type {
    padding-top: 0;
  }

  &:last-of-type {
    border-bottom: none;
    padding-bottom: 0;
  }

  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.sizes.lg};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

export const SectionDescription = styled.p`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;
