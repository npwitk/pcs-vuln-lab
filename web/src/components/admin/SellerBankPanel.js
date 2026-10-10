import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { THAI_BANKS } from '../../constants/banks';
import BankLogo from '../BankLogo';

const Panel = styled.section`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: ${props => props.theme.radius.md};

  @media print {
    display: none;
  }
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;

  h3 {
    margin: 0;
    font-size: ${props => props.theme.typography.sizes.base};
    font-weight: ${props => props.theme.typography.weights.semibold};
    color: ${props => props.theme.colors.text};
  }
`;

const Current = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};

  strong {
    display: block;
    color: ${props => props.theme.colors.text};
    font-size: ${props => props.theme.typography.sizes.base};
  }
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 1rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.3125rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  grid-column: ${props => (props.$wide ? '1 / -1' : 'auto')};

  input, select {
    padding: 0.625rem 0.75rem;
    border: 1px solid ${props => props.$invalid ? props.theme.colors.error : props.theme.colors.border};
    border-radius: ${props => props.theme.radius.md};
    background: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text};
    font: inherit;
    font-weight: ${props => props.theme.typography.weights.regular};
  }

  small {
    font-weight: ${props => props.theme.typography.weights.regular};
    color: ${props => props.$invalid ? props.theme.colors.error : props.theme.colors.textSecondary};
  }
`;

const Actions = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 0.875rem;
  border-radius: ${props => props.theme.radius.md};
  border: 1px solid ${props => props.$primary ? props.theme.colors.primary : props.theme.colors.border};
  background: ${props => props.$primary ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.$primary ? '#fff' : props.theme.colors.text};
  font: inherit;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Note = styled.p`
  margin: 0.5rem 0 0;
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const digitsOnly = (v) => v.replace(/[\s-]/g, '');
const validNumber = (v) => /^\d{10,15}$/.test(digitsOnly(v));

const EMPTY = { bank_name: '', bank_account_name: '', bank_account_number: '', confirm: '', reason: '' };

/**
 * A seller's payout bank account, and the admin-side way to change it
 * (sellers can only request a change, from their Payouts page). The server
 * encrypts the new number and logs the change in admin_actions; only the
 * last 4 digits ever come back to the browser.
 */
export default function SellerBankPanel({ seller }) {
  const [bank, setBank] = useState(undefined); // undefined = loading, null = none on file
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setBank(undefined);
    setEditing(false);
    adminAPI.getSellerBank(seller.user_id)
      .then(res => { if (!cancelled) setBank(res.data.bank); })
      .catch(() => { if (!cancelled) setBank(null); });
    return () => { cancelled = true; };
  }, [seller.user_id]);

  const startEditing = () => {
    setForm({ ...EMPTY, bank_name: bank?.bank_name || '', bank_account_name: bank?.bank_account_name || '' });
    setAttempted(false);
    setEditing(true);
  };

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const errors = {
    bank_name: !form.bank_name,
    bank_account_name: !form.bank_account_name.trim(),
    bank_account_number: !validNumber(form.bank_account_number),
    confirm: digitsOnly(form.confirm) !== digitsOnly(form.bank_account_number),
    reason: !form.reason.trim(),
  };
  const show = (k) => attempted && errors[k];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAttempted(true);
    if (Object.values(errors).some(Boolean)) return;

    const last4 = digitsOnly(form.bank_account_number).slice(-4);
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Send ${seller.seller_name}'s payouts to ${form.bank_name} ··· ${last4} from now on?`)) return;

    setSaving(true);
    try {
      const res = await adminAPI.updateSellerBank(seller.user_id, {
        bank_name: form.bank_name,
        bank_account_name: form.bank_account_name.trim(),
        bank_account_number: digitsOnly(form.bank_account_number),
        reason: form.reason.trim(),
      });
      setBank(res.data.bank);
      setEditing(false);
      setForm(EMPTY);
      toast.success(`Bank details updated (··· ${res.data.bank.last4})`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update bank details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel aria-label="Payout bank account">
      <Head>
        <h3>Payout bank account</h3>
        {bank && !editing && <Button type="button" onClick={startEditing}>Update bank details</Button>}
      </Head>

      {bank === undefined ? (
        <Current>Loading…</Current>
      ) : bank === null ? (
        <Current>No approved seller application, so there's no bank account on file to update.</Current>
      ) : (
        <Current>
          <BankLogo bankName={bank.bank_name} size={36} />
          <div>
            <strong>{bank.bank_name}</strong>
            {bank.bank_account_name} · ··· {bank.last4}
          </div>
        </Current>
      )}

      {editing && (
        <Form onSubmit={handleSubmit} noValidate>
          <Field $invalid={show('bank_name')}>
            Bank
            <select value={form.bank_name} onChange={set('bank_name')}>
              <option value="">Select a bank</option>
              {THAI_BANKS.map(b => <option key={b.value} value={b.value}>{b.value}</option>)}
            </select>
          </Field>
          <Field $invalid={show('bank_account_name')}>
            Account holder name
            <input value={form.bank_account_name} onChange={set('bank_account_name')} autoComplete="off" />
          </Field>
          <Field $invalid={show('bank_account_number')}>
            New account number
            <input
              value={form.bank_account_number}
              onChange={set('bank_account_number')}
              inputMode="numeric"
              autoComplete="off"
              placeholder="10-15 digits"
            />
            {show('bank_account_number') && <small>Must be 10-15 digits.</small>}
          </Field>
          <Field $invalid={show('confirm')}>
            Type the number again
            <input
              value={form.confirm}
              onChange={set('confirm')}
              inputMode="numeric"
              autoComplete="off"
              onPaste={(e) => e.preventDefault()}
            />
            {show('confirm') && <small>Doesn't match the number above.</small>}
          </Field>
          <Field $wide $invalid={show('reason')}>
            Reason
            <input value={form.reason} onChange={set('reason')} placeholder="e.g. Support ticket #142, seller confirmed by LINE call" />
            <small>
              {show('reason')
                ? 'Add a reason, e.g. the support ticket number.'
                : 'Saved in the admin log with the old and new last 4 digits.'}
            </small>
          </Field>
          <Actions>
            <Button type="button" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" $primary disabled={saving}>{saving ? 'Saving…' : 'Save bank details'}</Button>
          </Actions>
        </Form>
      )}

      {!editing && bank && (
        <Note>Only the last 4 digits are shown. Check the seller's identity (e.g. through their support ticket) before changing where their money goes.</Note>
      )}
    </Panel>
  );
}
