import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { BadgePercent, Stamp, PackageCheck, Youtube, Unlock, Sparkles } from 'lucide-react';
import { sellerApplicationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { THAI_BANKS } from '../constants/banks';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background: ${props => props.theme.colors.background};
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.xl};
  padding: 2.5rem;
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border};

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.sizes['3xl']};
  margin-bottom: 0.5rem;
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 2rem;
  font-size: ${props => props.theme.typography.sizes.base};
  line-height: ${props => props.theme.typography.lineHeights.relaxed};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.sizes.sm};

  span {
    color: ${props => props.theme.colors.error};
  }
`;

const Input = styled.input`
  padding: 0.875rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  transition: all ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }

  &:disabled {
    background: ${props => props.theme.colors.backgroundSecondary};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const Select = styled.select`
  padding: 0.875rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }
`;

const TextArea = styled.textarea`
  padding: 0.875rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  transition: all ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }
`;

const HelpText = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.25rem;
`;

const Button = styled.button`
  padding: 0.875rem 2rem;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  background: ${props => props.theme.colors.primary};
  color: white;
  box-shadow: ${props => props.theme.shadows.sm};

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:disabled {
    background: ${props => props.theme.colors.textTertiary};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const StatusCard = styled.div`
  padding: 1.5rem;
  border-radius: ${props => props.theme.radius.lg};
  background: ${props => {
    if (props.status === 'pending') return props.theme.colors.warning + '20';
    if (props.status === 'approved') return props.theme.colors.success + '20';
    if (props.status === 'rejected') return props.theme.colors.error + '20';
    return props.theme.colors.backgroundSecondary;
  }};
  border: 1px solid ${props => {
    if (props.status === 'pending') return props.theme.colors.warning;
    if (props.status === 'approved') return props.theme.colors.success;
    if (props.status === 'rejected') return props.theme.colors.error;
    return props.theme.colors.border;
  }};
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: ${props => props.theme.radius.full};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  text-transform: uppercase;
  background: ${props => {
    if (props.status === 'pending') return props.theme.colors.warning;
    if (props.status === 'approved') return props.theme.colors.success;
    if (props.status === 'rejected') return props.theme.colors.error;
    return props.theme.colors.textTertiary;
  }};
  color: white;
`;

const FeeNotice = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.mode === 'dark' ? 'rgba(245,158,11,0.1)' : '#fffbeb'};
  border: 1px solid #f59e0b;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.text};
  line-height: ${props => props.theme.typography.lineHeights.relaxed};

  strong {
    font-weight: ${props => props.theme.typography.weights.semibold};
  }
`;

const BenefitsSection = styled.div`
  margin-bottom: 2.5rem;
`;

const BenefitsTitle = styled.h2`
  font-size: ${props => props.theme.typography.sizes.xl};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 1.25rem;
`;

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BenefitCard = styled.div`
  display: flex;
  gap: 0.875rem;
  padding: 1.25rem;
  border-radius: ${props => props.theme.radius.lg};
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
`;

const BenefitIconWrap = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.primaryLight};
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BenefitText = styled.div`
  h3 {
    font-size: ${props => props.theme.typography.sizes.base};
    font-weight: ${props => props.theme.typography.weights.semibold};
    color: ${props => props.theme.colors.text};
    margin-bottom: 0.25rem;
  }

  p {
    font-size: ${props => props.theme.typography.sizes.sm};
    color: ${props => props.theme.colors.textSecondary};
    line-height: ${props => props.theme.typography.lineHeights.relaxed};
  }
`;

// Text for each lives under applySeller.benefits.<key> in the locale files.
const SELLER_BENEFITS = [
  { key: 'protected', icon: Stamp },
  { key: 'distribution', icon: PackageCheck },
  { key: 'extras', icon: Youtube },
  { key: 'noContracts', icon: Unlock },
  { key: 'freeFeatures', icon: Sparkles },
];

const ApplyToBeSeller = () => {
  const { t } = useTranslation();
  const { user, isSeller } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);
  const [formData, setFormData] = useState({
    full_name: user?.name || '',
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
    phone_number: '',
    reason: ''
  });

  useEffect(() => {
    // Scroll to top when component mounts or route changes
    window.scrollTo(0, 0);

    // Redirect if already a seller
    if (isSeller) {
      toast.success(t('applySeller.toasts.alreadySeller'));
      navigate('/admin/upload');
      return;
    }

    // Check for existing application
    fetchExistingApplication();
  }, [isSeller, navigate]);

  const fetchExistingApplication = async () => {
    try {
      const response = await sellerApplicationAPI.getMy();
      setExistingApplication(response.data.application);
    } catch (error) {
      // No application found - that's okay
      if (error.response?.status !== 404) {
        console.error('Failed to fetch application:', error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.full_name || !formData.bank_name || !formData.bank_account_number || !formData.bank_account_name) {
      toast.error(t('applySeller.toasts.requiredFields'));
      return;
    }

    // Validate account number (digits only, reasonable length)
    const accountNumber = formData.bank_account_number.replace(/\s|-/g, '');
    if (!/^\d{10,15}$/.test(accountNumber)) {
      toast.error(t('applySeller.toasts.invalidAccount'));
      return;
    }

    setLoading(true);

    try {
      await sellerApplicationAPI.submit({
        ...formData,
        bank_account_number: accountNumber
      });

      toast.success(t('applySeller.toasts.submitted'));
      navigate('/');
    } catch (error) {
      console.error('Submit application error:', error);
      toast.error(error.response?.data?.message || t('applySeller.toasts.submitFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Show existing application status
  if (existingApplication) {
    return (
      <Container>
        <Card>
          <Title>{t('applySeller.status.title')}</Title>
          <Subtitle>{t('applySeller.status.subtitle')}</Subtitle>

          <StatusCard status={existingApplication.status}>
            <div style={{ marginBottom: '1rem' }}>
              <StatusBadge status={existingApplication.status}>
                {t(`applySeller.status.states.${existingApplication.status}`, { defaultValue: existingApplication.status })}
              </StatusBadge>
            </div>

            <FormGroup>
              <Label>{t('applySeller.fields.fullName')}</Label>
              <div>{existingApplication.full_name}</div>
            </FormGroup>

            <FormGroup>
              <Label>{t('applySeller.fields.bank')}</Label>
              <div>{(() => {
                const bank = THAI_BANKS.find(b => b.value === existingApplication.bank_name);
                return bank ? t(`applySeller.banks.${bank.key}`) : existingApplication.bank_name;
              })()}</div>
            </FormGroup>

            <FormGroup>
              <Label>{t('applySeller.fields.accountName')}</Label>
              <div>{existingApplication.bank_account_name}</div>
            </FormGroup>

            {existingApplication.phone_number && (
              <FormGroup>
                <Label>{t('applySeller.fields.phone')}</Label>
                <div>{existingApplication.phone_number}</div>
              </FormGroup>
            )}

            {existingApplication.reason && (
              <FormGroup>
                <Label>{t('applySeller.status.reason')}</Label>
                <div>{existingApplication.reason}</div>
              </FormGroup>
            )}

            <FormGroup>
              <Label>{t('applySeller.status.submittedAt')}</Label>
              <div>{new Date(existingApplication.submitted_at).toLocaleString()}</div>
            </FormGroup>

            {existingApplication.reviewed_at && (
              <FormGroup>
                <Label>{t('applySeller.status.reviewedAt')}</Label>
                <div>{new Date(existingApplication.reviewed_at).toLocaleString()}</div>
              </FormGroup>
            )}

            {existingApplication.admin_notes && (
              <FormGroup>
                <Label>{t('applySeller.status.adminNotes')}</Label>
                <div style={{
                  padding: '0.875rem',
                  background: 'rgba(0,0,0,0.05)',
                  borderRadius: '8px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {existingApplication.admin_notes}
                </div>
              </FormGroup>
            )}
          </StatusCard>

          {existingApplication.status === 'pending' && (
            <HelpText style={{ marginTop: '1rem', textAlign: 'center' }}>
              {t('applySeller.status.pendingNote')}
            </HelpText>
          )}

          {existingApplication.status === 'rejected' && (
            <HelpText style={{ marginTop: '1rem', textAlign: 'center', color: 'red' }}>
              {t('applySeller.status.rejectedNote')}
            </HelpText>
          )}
        </Card>
      </Container>
    );
  }

  // Show application form
  return (
    <Container>
      <Card>
        <Title>{t('applySeller.title')}</Title>
        <Subtitle>{t('applySeller.subtitle')}</Subtitle>

        <BenefitsSection>
          <BenefitsTitle>{t('applySeller.benefitsTitle')}</BenefitsTitle>
          <BenefitsGrid>
            {SELLER_BENEFITS.map(({ key, icon: Icon }) => (
              <BenefitCard key={key}>
                <BenefitIconWrap>
                  <Icon size={20} />
                </BenefitIconWrap>
                <BenefitText>
                  <h3>{t(`applySeller.benefits.${key}.title`)}</h3>
                  <p>{t(`applySeller.benefits.${key}.description`)}</p>
                </BenefitText>
              </BenefitCard>
            ))}
          </BenefitsGrid>
        </BenefitsSection>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>
              {t('applySeller.fields.fullName')} <span>*</span>
            </Label>
            <Input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              disabled
              required
            />
            <HelpText>{t('applySeller.fields.fullNameHelp')}</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>
              {t('applySeller.fields.bankName')} <span>*</span>
            </Label>
            <Select
              name="bank_name"
              aria-label={t('applySeller.fields.bankName')}
              value={formData.bank_name}
              onChange={handleInputChange}
              required
            >
              <option value="">{t('applySeller.fields.bankPlaceholder')}</option>
              {THAI_BANKS.map(bank => (
                <option key={bank.value} value={bank.value}>{t(`applySeller.banks.${bank.key}`)}</option>
              ))}
            </Select>
            <HelpText>{t('applySeller.fields.bankHelp')}</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>
              {t('applySeller.fields.accountNumber')} <span>*</span>
            </Label>
            <Input
              type="text"
              name="bank_account_number"
              placeholder="1234567890"
              value={formData.bank_account_number}
              onChange={handleInputChange}
              maxLength="20"
              required
            />
            <HelpText>{t('applySeller.fields.accountNumberHelp')}</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>
              {t('applySeller.fields.accountName')} <span>*</span>
            </Label>
            <Input
              type="text"
              name="bank_account_name"
              placeholder={t('applySeller.fields.accountNamePlaceholder')}
              value={formData.bank_account_name}
              onChange={handleInputChange}
              required
            />
            <HelpText>{t('applySeller.fields.accountNameHelp')}</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>{t('applySeller.fields.phone')}</Label>
            <Input
              type="tel"
              name="phone_number"
              placeholder="0812345678"
              value={formData.phone_number}
              onChange={handleInputChange}
              maxLength="15"
            />
            <HelpText>{t('applySeller.fields.phoneHelp')}</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>{t('applySeller.fields.reason')}</Label>
            <TextArea
              name="reason"
              placeholder={t('applySeller.fields.reasonPlaceholder')}
              value={formData.reason}
              onChange={handleInputChange}
            />
            <HelpText>{t('applySeller.fields.reasonHelp')}</HelpText>
          </FormGroup>

          <FeeNotice>
            <BadgePercent size={16} style={{ flexShrink: 0, marginTop: '0.125rem', color: '#f59e0b' }} />
            <span>
              <strong>{t('applySeller.fee.title')}</strong> {t('applySeller.fee.body')}
            </span>
          </FeeNotice>

          <Button type="submit" disabled={loading}>
            {loading ? t('applySeller.submitting') : t('applySeller.submit')}
          </Button>

          <HelpText style={{ textAlign: 'center' }}>
            {t('applySeller.terms')}
          </HelpText>
        </Form>
      </Card>
    </Container>
  );
};

export default ApplyToBeSeller;
