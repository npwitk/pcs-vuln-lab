import React, { useId } from 'react';
import styled from 'styled-components';
import { HelpText } from './FormGroup';

const Wrapper = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.6 : 1};
  width: fit-content;
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

const Track = styled.span`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 24px;
  border-radius: ${props => props.theme.radius.full};
  background: ${props => props.$checked ? props.theme.colors.primary : props.theme.colors.border};
  transition: background ${props => props.theme.transitions.fast};
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.$checked ? '18px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    box-shadow: ${props => props.theme.shadows.sm};
    transition: left ${props => props.theme.transitions.fast};
  }
`;

const LabelText = styled.span`
  font-size: ${props => props.theme.typography.sizes.base};
  color: ${props => props.theme.colors.text};
`;

// checked/onChange/disabled mirror a plain checkbox. `label` may be a
// string or a (checked) => string function, matching the existing
// "enabled"/"disabled" text-swap pattern already used across the app.
export default function ToggleSwitch({ checked, onChange, label, disabled, helpText, id }) {
  const autoId = useId();
  const inputId = id || autoId;
  const labelText = typeof label === 'function' ? label(checked) : label;

  return (
    <div>
      <Wrapper htmlFor={inputId} $disabled={disabled}>
        <HiddenCheckbox id={inputId} checked={checked} disabled={disabled} onChange={onChange} />
        <Track $checked={checked} />
        {labelText && <LabelText>{labelText}</LabelText>}
      </Wrapper>
      {helpText && <HelpText>{helpText}</HelpText>}
    </div>
  );
}
