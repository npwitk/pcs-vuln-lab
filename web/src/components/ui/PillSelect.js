import React from 'react';
import styled from 'styled-components';

const Group = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Pill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: ${props => props.theme.radius.full};
  border: 1.5px solid ${props => props.$active ? props.theme.colors.primary : props.theme.colors.border};
  background: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.$active ? '#fff' : props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover:not(:disabled) {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.$active ? '#fff' : props.theme.colors.primary};
  }

  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Choice pills, a friendlier stand-in for a short <select>.
// options: [{ value, label, icon? }]. With `clearable`, clicking the active
// pill clears the choice (for optional fields).
// With `multiple`, `value` is an array and each pill toggles independently;
// onChange receives the new array in `options` order.
export default function PillSelect({ options, value, onChange, clearable = false, disabled = false, ariaLabel, multiple = false }) {
  const selected = multiple ? (Array.isArray(value) ? value : []) : null;

  const handleClick = (optionValue, active) => {
    if (multiple) {
      const next = active ? selected.filter(v => v !== optionValue) : [...selected, optionValue];
      onChange(options.map(o => o.value).filter(v => next.includes(v)));
      return;
    }
    onChange(active && clearable ? '' : optionValue);
  };

  return (
    <Group role={multiple ? 'group' : 'radiogroup'} aria-label={ariaLabel}>
      {options.map(({ value: optionValue, label, icon: Icon }) => {
        const active = multiple ? selected.includes(optionValue) : value === optionValue;
        return (
          <Pill
            key={optionValue}
            type="button"
            role={multiple ? 'checkbox' : 'radio'}
            aria-checked={active}
            $active={active}
            disabled={disabled}
            onClick={() => handleClick(optionValue, active)}
          >
            {Icon && <Icon size={15} />}
            {label}
          </Pill>
        );
      })}
    </Group>
  );
}
