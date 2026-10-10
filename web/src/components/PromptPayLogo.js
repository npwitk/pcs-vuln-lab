import React from 'react';
import styled from 'styled-components';

// The PromptPay logo: just the image (public/prompt-pay-logo.png), no badge
// behind it. Swap the PNG to change it everywhere.
const Img = styled.img`
  display: block;
  width: ${props => props.$width}px;
  height: auto;
`;

export default function PromptPayLogo({ width = 120, className }) {
  return <Img src="/prompt-pay-logo.png" alt="PromptPay" $width={width} className={className} />;
}
