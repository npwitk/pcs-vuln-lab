import React, { useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const Text = styled.div`
  white-space: pre-line;
  overflow-wrap: anywhere;
  ${props => !props.$expanded && `
    display: -webkit-box;
    -webkit-line-clamp: ${props.$lines};
    -webkit-box-orient: vertical;
    overflow: hidden;
  `}
`;

const Toggle = styled.button`
  padding: 0;
  margin-top: 0.25rem;
  border: none;
  background: none;
  color: ${props => props.theme.colors.primary};
  font-size: inherit;
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;

  &:hover { text-decoration: underline; }
`;

// Plain text clamped to `lines`, with Show more / Show less only when it
// actually overflows (measured after render, so short text gets no toggle).
export default function ExpandableText({ children, lines = 3, className }) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && !expanded) setOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, [children, lines, expanded]);

  return (
    <div className={className}>
      <Text ref={ref} $lines={lines} $expanded={expanded}>{children}</Text>
      {(overflowing || expanded) && (
        <Toggle type="button" onClick={() => setExpanded(v => !v)}>
          {expanded ? t('common.showLess') : t('common.showMore')}
        </Toggle>
      )}
    </div>
  );
}
