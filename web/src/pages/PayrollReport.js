import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { payrollAPI } from '../services/api';
import PeanutIcon from '../components/PeanutIcon';
import styled, { createGlobalStyle } from 'styled-components';

const PrintHide = createGlobalStyle`
  @media print {
    .no-print { display: none !important; }
    body { background: white; }
  }
`;

// ── Layout ──────────────────────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  padding: 32px 16px 64px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: #1a1a1a;

  @media print {
    background: white;
    padding: 0;
  }
`;

const Card = styled.div`
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  overflow: hidden;

  @media print {
    box-shadow: none;
    border-radius: 0;
    max-width: 100%;
  }
`;

// ── Header ───────────────────────────────────────────────────────────────────
const Header = styled.div`
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 28px 36px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;

  @media (max-width: 600px) {
    flex-direction: column;
    padding: 20px 20px;
  }
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StyledPeanutIcon = styled(PeanutIcon)`
  width: 32px;
  height: 32px;
  fill: white;
  flex-shrink: 0;
`;

const Logo = styled.div`
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
`;


const HeaderRight = styled.div`
  text-align: right;

  @media (max-width: 600px) {
    text-align: left;
  }
`;

const ReportTitle = styled.div`
  font-size: 20px;
  font-weight: 700;
`;

const ReportMeta = styled.div`
  font-size: 12px;
  opacity: 0.85;
  margin-top: 4px;
`;

// ── Info Grid ────────────────────────────────────────────────────────────────
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border-bottom: 2px solid #f3f4f6;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const InfoBlock = styled.div`
  padding: 24px 36px;
  border-right: ${p => p.$last ? 'none' : '1px solid #f3f4f6'};

  @media (max-width: 600px) {
    padding: 20px 20px;
    border-right: none;
    border-bottom: 1px solid #f3f4f6;
    &:last-child { border-bottom: none; }
  }
`;

const InfoLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
  margin-bottom: 14px;
`;

const InfoRow = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

const InfoKey = styled.span`
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 2px;
`;

const InfoVal = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
`;

// ── Table ─────────────────────────────────────────────────────────────────────
const TableSection = styled.div`
  padding: 28px 36px;
  overflow-x: auto;

  @media (max-width: 600px) {
    padding: 20px 20px;
  }
`;

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
  margin-bottom: 16px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const Th = styled.th`
  text-align: ${p => p.$right ? 'right' : 'left'};
  padding: 10px 12px;
  background: #f9fafb;
  color: #6b7280;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e5e7eb;

  &:first-child { border-radius: 6px 0 0 0; }
  &:last-child  { border-radius: 0 6px 0 0; }
`;

const Td = styled.td`
  padding: 12px 12px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
  text-align: ${p => p.$right ? 'right' : 'left'};
  color: ${p => p.$muted ? '#6b7280' : 'inherit'};
`;

const TdSmall = styled.span`
  display: block;
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
`;

const DiscountBadge = styled.span`
  display: inline-block;
  background: #dcfce7;
  color: #16a34a;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
`;

const NoBadge = styled.span`
  color: #d1d5db;
  font-size: 12px;
`;

// ── Summary ──────────────────────────────────────────────────────────────────
const SummaryBox = styled.div`
  margin: 0 36px 28px;
  background: #f9fafb;
  border-radius: 10px;
  padding: 22px 28px;
  border: 1px solid #e5e7eb;

  @media (max-width: 600px) {
    margin: 0 20px 24px;
    padding: 18px 16px;
  }
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 14px;
  color: ${p => p.$muted ? '#6b7280' : '#111827'};
`;

const SummaryDivider = styled.div`
  border-top: 1px solid #e5e7eb;
  margin: 10px 0;
`;

const NetRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0 4px;
  font-size: 18px;
  font-weight: 800;
  color: #111827;
`;

const AmtGreen = styled.span`
  color: #16a34a;
  font-weight: 700;
`;

const AmtRed = styled.span`
  color: #dc2626;
  font-weight: 700;
`;


const EyeToggle = styled.button`
  background: none;
  border: none;
  padding: 0 0 0 8px;
  cursor: pointer;
  color: #6b7280;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  line-height: 1;
  &:hover { color: #111827; }
`;

// ── State pages ──────────────────────────────────────────────────────────────
const Center = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
  gap: 16px;
  color: #6b7280;
  font-size: 16px;
`;

// ── Helpers ──────────────────────────────────────────────────────────────────
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function fmt(n) {
  return Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const BKK = { timeZone: 'Asia/Bangkok' };

// MySQL datetime strings have no timezone suffix, so new Date() treats them as
// local time. Append 'Z' to force UTC interpretation before converting to BKK.
function toUTC(d) {
  if (!d) return null;
  const s = String(d);
  return new Date(s.endsWith('Z') || s.includes('+') ? s : s.replace(' ', 'T') + 'Z');
}

function fmtDate(d) {
  const dt = toUTC(d);
  if (!dt) return '—';
  const date = dt.toLocaleDateString('en-GB', { ...BKK, day: '2-digit', month: 'short', year: 'numeric' });
  const time = dt.toLocaleTimeString('en-GB', { ...BKK, hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} at ${time}`;
}

function fmtDateParts(d) {
  const dt = toUTC(d);
  if (!dt) return { date: '—', time: '' };
  return {
    date: dt.toLocaleDateString('en-GB', { ...BKK, day: '2-digit', month: 'short', year: 'numeric' }),
    time: dt.toLocaleTimeString('en-GB', { ...BKK, hour: '2-digit', minute: '2-digit', hour12: false }),
  };
}


// ── Component ────────────────────────────────────────────────────────────────
export default function PayrollReport() {
  const { token } = useParams();
  const [data, setData]       = useState(null);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAccNum, setShowAccNum] = useState(false);

  useEffect(() => {
    payrollAPI.getReport(token)
      .then(r => {
        const d = r.data;
        if (!d || !d.payroll) {
          setError('Invalid response from server');
        } else {
          setData(d);
        }
      })
      .catch(e => setError(e.response?.data?.error || 'Failed to load report'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <Page>
        <Center>Loading payroll report…</Center>
      </Page>
    );
  }

  if (error || !data || !data.payroll) {
    return (
      <Page>
        <Center>
          <div style={{ fontSize: 48 }}>🔒</div>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#1a1a1a' }}>Invalid Payroll Link</div>
          <div>{error || 'This payroll link is invalid or expired.'}</div>
        </Center>
      </Page>
    );
  }

  const { payroll, seller, bank_info, transactions, summary } = data;
  const monthLabel = `${MONTH_NAMES[(payroll.month ?? 1) - 1]} ${payroll.year}`;

  return (
    <>
      <PrintHide />
      <Page>
        <Card>
          {/* ── Header ── */}
          <Header>
            <div>
              <LogoRow>
                <StyledPeanutIcon />
                <Logo>Peanut Cheat Sheets</Logo>
              </LogoRow>
            </div>
            <HeaderRight>
              <ReportTitle>PAYROLL REPORT</ReportTitle>
              <ReportMeta>{monthLabel}</ReportMeta>
              <ReportMeta>Generated {fmtDate(payroll.generated_at)}</ReportMeta>
              <ReportMeta>by {payroll.generated_by_name}</ReportMeta>
            </HeaderRight>
          </Header>

          {/* ── Seller + Bank ── */}
          <InfoGrid>
            <InfoBlock>
              <InfoLabel>Seller Information</InfoLabel>
              <InfoRow>
                <InfoKey>Name</InfoKey>
                <InfoVal>{seller.name}</InfoVal>
              </InfoRow>
              <InfoRow>
                <InfoKey>Email</InfoKey>
                <InfoVal>{seller.email}</InfoVal>
              </InfoRow>
            </InfoBlock>
            <InfoBlock $last>
              <InfoLabel>Bank Transfer Details</InfoLabel>
              {bank_info ? (
                <>
                  <InfoRow>
                    <InfoKey>Bank</InfoKey>
                    <InfoVal>{bank_info.bank_name || '—'}</InfoVal>
                  </InfoRow>
                  <InfoRow>
                    <InfoKey>Account Name</InfoKey>
                    <InfoVal>{bank_info.bank_account_name || '—'}</InfoVal>
                  </InfoRow>
                  <InfoRow>
                    <InfoKey>Account Number</InfoKey>
                    <InfoVal>
                      {bank_info.bank_account_number
                        ? (showAccNum ? bank_info.bank_account_number : '•'.repeat((bank_info.bank_account_number || '').length))
                        : '—'}
                      {bank_info.bank_account_number && (
                        <EyeToggle
                          type="button"
                          aria-label={showAccNum ? 'Hide account number' : 'Show account number'}
                          onClick={() => setShowAccNum(v => !v)}
                        >
                          {showAccNum ? <EyeOff size={15} /> : <Eye size={15} />}
                        </EyeToggle>
                      )}
                    </InfoVal>
                  </InfoRow>
                  {bank_info.phone_number && (
                    <InfoRow>
                      <InfoKey>Phone (PromptPay)</InfoKey>
                      <InfoVal>{bank_info.phone_number}</InfoVal>
                    </InfoRow>
                  )}
                </>
              ) : (
                <InfoVal style={{ color: '#9ca3af', fontWeight: 400 }}>No bank info on file</InfoVal>
              )}
            </InfoBlock>
          </InfoGrid>

          {/* ── Transactions ── */}
          <TableSection>
            <SectionTitle>Transactions — {monthLabel}</SectionTitle>
            {transactions.length === 0 ? (
              <div style={{ color: '#9ca3af', padding: '24px 0', textAlign: 'center' }}>
                No paid transactions this month
              </div>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>#</Th>
                    <Th>Cheat Sheet</Th>
                    <Th $right>Sold At</Th>
                    <Th $right>Buyer Paid</Th>
                    <Th $right>Discount Refund</Th>
                    <Th $right>Amount Due</Th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => {
                    const discountRefund = parseFloat(t.discount_amount || 0);
                    const amountDue      = parseFloat(t.original_price || t.payment_amount);
                    return (
                      <tr key={t.order_id}>
                        <Td $muted>{i + 1}</Td>
                        <Td>
                          <span style={{ fontWeight: 600 }}>{t.title}</span>
                          <TdSmall>{t.course_code}</TdSmall>
                        </Td>
                        <Td $right>
                          {(() => { const { date, time } = fmtDateParts(t.payment_completed_at); return <><span>{date}</span><TdSmall>{time}</TdSmall></>; })()}
                        </Td>
                        <Td $right>{fmt(t.payment_amount)} ฿</Td>
                        <Td $right>
                          {discountRefund > 0
                            ? <DiscountBadge>+{fmt(discountRefund)} ฿</DiscountBadge>
                            : <NoBadge>—</NoBadge>
                          }
                        </Td>
                        <Td $right style={{ fontWeight: 600 }}>{fmt(amountDue)} ฿</Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </TableSection>

          {/* ── Summary ── */}
          <SummaryBox>
            <SectionTitle>Summary</SectionTitle>
            <SummaryRow $muted>
              <span>Total Collected from Buyers</span>
              <span>{fmt(summary.total_collected)} ฿</span>
            </SummaryRow>
            {summary.total_discount_refund > 0 && (
              <SummaryRow>
                <span>+ Bundle Discount Refund</span>
                <AmtGreen>+{fmt(summary.total_discount_refund)} ฿</AmtGreen>
              </SummaryRow>
            )}
            <SummaryRow>
              <span>= Total Due to Seller</span>
              <span style={{ fontWeight: 700 }}>{fmt(summary.total_due_to_seller)} ฿</span>
            </SummaryRow>
            <SummaryDivider />
            <SummaryRow $muted>
              <span>− Commission ({payroll.commission_percentage}%)</span>
              <AmtRed>−{fmt(summary.commission_amount)} ฿</AmtRed>
            </SummaryRow>
            {summary.total_sponsorship_fee > 0 && (
              <SummaryRow $muted>
                <span>− Sponsorship Fees</span>
                <AmtRed>−{fmt(summary.total_sponsorship_fee)} ฿</AmtRed>
              </SummaryRow>
            )}
            <SummaryDivider />
            <NetRow>
              <span>NET PAYABLE</span>
              <span>{fmt(summary.net_payable)} ฿</span>
            </NetRow>
          </SummaryBox>

        </Card>
      </Page>
    </>
  );
}
