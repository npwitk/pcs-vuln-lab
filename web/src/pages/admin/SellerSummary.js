import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import SellerBankPanel from '../../components/admin/SellerBankPanel';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background: ${props => props.theme.colors.background};

  @media print {
    display: none;
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.sizes['3xl']};
  margin-bottom: 0.5rem;
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.base};
`;

const MonthNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.xl};
  box-shadow: ${props => props.theme.shadows.md};
`;

const NavButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MonthDisplay = styled.div`
  flex: 1;
  text-align: center;
  font-size: ${props => props.theme.typography.sizes.xl};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
`;

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const SummaryCard = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: 1.5rem;
  border-radius: ${props => props.theme.radius.xl};
  box-shadow: ${props => props.theme.shadows.md};

  @media print {
    background: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: none;
    page-break-inside: avoid;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
`;

const CardLabel = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
`;

const CardValue = styled.div`
  font-size: ${props => props.theme.typography.sizes['2xl']};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.primary};
`;

const Table = styled.table`
  width: 100%;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.xl};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.md};
  border-collapse: collapse;

  @media print {
    background: white;
    border-radius: 0;
    box-shadow: none;
    border: 1px solid #ddd;
    page-break-inside: auto;
  }
`;

const Thead = styled.thead`
  background: ${props => props.theme.colors.backgroundSecondary};

  @media print {
    background: #f8f9fa !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
`;

const Th = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.sizes.sm};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid ${props => props.theme.colors.border};
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transition: background ${props => props.theme.transitions.fast};
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
  }

  &:last-child {
    border-bottom: none;
  }

  @media print {
    page-break-inside: avoid;
    border-bottom: 1px solid #ddd;
  }
`;

const Td = styled.td`
  padding: 1rem;
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.sizes.sm};
`;

const SellerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background: ${props => props.theme.colors.backgroundSecondary};
`;

const AvatarFallback = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.weights.semibold};
  font-size: ${props => props.theme.typography.sizes.sm};
`;

const SellerDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const SellerName = styled.div`
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
`;

const SellerEmail = styled.div`
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme.colors.textSecondary};
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;

  @media print {
    position: static;
    background: none;
    padding: 0;
  }
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.xl};
  padding: 2rem;
  max-width: 1000px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${props => props.theme.shadows.xl};

  @media print {
    background: white;
    border-radius: 0;
    padding: 0;
    max-width: 100%;
    max-height: none;
    overflow-y: visible;
    box-shadow: none;
    page-break-after: always;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};

  @media print {
    display: none;
  }
`;

const ModalTitle = styled.h2`
  font-size: ${props => props.theme.typography.sizes.xl};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  transition: color ${props => props.theme.transitions.fast};

  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const ModalBody = styled.div`
  margin-bottom: 1.5rem;
`;

const TransactionTable = styled(Table)`
  margin-top: 1rem;
`;

const TransactionSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const SaveRateButton = styled.button`
  margin-top: 0.75rem;
  padding: 0.5rem 0.875rem;
  border-radius: ${props => props.theme.radius.md};
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.semibold};
  font-size: ${props => props.theme.typography.sizes.sm};
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CommissionInput = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: ${props => props.theme.colors.backgroundSecondary || '#f8f9fa'};
  border-radius: ${props => props.theme.radius.md};

  label {
    display: block;
    font-weight: ${props => props.theme.typography.weights.semibold};
    margin-bottom: 0.5rem;
    color: ${props => props.theme.colors.text};
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.radius.md};
    font-size: ${props => props.theme.typography.sizes.base};
    background: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text};

    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.primary};
    }
  }

  @media print {
    display: none;
  }
`;

const HelpText = styled.p`
  margin-top: 0.5rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const GeneratePDFButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.colors.success || '#10b981'};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  margin-right: 0.5rem;

  &:hover {
    background: ${props => props.theme.colors.successHover || '#059669'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media print {
    display: none;
  }
`;

const PrintButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: ${props => props.theme.typography.sizes.sm};

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }

  @media print {
    display: none;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme.colors.border};

  @media print {
    display: none;
  }
`;

const PrintHeader = styled.div`
  display: none;

  @media print {
    display: block;
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #333;
  }
`;

const PrintLogo = styled.img`
  display: none;

  @media print {
    display: block;
    width: 80px;
    height: auto;
    margin: 0 auto 1rem;
  }
`;

const PrintTitle = styled.h1`
  display: none;

  @media print {
    display: block;
    font-size: 24px;
    margin-bottom: 0.5rem;
    color: #333;
  }
`;

const PrintSubtitle = styled.p`
  display: none;

  @media print {
    display: block;
    font-size: 14px;
    color: #666;
    margin-bottom: 0.25rem;
  }
`;

const PrintDate = styled.p`
  display: none;

  @media print {
    display: block;
    font-size: 12px;
    color: #999;
  }
`;

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
};

const SellerSummary = () => {
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  // Modal state
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionSummary, setTransactionSummary] = useState(null);

  // PDF generation state
  const [commissionPercentage, setCommissionPercentage] = useState(10);
  const [savingRate, setSavingRate] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Payroll state
  const [isGeneratingPayroll, setIsGeneratingPayroll] = useState(false);
  const [generatedPayrollUrl, setGeneratedPayrollUrl] = useState(null);
  const [generatedPayrollToken, setGeneratedPayrollToken] = useState(null);
  const [pastPayrolls, setPastPayrolls] = useState([]);
  const [loadingPayrolls, setLoadingPayrolls] = useState(false);
  const [sendingEmailToken, setSendingEmailToken] = useState(null);

  useEffect(() => {
    fetchSellerSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear, currentMonth]);

  const fetchSellerSummary = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSellerSummary({
        year: currentYear,
        month: currentMonth
      });
      setSellers(response.data.sellers);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Failed to fetch seller summary:', error);
      toast.error('Failed to load seller summary');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSaveRate = async () => {
    if (!selectedSeller) return;
    setSavingRate(true);
    try {
      await adminAPI.setSellerCommission(selectedSeller.user_id, commissionPercentage);
      const updated = { ...selectedSeller, commission_percentage: commissionPercentage };
      setSelectedSeller(updated);
      setSellers(prev => prev.map(s => (s.user_id === updated.user_id ? { ...s, commission_percentage: commissionPercentage } : s)));
      toast.success(`Saved ${commissionPercentage}% as ${selectedSeller.seller_name}'s rate`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save rate');
    } finally {
      setSavingRate(false);
    }
  };

  const openTransactionModal = async (seller) => {
    setSelectedSeller(seller);
    // Start from the seller's saved rate (NULL = platform default 10%).
    setCommissionPercentage(seller.commission_percentage != null ? parseFloat(seller.commission_percentage) : 10);
    setLoadingTransactions(true);
    setGeneratedPayrollUrl(null);
    setPastPayrolls([]);

    try {
      const txRes = await adminAPI.getSellerTransactions(seller.user_id, { year: currentYear, month: currentMonth });
      setTransactions(txRes.data.transactions);
      setTransactionSummary(txRes.data.summary);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoadingTransactions(false);
    }

    // Load past payrolls independently — failure here shouldn't block the modal
    try {
      const payrollRes = await adminAPI.getPayrolls({ seller_id: seller.user_id });
      setPastPayrolls(payrollRes.data.tokens || []);
    } catch {
      // Silently ignore — table may not exist yet
    }
  };

  const closeTransactionModal = () => {
    setSelectedSeller(null);
    setTransactions([]);
    setTransactionSummary(null);
    setGeneratedPayrollUrl(null);
    setGeneratedPayrollToken(null);
    setPastPayrolls([]);
  };

  const handleGeneratePayroll = async () => {
    if (!selectedSeller) return;
    setIsGeneratingPayroll(true);
    try {
      const response = await adminAPI.generatePayroll({
        seller_id: selectedSeller.user_id,
        year: currentYear,
        month: currentMonth,
        commission_percentage: commissionPercentage
      });
      const { token, url } = response.data;
      setGeneratedPayrollUrl(url);
      setGeneratedPayrollToken(token);
      // Refresh past payrolls list
      const payrollRes = await adminAPI.getPayrolls({ seller_id: selectedSeller.user_id });
      setPastPayrolls(payrollRes.data.tokens || []);
      toast.success('Payroll link generated!');
    } catch (error) {
      console.error('Payroll generation failed:', error);
      toast.error(error.response?.data?.error || 'Failed to generate payroll');
    } finally {
      setIsGeneratingPayroll(false);
    }
  };

  const handleSendEmail = async (token) => {
    setSendingEmailToken(token);
    try {
      await adminAPI.sendPayrollEmail(token);
      toast.success('Email sent successfully!');
    } catch (error) {
      console.error('Email send failed:', error);
      toast.error(error.response?.data?.error || 'Failed to send email');
    } finally {
      setSendingEmailToken(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGeneratePDF = async () => {
    if (!selectedSeller) return;

    setIsGeneratingPDF(true);
    try {
      const response = await adminAPI.generateSellerPDF(
        selectedSeller.user_id,
        {
          year: currentYear,
          month: currentMonth,
          commission_percentage: commissionPercentage
        }
      );

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Seller_Report_${selectedSeller.seller_name.replace(/\s/g, '_')}_${getMonthName(currentMonth)}_${currentYear}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success('PDF report generated successfully');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error(error.response?.data?.error || 'Failed to generate PDF report');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Seller Summary</Title>
        <Subtitle>View monthly seller performance and earnings</Subtitle>
      </Header>

      <MonthNavigation>
        <NavButton onClick={handlePreviousMonth}>
          ← Previous
        </NavButton>
        <MonthDisplay>
          {getMonthName(currentMonth)} {currentYear}
        </MonthDisplay>
        <NavButton onClick={handleNextMonth}>
          Next →
        </NavButton>
      </MonthNavigation>

      {summary && (
        <SummaryCards>
          <SummaryCard>
            <CardLabel>Active Sellers</CardLabel>
            <CardValue>{summary.total_sellers}</CardValue>
          </SummaryCard>
          <SummaryCard>
            <CardLabel>Total Sales</CardLabel>
            <CardValue>{summary.total_sales}</CardValue>
          </SummaryCard>
          <SummaryCard>
            <CardLabel>Total Revenue</CardLabel>
            <CardValue>{parseFloat(summary.total_revenue || 0).toFixed(2)} ฿</CardValue>
          </SummaryCard>
        </SummaryCards>
      )}

      {loading ? (
        <LoadingState>Loading seller summary...</LoadingState>
      ) : sellers.length === 0 ? (
        <EmptyState>No sales data for this month</EmptyState>
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Seller</Th>
              <Th>Active Cheat Sheets</Th>
              <Th>Sales Count</Th>
              <Th>Total Revenue</Th>
            </tr>
          </Thead>
          <Tbody>
            {sellers.map(seller => (
              <Tr
                key={seller.user_id}
                $clickable
                onClick={() => openTransactionModal(seller)}
              >
                <Td>
                  <SellerInfo>
                    {seller.avatar_url ? (
                      <Avatar src={seller.avatar_url} alt={seller.seller_name} />
                    ) : (
                      <AvatarFallback>{getInitials(seller.seller_name)}</AvatarFallback>
                    )}
                    <SellerDetails>
                      <SellerName>{seller.seller_name}</SellerName>
                      <SellerEmail>{seller.seller_email}</SellerEmail>
                    </SellerDetails>
                  </SellerInfo>
                </Td>
                <Td>{seller.active_cheatsheets}</Td>
                <Td>{seller.total_sales}</Td>
                <Td>{parseFloat(seller.total_revenue || 0).toFixed(2)} ฿</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {/* Transaction Modal */}
      {selectedSeller && (
        <ModalOverlay onClick={closeTransactionModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            {/* Print-only header */}
            <PrintHeader>
              <PrintLogo src="/peanut-logo.svg" alt="Peanut Cheat Sheets" />
              <PrintTitle>Peanut Cheat Sheet Marketplace</PrintTitle>
              <PrintSubtitle>Seller Transaction Report</PrintSubtitle>
              <PrintSubtitle>
                <strong>{selectedSeller.seller_name}</strong> ({selectedSeller.seller_email})
              </PrintSubtitle>
              <PrintSubtitle>
                {getMonthName(currentMonth)} {currentYear}
              </PrintSubtitle>
              <PrintDate>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</PrintDate>
            </PrintHeader>

            <ModalHeader>
              <ModalTitle>
                Transactions - {selectedSeller.seller_name}
              </ModalTitle>
              <CloseButton onClick={closeTransactionModal}>×</CloseButton>
            </ModalHeader>

            <ModalBody>
              {loadingTransactions ? (
                <LoadingState>Loading transactions...</LoadingState>
              ) : (
                <>
                  {transactionSummary && (
                    <TransactionSummary>
                      <SummaryCard>
                        <CardLabel>Total Transactions</CardLabel>
                        <CardValue>{transactionSummary.total_transactions}</CardValue>
                      </SummaryCard>
                      <SummaryCard>
                        <CardLabel>Total Revenue</CardLabel>
                        <CardValue>{parseFloat(transactionSummary.total_revenue || 0).toFixed(2)} ฿</CardValue>
                      </SummaryCard>
                    </TransactionSummary>
                  )}

                  <SellerBankPanel seller={selectedSeller} />

                  {/* Commission Configuration */}
                  <CommissionInput>
                    <label htmlFor="commission">Platform Commission (%)</label>
                    <input
                      id="commission"
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={commissionPercentage}
                      onChange={(e) => setCommissionPercentage(parseFloat(e.target.value) || 0)}
                    />
                    <HelpText>
                      {selectedSeller?.commission_percentage != null
                        ? `This seller's rate: ${parseFloat(selectedSeller.commission_percentage)}%.`
                        : 'This seller uses the default rate: 10%.'}{' '}
                      Change it here for just this payroll/PDF, or save it as their rate. Their Payouts page estimates with their rate; an issued payroll keeps the rate it was issued with.
                    </HelpText>
                    <SaveRateButton
                      type="button"
                      disabled={savingRate || commissionPercentage === (selectedSeller?.commission_percentage != null ? parseFloat(selectedSeller.commission_percentage) : 10)}
                      onClick={handleSaveRate}
                    >
                      {savingRate ? 'Saving…' : `Save ${commissionPercentage}% as this seller's rate`}
                    </SaveRateButton>
                  </CommissionInput>

                  {transactions.length === 0 ? (
                    <EmptyState>No transactions found</EmptyState>
                  ) : (
                    <TransactionTable>
                      <Thead>
                        <tr>
                          <Th>Order ID</Th>
                          <Th>Buyer</Th>
                          <Th>Cheat Sheet</Th>
                          <Th>Amount</Th>
                          <Th>Date</Th>
                        </tr>
                      </Thead>
                      <Tbody>
                        {transactions.map(transaction => (
                          <tr key={transaction.order_id}>
                            <Td>#{transaction.order_id}</Td>
                            <Td>
                              <div style={{ fontSize: '0.9rem' }}>{transaction.buyer_name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                {transaction.buyer_email}
                              </div>
                            </Td>
                            <Td>
                              <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                                {transaction.cheatsheet_title}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                {transaction.course_code}
                              </div>
                            </Td>
                            <Td>{parseFloat(transaction.payment_amount || 0).toFixed(2)} ฿</Td>
                            <Td>
                              {new Date(transaction.payment_completed_at).toLocaleDateString()}
                            </Td>
                          </tr>
                        ))}
                      </Tbody>
                    </TransactionTable>
                  )}
                </>
              )}
            </ModalBody>

            {/* Payroll section */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb' }}>
              {generatedPayrollUrl && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ fontSize: '13px', color: '#166534', fontWeight: 600 }}>Payroll link ready:</span>
                  <code style={{ fontSize: '12px', wordBreak: 'break-all', flex: 1 }}>
                    {window.location.origin}{generatedPayrollUrl}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}${generatedPayrollUrl}`);
                      toast.success('Link copied!');
                    }}
                    style={{
                      padding: '4px 12px',
                      background: '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Copy Link
                  </button>
                  <a
                    href={generatedPayrollUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '4px 12px',
                      background: '#2563eb',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Open
                  </a>
                  {generatedPayrollToken && (
                    <button
                      onClick={() => handleSendEmail(generatedPayrollToken)}
                      disabled={sendingEmailToken === generatedPayrollToken}
                      style={{
                        padding: '4px 12px',
                        background: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        opacity: sendingEmailToken === generatedPayrollToken ? 0.6 : 1
                      }}
                    >
                      {sendingEmailToken === generatedPayrollToken ? 'Sending…' : 'Send Email'}
                    </button>
                  )}
                </div>
              )}

              {pastPayrolls.length > 0 && (
                <details style={{ marginTop: '8px' }}>
                  <summary style={{ fontSize: '13px', color: '#6b7280', cursor: 'pointer', userSelect: 'none' }}>
                    Past Payrolls ({pastPayrolls.length})
                  </summary>
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {pastPayrolls.map(pt => (
                      <div key={pt.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: '#f9fafb',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{ fontWeight: 600, color: '#374151' }}>
                          {getMonthName(pt.month)} {pt.year}
                        </span>
                        <span style={{ color: '#9ca3af' }}>
                          {pt.commission_percentage}% commission
                        </span>
                        <span style={{ color: '#9ca3af', flex: 1 }}>
                          {new Date(pt.generated_at).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => {
                            const url = `${window.location.origin}/payroll/${pt.token}`;
                            navigator.clipboard.writeText(url);
                            toast.success('Link copied!');
                          }}
                          style={{
                            padding: '2px 8px',
                            background: '#e5e7eb',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 600
                          }}
                        >
                          Copy
                        </button>
                        <a
                          href={`/payroll/${pt.token}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#2563eb', fontSize: '11px', fontWeight: 600 }}
                        >
                          Open
                        </a>
                        <button
                          onClick={() => handleSendEmail(pt.token)}
                          disabled={sendingEmailToken === pt.token}
                          style={{
                            padding: '2px 8px',
                            background: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 600,
                            opacity: sendingEmailToken === pt.token ? 0.6 : 1
                          }}
                        >
                          {sendingEmailToken === pt.token ? 'Sending…' : 'Email'}
                        </button>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>

            <ModalFooter>
              <GeneratePDFButton onClick={handleGeneratePDF} disabled={isGeneratingPDF}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
                  <path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361.01.022.02.036.026.044a.266.266 0 0 0 .035-.012c.137-.056.355-.235.635-.572a8.18 8.18 0 0 0 .45-.606zm1.64-1.33a12.71 12.71 0 0 1 1.01-.193 11.744 11.744 0 0 1-.51-.858 20.801 20.801 0 0 1-.5 1.05zm2.446.45c.15.163.296.3.435.41.24.19.407.253.498.256a.107.107 0 0 0 .07-.015.307.307 0 0 0 .094-.125.436.436 0 0 0 .059-.2.095.095 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a3.876 3.876 0 0 0-.612-.053zM8.078 7.8a6.7 6.7 0 0 0 .2-.828c.031-.188.043-.343.038-.465a.613.613 0 0 0-.032-.198.517.517 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822.024.111.054.227.09.346z"/>
                </svg>
                {isGeneratingPDF ? 'Generating...' : 'Generate PDF Report'}
              </GeneratePDFButton>
              <GeneratePDFButton
                onClick={handleGeneratePayroll}
                disabled={isGeneratingPayroll}
                style={{ background: '#f59e0b' }}
              >
                🔗 {isGeneratingPayroll ? 'Generating...' : 'Generate Web Payroll'}
              </GeneratePDFButton>
              <PrintButton onClick={handlePrint}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2H5zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"/>
                  <path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2V7zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
                </svg>
                Print Report
              </PrintButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default SellerSummary;
