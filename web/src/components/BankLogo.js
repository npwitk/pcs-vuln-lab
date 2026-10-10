import React from 'react';
import styled from 'styled-components';
import { Landmark } from 'lucide-react';
import bbl from '../assets/banks/bbl.svg';
import kbank from '../assets/banks/kbank.svg';
import scb from '../assets/banks/scb.svg';
import ktb from '../assets/banks/ktb.svg';
import bay from '../assets/banks/bay.svg';
import ttb from '../assets/banks/ttb.svg';
import gsb from '../assets/banks/gsb.svg';
import cimb from '../assets/banks/cimb.svg';
import uob from '../assets/banks/uob.svg';
import tbank from '../assets/banks/tbank.svg';
import sc from '../assets/banks/sc.svg';
import icbc from '../assets/banks/icbc.svg';

// Thai bank marks from Omise's banks-logo (MIT, see assets/banks/LICENSE):
// white marks drawn on a circle of the bank's brand colour, which keeps them
// readable on both light and dark backgrounds.
//
// Keyed by the English value stored on seller_applications.bank_name (the
// options in pages/ApplyToBeSeller.js). `i18n` is that bank's key under
// applySeller.banks, for its localized name.
const BANKS = {
  'Bangkok Bank': { logo: bbl, color: '#1e4598', i18n: 'bangkok' },
  'Kasikornbank (K-Bank)': { logo: kbank, color: '#138f2d', i18n: 'kbank' },
  'Siam Commercial Bank (SCB)': { logo: scb, color: '#4e2e7f', i18n: 'scb' },
  'Krung Thai Bank': { logo: ktb, color: '#1ba5e1', i18n: 'krungthai' },
  'Bank of Ayudhya (Krungsri)': { logo: bay, color: '#fec43b', i18n: 'krungsri' },
  // TMB merged into ttb in 2021, so it shows ttb's mark. The source set lists
  // ttb's colour as a near-white, which hides its white mark on light pages;
  // ttb's navy is used instead.
  'TMB Bank': { logo: ttb, color: '#0b2a6b', i18n: 'tmb' },
  'Government Savings Bank': { logo: gsb, color: '#eb198d', i18n: 'gsb' },
  'CIMB Thai Bank': { logo: cimb, color: '#7e2f36', i18n: 'cimb' },
  'United Overseas Bank (UOB)': { logo: uob, color: '#0b3979', i18n: 'uob' },
  'Thanachart Bank': { logo: tbank, color: '#fc4f1f', i18n: 'thanachart' },
  'Standard Chartered Bank': { logo: sc, color: '#0f6ea1', i18n: 'standardChartered' },
  'ICBC (Thai)': { logo: icbc, color: '#c50f1c', i18n: 'icbc' },
};

export const bankInfo = (bankName) => BANKS[bankName] || null;

/** The bank's name in the current language, falling back to what's stored. */
export const localizedBankName = (bankName, t) => {
  const info = BANKS[bankName];
  return info ? t(`applySeller.banks.${info.i18n}`, { defaultValue: bankName }) : bankName;
};

const Circle = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border-radius: 50%;
  background: ${props => props.$color || props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.textSecondary};
  border: ${props => (props.$color ? 'none' : `1px solid ${props.theme.colors.border}`)};
  vertical-align: middle;

  img {
    width: 68%;
    height: 68%;
    object-fit: contain;
  }
`;

/**
 * A bank's logo as a coloured circle. Unknown banks (or "Other") get a
 * neutral circle with a generic bank icon. Decorative: the bank's name is
 * always shown as text next to it.
 */
export default function BankLogo({ bankName, size = 36 }) {
  const info = BANKS[bankName];
  return (
    <Circle $size={size} $color={info?.color} aria-hidden="true">
      {info
        ? <img src={info.logo} alt="" loading="lazy" decoding="async" />
        : <Landmark size={Math.round(size * 0.5)} />}
    </Circle>
  );
}
