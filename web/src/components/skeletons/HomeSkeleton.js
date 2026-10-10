import React from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
`;

const Bone = styled.div`
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: ${props => props.theme.radius.sm};
  animation: ${pulse} 1.6s ease-in-out infinite;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.xl};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border};
`;

const ImageBone = styled(Bone)`
  width: 100%;
  height: 200px;
  border-radius: 0;
`;

const CardBody = styled.div`
  padding: 1.25rem;
`;

const CardFooterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// Card dimensions match Home.js's real Grid/Card/PreviewImageContainer/CardContent
// so the skeleton reserves the exact space the real content will occupy.
export const CardGridSkeleton = ({ count = 6 }) => (
  <Grid aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i}>
        <ImageBone />
        <CardBody>
          <Bone style={{ width: '72px', height: '24px', borderRadius: '999px', marginBottom: '0.75rem' }} />
          <Bone style={{ width: '70%', height: '22px', marginBottom: '0.75rem' }} />
          <Bone style={{ width: '100%', height: '14px', marginBottom: '0.4rem' }} />
          <Bone style={{ width: '80%', height: '14px', marginBottom: '1.25rem' }} />
          <CardFooterRow>
            <Bone style={{ width: '60px', height: '26px' }} />
            <Bone style={{ width: '90px', height: '16px' }} />
          </CardFooterRow>
        </CardBody>
      </Card>
    ))}
  </Grid>
);
