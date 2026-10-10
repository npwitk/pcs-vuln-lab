import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowUpToLine, BadgeCheck, Percent } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const Body = styled.div`
  width: min(440px, calc(100vw - 6rem));
`;

const Title = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-right: 2rem;
  overflow-wrap: anywhere;
`;

const Points = styled.ul`
  list-style: none;
  margin: 0 0 1.25rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Point = styled.li`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.text};
  line-height: 1.5;

  svg {
    flex-shrink: 0;
    margin-top: 0.125rem;
    color: ${props => props.theme.colors.primary};
  }

  small {
    display: block;
    color: ${props => props.theme.colors.textSecondary};
    font-size: ${props => props.theme.typography.sizes.sm};
  }
`;

const Note = styled.p`
  font-size: ${props => props.theme.typography.sizes.sm};
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const baht = (n) => `฿${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Start or stop sponsoring one sheet, in place of the old window.confirm.
 * Spells out the fee as an amount on this sheet's own price, and explains
 * why an unapproved sheet can't be sponsored instead of just refusing.
 */
export default function SponsorDialog({ sheet, feePercent, onConfirm, onClose }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const price = parseFloat(sheet.price) || 0;
  const fee = Math.round(price * feePercent) / 100;
  const turningOff = !!sheet.is_sponsored;
  const approved = sheet.approval_status === 'approved';

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  let content;
  if (turningOff) {
    content = (
      <>
        <Title>{t('sellerSheets.sponsor.offTitle', { title: sheet.title })}</Title>
        <Note>{t('sellerSheets.sponsor.offBody', { percent: feePercent })}</Note>
        <Actions>
          <Button type="button" $size="sm" onClick={onClose} disabled={busy}>{t('sellerSheets.sponsor.keep')}</Button>
          <Button type="button" $size="sm" $variant="primary" onClick={confirm} disabled={busy}>
            {t('sellerSheets.sponsor.stop')}
          </Button>
        </Actions>
      </>
    );
  } else if (!approved) {
    content = (
      <>
        <Title><Sparkles size={20} />{t('sellerSheets.sponsor.title', { title: sheet.title })}</Title>
        <Note>{t('sellerSheets.sponsor.notApproved')}</Note>
        <Actions>
          <Button type="button" $size="sm" onClick={onClose}>{t('sellerSheets.sponsor.ok')}</Button>
        </Actions>
      </>
    );
  } else {
    content = (
      <>
        <Title><Sparkles size={20} />{t('sellerSheets.sponsor.title', { title: sheet.title })}</Title>
        <Points>
          <Point>
            <ArrowUpToLine size={18} />
            <div>
              {t('sellerSheets.sponsor.pinned')}
              <small>{t('sellerSheets.sponsor.pinnedHelp')}</small>
            </div>
          </Point>
          <Point>
            <BadgeCheck size={18} />
            <div>{t('sellerSheets.sponsor.badge')}</div>
          </Point>
          <Point>
            <Percent size={18} />
            <div>
              {t('sellerSheets.sponsor.fee', { percent: feePercent })}
              <small>
                {price > 0
                  ? t('sellerSheets.sponsor.feeExample', { fee: baht(fee), price: baht(price) })
                  : t('sellerSheets.sponsor.feeFree')}
              </small>
            </div>
          </Point>
        </Points>
        <Note>{t('sellerSheets.sponsor.anytime')}</Note>
        <Actions>
          <Button type="button" $size="sm" onClick={onClose} disabled={busy}>{t('sellerSheets.sponsor.cancel')}</Button>
          <Button type="button" $size="sm" $variant="primary" onClick={confirm} disabled={busy}>
            {t('sellerSheets.sponsor.confirm')}
          </Button>
        </Actions>
      </>
    );
  }

  return (
    <Modal onClose={busy ? () => {} : onClose}>
      <Body role="dialog" aria-modal="true">{content}</Body>
    </Modal>
  );
}
