import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: ${props => props.theme.colors.backgroundSecondary};
  }

  &:focus:not(:disabled) {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }
`;

const HelpText = styled.p`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.5rem;
`;

const SaveButton = styled.button`
  padding: 0.75rem 2rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const ToggleLabel = styled.div`
  flex: 1;
`;

const ToggleTitle = styled.h3`
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.25rem;
`;

const ToggleDescription = styled.p`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  line-height: ${props => props.theme.typography.lineHeights.relaxed};
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  flex-shrink: 0;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: ${props => props.theme.colors.success};
  }

  &:checked + span:before {
    transform: translateX(24px);
  }

  &:focus + span {
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme.colors.borderLight};
  transition: all ${props => props.theme.transitions.normal};
  border-radius: 28px;

  &:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: all ${props => props.theme.transitions.normal};
    border-radius: 50%;
  }

  &:hover {
    background-color: ${props => props.theme.colors.border};
  }
`;

const WarningBox = styled.div`
  background: ${props => props.theme.colors.warningLight || '#fff3cd'};
  border: 1px solid ${props => props.theme.colors.warning};
  border-radius: ${props => props.theme.radius.md};
  padding: 1rem;
  margin-top: 1rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.text};
  line-height: ${props => props.theme.typography.lineHeights.relaxed};
`;

const InfoBox = styled(WarningBox)`
  background: ${props => props.theme.colors.successLight || '#e8f8ed'};
  border-color: ${props => props.theme.colors.success};
`;

// Site-wide payment settings (Stripe rail on/off, sponsorship fee). Lives on
// the admin dashboard next to Pending Payment Approvals; moved out of the
// personal Settings page. `onStripeChange` lets the dashboard keep its
// "Stripe payments are off" banner in sync.
const PaymentSettingsPanel = ({ onStripeChange }) => {
  const { t } = useTranslation();
  const [stripePaymentsEnabled, setStripePaymentsEnabled] = useState(false);
  // The server reports whether it actually holds Stripe credentials.
  const [stripeConfigured, setStripeConfigured] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [sponsorshipFeePercent, setSponsorshipFeePercent] = useState('5');
  const [savingSponsorshipFee, setSavingSponsorshipFee] = useState(false);

  useEffect(() => {
    fetchAdminSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAdminSettings = async () => {
    try {
      setLoadingSettings(true);
      const response = await adminAPI.getSettings();
      setStripePaymentsEnabled(response.data.stripe_payments_enabled);
      setStripeConfigured(response.data.stripe_configured);
      setSponsorshipFeePercent(String(response.data.sponsorship_fee_percent ?? 5));
    } catch (error) {
      console.error('Failed to fetch admin settings:', error);
      toast.error(t('settings.toasts.loadAdminSettingsFailed'));
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleToggleStripe = async (enabled) => {
    try {
      const response = await adminAPI.updateSettings({ stripe_payments_enabled: enabled });
      setStripePaymentsEnabled(response.data.stripe_payments_enabled);
      setStripeConfigured(response.data.stripe_configured);
      onStripeChange?.(response.data.stripe_payments_enabled);

      if (enabled && !response.data.stripe_configured) {
        toast.error(t('settings.toasts.stripeSavedNoKey'));
      } else {
        toast.success(enabled ? t('settings.toasts.stripeEnabled') : t('settings.toasts.stripeDisabled'));
      }
    } catch (error) {
      console.error('Failed to update Stripe setting:', error);
      toast.error(t('settings.toasts.updateSettingFailed'));
    }
  };

  const handleSaveSponsorshipFee = async () => {
    const feePercent = parseFloat(sponsorshipFeePercent);
    if (isNaN(feePercent) || feePercent < 0 || feePercent > 100) {
      toast.error('Sponsorship fee must be a number between 0 and 100');
      return;
    }

    setSavingSponsorshipFee(true);
    try {
      const response = await adminAPI.updateSettings({ sponsorship_fee_percent: feePercent });
      setSponsorshipFeePercent(String(response.data.sponsorship_fee_percent));
      toast.success('Sponsorship fee updated');
    } catch (error) {
      console.error('Failed to update sponsorship fee:', error);
      toast.error(t('settings.toasts.updateSettingFailed'));
    } finally {
      setSavingSponsorshipFee(false);
    }
  };

  return (
    <>
      <ToggleContainer>
        <ToggleLabel>
          <ToggleTitle>{t('settings.stripePayments')}</ToggleTitle>
          <ToggleDescription>
            {t('settings.stripePaymentsDescription')}
          </ToggleDescription>
        </ToggleLabel>
        <ToggleSwitch>
          <ToggleInput
            type="checkbox"
            checked={stripePaymentsEnabled}
            onChange={(e) => handleToggleStripe(e.target.checked)}
            disabled={loadingSettings}
          />
          <ToggleSlider />
        </ToggleSwitch>
      </ToggleContainer>

      {stripePaymentsEnabled ? (
        <InfoBox>
          <strong>{t('settings.stripeOnTitle')}</strong> {t('settings.stripeOnDescription')}
        </InfoBox>
      ) : (
        <WarningBox>
          <strong>{t('settings.stripeOffTitle')}</strong> {t('settings.stripeOffDescription')}
          {!stripeConfigured && ' ' + t('settings.stripeNotConfigured')}
        </WarningBox>
      )}

      <FormGroup style={{ marginTop: '1.5rem' }}>
        <Label>Sponsorship fee (%)</Label>
        <Input
          type="number"
          min="0"
          max="100"
          step="0.5"
          value={sponsorshipFeePercent}
          onChange={(e) => setSponsorshipFeePercent(e.target.value)}
          disabled={loadingSettings}
        />
        <HelpText>
          Percent of each sale set aside when a seller's cheat sheet is sponsored — charged
          automatically the moment the sale completes, and subtracted from what the seller is
          owed on their next payout.
        </HelpText>
      </FormGroup>
      <SaveButton onClick={handleSaveSponsorshipFee} disabled={savingSponsorshipFee || loadingSettings}>
        {savingSponsorshipFee ? 'Saving...' : 'Save Sponsorship Fee'}
      </SaveButton>
    </>
  );
};

export default PaymentSettingsPanel;
