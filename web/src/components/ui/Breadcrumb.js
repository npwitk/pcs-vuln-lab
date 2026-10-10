import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { ChevronRight, MoreHorizontal } from 'lucide-react';

// Breadcrumb trail, modelled on shadcn/ui's Breadcrumb (same pieces, same
// composition) but in styled-components with the site theme and
// react-router links:
//
//   <Breadcrumb>
//     <BreadcrumbList>
//       <BreadcrumbItem><BreadcrumbLink to="/">Home</BreadcrumbLink></BreadcrumbItem>
//       <BreadcrumbSeparator />
//       <BreadcrumbItem><BreadcrumbPage>Breadcrumb</BreadcrumbPage></BreadcrumbItem>
//     </BreadcrumbList>
//   </Breadcrumb>
//
// For the usual case, <Breadcrumbs items={[{ label, to }, ...]} /> builds the
// whole thing, the last item being the current page.

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export const Breadcrumb = styled.nav.attrs(props => ({ 'aria-label': props['aria-label'] || 'Breadcrumb' }))`
  margin-bottom: 1rem;
  min-width: 0;
`;

export const BreadcrumbList = styled.ol`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  word-break: break-word;
`;

export const BreadcrumbItem = styled.li`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
`;

export const BreadcrumbLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  transition: color ${props => props.theme.transitions.fast};

  &:hover {
    color: ${props => props.theme.colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
    border-radius: ${props => props.theme.radius.sm};
  }
`;

// The current page: not a link. Long titles truncate to one line.
export const BreadcrumbPage = styled.span.attrs({ 'aria-current': 'page' })`
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: min(60vw, 32rem);
`;

const SeparatorItem = styled.li`
  display: inline-flex;
  align-items: center;
  opacity: 0.7;

  svg {
    width: 14px;
    height: 14px;
  }
`;

// A chevron by default; pass children for a custom separator.
export function BreadcrumbSeparator({ children, ...props }) {
  return (
    <SeparatorItem role="presentation" aria-hidden="true" {...props}>
      {children ?? <ChevronRight />}
    </SeparatorItem>
  );
}

const EllipsisBox = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
`;

// Stands in for collapsed items.
export function BreadcrumbEllipsis(props) {
  return (
    <EllipsisBox role="presentation" {...props}>
      <MoreHorizontal size={16} aria-hidden="true" />
      <VisuallyHidden>More</VisuallyHidden>
    </EllipsisBox>
  );
}

const EllipsisButton = styled.button`
  display: inline-flex;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
  border-radius: ${props => props.theme.radius.sm};

  &:hover {
    color: ${props => props.theme.colors.text};
    background: ${props => props.theme.colors.backgroundSecondary};
  }
`;

// items: [{ label, to }]; the last one is the current page (its `to` is
// ignored), and a middle item without `to` shows as plain text. With more than maxItems, the middle ones fold into "…", which
// expands on click.
export function Breadcrumbs({ items, maxItems = 4, className }) {
  const [expanded, setExpanded] = useState(false);
  if (!items || items.length === 0) return null;

  const collapse = !expanded && items.length > maxItems;
  const shown = collapse
    ? [items[0], { ellipsis: true }, ...items.slice(items.length - (maxItems - 2))]
    : items;

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {shown.map((item, i) => {
          const isLast = i === shown.length - 1;
          return (
            <React.Fragment key={item.ellipsis ? 'ellipsis' : `${i}-${item.label}`}>
              <BreadcrumbItem>
                {item.ellipsis ? (
                  <EllipsisButton type="button" onClick={() => setExpanded(true)} aria-label="Show full path">
                    <BreadcrumbEllipsis />
                  </EllipsisButton>
                ) : isLast ? (
                  <BreadcrumbPage title={item.label}>{item.label}</BreadcrumbPage>
                ) : !item.to ? (
                  <span>{item.label}</span>
                ) : (
                  <BreadcrumbLink to={item.to}>{item.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default Breadcrumbs;
