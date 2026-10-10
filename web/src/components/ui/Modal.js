import React from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const Content = styled.div`
  position: relative;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.lg};
  padding: 2rem;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: ${props => props.theme.shadows.xl};
  border: 1px solid ${props => props.theme.colors.border};

  h3 {
    color: ${props => props.theme.colors.text};
    font-size: ${props => props.theme.typography.sizes.xl};
    font-weight: ${props => props.theme.typography.weights.bold};
    margin-bottom: 1rem;
  }

  h4 {
    color: ${props => props.theme.colors.text};
    font-size: ${props => props.theme.typography.sizes.lg};
    font-weight: ${props => props.theme.typography.weights.semibold};
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }

  p {
    color: ${props => props.theme.colors.textSecondary};
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  code {
    background: ${props => props.theme.colors.backgroundSecondary};
    padding: 0.25rem 0.5rem;
    border-radius: ${props => props.theme.radius.sm};
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
    color: ${props => props.theme.colors.text};
  }

  pre {
    background: ${props => props.theme.colors.backgroundSecondary};
    padding: 1rem;
    border-radius: ${props => props.theme.radius.md};
    overflow-x: auto;
    margin: 0.5rem 0;
    border: 1px solid ${props => props.theme.colors.border};

    code {
      background: none;
      padding: 0;
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.radius.md};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
    color: ${props => props.theme.colors.text};
  }
`;

export default function Modal({ onClose, children }) {
  return (
    <Overlay onClick={onClose}>
      <Content onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>×</CloseButton>
        {children}
      </Content>
    </Overlay>
  );
}
