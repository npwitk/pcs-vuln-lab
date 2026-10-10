import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { adminAPI, sellerApplicationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import PaymentSettingsPanel from '../components/admin/PaymentSettingsPanel';
import PaymentReview from '../components/admin/PaymentReview';
import {
  Users,
  FileText,
  ShoppingBag,
  Wallet,
  Clock,
  UserPlus,
  FileClock,
  CheckCircle2,
  AlertTriangle,
  CalendarDays,
  Tags,
  Smartphone,
  GraduationCap,
  Tag,
  Percent,
  LifeBuoy,
  Building2,
  ClipboardList,
  Bell,
  Megaphone,
  Link2,
  ChevronRight,
} from 'lucide-react';

const RevenueChart = lazy(() => import('../components/admin/RevenueChart'));

const CHART_RANGE_OPTIONS = [
  { value: '3', label: '3M' },
  { value: '6', label: '6M' },
  { value: '12', label: '12M' },
  { value: 'all', label: 'All time' },
];

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: ${props => props.theme.colors.text};
`;

const GroupLabel = styled.h2`
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: 1.5rem;
  border-radius: ${props => props.theme.radius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border};
  text-align: center;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: all 0.3s;
  text-decoration: none;
  display: block;
  color: inherit;

  &:hover {
    ${props => props.$clickable && `
      transform: translateY(-2px);
      box-shadow: ${props.theme.shadows.lg};
    `}
  }

  h3 {
    font-size: 0.9rem;
    color: ${props => props.theme.colors.textSecondary};
    margin-bottom: 0.5rem;
    text-transform: uppercase;
  }

  p {
    font-size: 2rem;
    font-weight: bold;
    color: ${props => props.theme.colors.primary};
  }
`;

const IconSwatch = styled.div`
  width: 44px;
  height: 44px;
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.primaryLight};
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem;
`;

const AttentionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1.25rem;
  margin-bottom: 3rem;
`;

const AttentionCard = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: 1.25rem 1.5rem;
  border-radius: ${props => props.theme.radius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.$ok ? props.theme.colors.border : props.theme.colors.warning};
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: all 0.3s;
  text-decoration: none;
  color: inherit;

  &:hover {
    ${props => props.$clickable && `
      transform: translateY(-2px);
      box-shadow: ${props.theme.shadows.lg};
    `}
  }
`;

const AttentionIcon = styled.div`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.$ok ? `${props.theme.colors.success}22` : `${props.theme.colors.warning}26`};
  color: ${props => props.$ok ? props.theme.colors.success : props.theme.colors.warning};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AttentionBody = styled.div`
  flex: 1;
  min-width: 0;

  h3 {
    font-size: 0.8rem;
    font-weight: 600;
    color: ${props => props.theme.colors.textSecondary};
    text-transform: uppercase;
    margin-bottom: 0.3rem;
  }

  p {
    font-size: 1.5rem;
    font-weight: bold;
    color: ${props => props.theme.colors.text};
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.15rem;
  }

  span {
    font-size: 0.8rem;
    font-weight: 500;
    color: ${props => props.$ok ? props.theme.colors.success : props.theme.colors.warning};
  }
`;

const ManageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 1rem;
  margin-bottom: 3rem;
`;

const ManageCard = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  background: ${props => props.theme.colors.surface};
  padding: 1rem 1.25rem;
  border-radius: ${props => props.theme.radius.lg};
  border: 1px solid ${props => props.theme.colors.border};
  text-decoration: none;
  color: inherit;
  transition: all 0.25s;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const ManageIcon = styled.div`
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ManageLabel = styled.div`
  flex: 1;
  font-weight: 600;
  font-size: 0.95rem;
  color: ${props => props.theme.colors.text};
`;

const ManageArrow = styled(ChevronRight)`
  color: ${props => props.theme.colors.textTertiary};
  flex-shrink: 0;
`;

const Section = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: 2rem;
  border-radius: ${props => props.theme.radius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: ${props => props.theme.colors.text};
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const RangeSelector = styled.div`
  display: inline-flex;
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: ${props => props.theme.radius.md};
  padding: 0.25rem;
  gap: 0.25rem;
`;

const RangeButton = styled.button`
  padding: 0.35rem 0.85rem;
  border: none;
  border-radius: ${props => props.theme.radius.sm};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$active ? props.theme.colors.surface : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  box-shadow: ${props => props.$active ? props.theme.shadows.sm : 'none'};

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const VersionBadge = styled.span`
  display: inline-flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textSecondary};
  font-weight: 500;

  a {
    color: inherit;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.8rem;
    text-decoration: none;

    &:hover { color: ${props => props.theme.colors.primary}; text-decoration: underline; }
  }
`;

// Build details: the API's from /health (stamped by the deploy workflow, see
// server/utils/buildInfo.js), the web app's from Vercel at build time.
const REPO_URL = 'https://github.com/npwitk/PCS-Web';
const WEB_COMMIT = (process.env.REACT_APP_GIT_SHA || '').slice(0, 7);
const commitLink = (sha) => `${REPO_URL}/commit/${sha}`;

const StatusBanner = styled.div`
  background: ${props => {
    if (props.type === 'success') return props.theme.colors.successLight || '#d4edda';
    if (props.type === 'info') return props.theme.colors.infoLight || '#d1ecf1';
    if (props.type === 'warning') return props.theme.colors.warningLight || '#fff3cd';
    return props.theme.colors.errorLight || '#f8d7da';
  }};
  border: 1px solid ${props => {
    if (props.type === 'success') return props.theme.colors.success;
    if (props.type === 'info') return props.theme.colors.info || '#17a2b8';
    if (props.type === 'warning') return props.theme.colors.warning;
    return props.theme.colors.error;
  }};
  color: ${props => props.theme.colors.text};
  padding: 1rem 1.5rem;
  border-radius: ${props => props.theme.radius.md};
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: ${props => props.theme.typography.sizes.base};

  strong {
    font-weight: ${props => props.theme.typography.weights.semibold};
  }
`;

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(null);
  const [pendingSellerApps, setPendingSellerApps] = useState(0);
  const [pendingCheatsheets, setPendingCheatsheets] = useState(0);
  const [revenueData, setRevenueData] = useState([]);
  const [chartRange, setChartRange] = useState('all');
  // null until fetched, so the banner doesn't flash the wrong state on load.
  const [stripeEnabled, setStripeEnabled] = useState(null);

  const filteredRevenueData = useMemo(() => {
    if (chartRange === 'all') return revenueData;
    return revenueData.slice(-parseInt(chartRange, 10));
  }, [revenueData, chartRange]);

  useEffect(() => {
    // Scroll to top when component mounts or route changes
    window.scrollTo(0, 0);
    fetchData();
    fetchVersion();
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      // Staff can access pending payments, but only admins can see full stats
      const promises = [adminAPI.getPendingPayments()];

      // Only fetch stats if user is admin
      if (isAdmin) {
        promises.unshift(adminAPI.getStats());
      }

      const results = await Promise.all(promises);

      // If admin, first result is stats, second is payments
      // If staff, first result is payments
      if (isAdmin) {
        const [statsRes, paymentsRes] = results;
        setStats(statsRes.data);
        setPendingPayments(paymentsRes.data.payments);
      } else {
        const [paymentsRes] = results;
        setPendingPayments(paymentsRes.data.payments);
        // Set minimal stats for staff (only what they need)
        setStats({
          total_cheatsheets: 0,
          pending_purchases: paymentsRes.data.payments.length
        });
      }

      // Fetch seller applications separately to avoid breaking the entire page if it fails
      try {
        const sellerAppsRes = await sellerApplicationAPI.getAll({ status: 'pending' });
        setPendingSellerApps(sellerAppsRes.data.applications.length);
      } catch (sellerError) {
        console.error('Failed to fetch seller applications:', sellerError);
        // Don't show error toast, just set to 0
        setPendingSellerApps(0);
      }

      // Fetch pending cheat sheets separately
      try {
        const cheatsheetsRes = await adminAPI.getPendingCheatsheets();
        setPendingCheatsheets(cheatsheetsRes.data.count);

        // For staff, also update total_cheatsheets count from this response
        if (!isAdmin && cheatsheetsRes.data.totalCheatsheets) {
          setStats(prevStats => ({
            ...prevStats,
            total_cheatsheets: cheatsheetsRes.data.totalCheatsheets
          }));
        }
      } catch (cheatsheetError) {
        console.error('Failed to fetch pending cheat sheets:', cheatsheetError);
        setPendingCheatsheets(0);
      }

      // Fetch revenue timeseries separately (admin only)
      if (isAdmin) {
        try {
          const revenueRes = await adminAPI.getRevenueTimeseries();
          setRevenueData(revenueRes.data.months);
        } catch (revenueError) {
          console.error('Failed to fetch revenue timeseries:', revenueError);
          setRevenueData([]);
        }
      }

      // Fetch site settings to check which payment rail is live (admin only)
      if (isAdmin) {
        try {
          const settingsRes = await adminAPI.getSettings();
          setStripeEnabled(settingsRes.data.stripe_payments_enabled);
        } catch (settingsError) {
          console.error('Failed to fetch site settings:', settingsError);
          setStripeEnabled(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchVersion = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/health`);
      const data = await response.json();
      setVersion({ version: data.version, commit: data.commit, builtAt: data.built_at });
    } catch (error) {
      console.error('Failed to fetch version:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const pendingPaymentsCount = stats?.pending_purchases ?? 0;

  return (
    <Container>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Title>{isAdmin ? 'Admin Dashboard' : 'Approvals Dashboard'}</Title>
        {version && (
          <VersionBadge title={version.builtAt ? `API built ${new Date(version.builtAt).toLocaleString()}` : undefined}>
            v{version.version}
            {version.commit && (
              <a href={commitLink(version.commit)} target="_blank" rel="noopener noreferrer" title="API commit">
                API {version.commit}
              </a>
            )}
            {WEB_COMMIT && (
              <a href={commitLink(WEB_COMMIT)} target="_blank" rel="noopener noreferrer" title="Web commit">
                Web {WEB_COMMIT}
              </a>
            )}
          </VersionBadge>
        )}
      </div>

      {isAdmin && stripeEnabled === false && (
        <StatusBanner type="warning">
          <strong>Stripe payments are off.</strong> Every new order waits for someone to approve
          it by hand — an overnight purchase stays unusable until you get to it. Turn Stripe on in
          Payment Settings below to have payments confirmed automatically.
        </StatusBanner>
      )}

      {stats && (
        <StatsGrid>
          {isAdmin && (
            <StatCard as={Link} to="/admin/users" $clickable>
              <IconSwatch><Users size={20} /></IconSwatch>
              <h3>Total Users</h3>
              <p>{stats.total_users}</p>
            </StatCard>
          )}
          <StatCard as={Link} to="/admin/cheatsheets" $clickable>
            <IconSwatch><FileText size={20} /></IconSwatch>
            <h3>Total Cheat Sheets</h3>
            <p>{stats.total_cheatsheets}</p>
          </StatCard>
          {isAdmin && (
            <>
              <StatCard>
                <IconSwatch><ShoppingBag size={20} /></IconSwatch>
                <h3>Completed Purchases</h3>
                <p>{stats.completed_purchases}</p>
              </StatCard>
              <StatCard>
                <IconSwatch><Wallet size={20} /></IconSwatch>
                <h3>Total Revenue</h3>
                <p>{parseFloat(stats.total_revenue || 0).toFixed(2)} ฿</p>
              </StatCard>
            </>
          )}
        </StatsGrid>
      )}

      {stats && (
        <>
          <GroupLabel>Needs Attention</GroupLabel>
          <AttentionGrid>
            <AttentionCard
              $ok={pendingPaymentsCount === 0}
              $clickable
              onClick={() => window.scrollTo({ top: document.querySelector('section').offsetTop, behavior: 'smooth' })}
            >
              <AttentionIcon $ok={pendingPaymentsCount === 0}><Clock size={20} /></AttentionIcon>
              <AttentionBody $ok={pendingPaymentsCount === 0}>
                <h3>Pending Payment Approvals</h3>
                <p>
                  {pendingPaymentsCount === 0 ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  {pendingPaymentsCount}
                </p>
                <span>{pendingPaymentsCount === 0 ? 'All caught up' : 'Needs review'}</span>
              </AttentionBody>
            </AttentionCard>

            <AttentionCard as={Link} to="/admin/seller-approvals" $ok={pendingSellerApps === 0} $clickable>
              <AttentionIcon $ok={pendingSellerApps === 0}><UserPlus size={20} /></AttentionIcon>
              <AttentionBody $ok={pendingSellerApps === 0}>
                <h3>Pending Seller Apps</h3>
                <p>
                  {pendingSellerApps === 0 ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  {pendingSellerApps}
                </p>
                <span>{pendingSellerApps === 0 ? 'All caught up' : 'Needs review'}</span>
              </AttentionBody>
            </AttentionCard>

            <AttentionCard as={Link} to="/admin/cheatsheet-approvals" $ok={pendingCheatsheets === 0} $clickable>
              <AttentionIcon $ok={pendingCheatsheets === 0}><FileClock size={20} /></AttentionIcon>
              <AttentionBody $ok={pendingCheatsheets === 0}>
                <h3>Pending Cheat Sheets</h3>
                <p>
                  {pendingCheatsheets === 0 ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  {pendingCheatsheets}
                </p>
                <span>{pendingCheatsheets === 0 ? 'All caught up' : 'Needs review'}</span>
              </AttentionBody>
            </AttentionCard>
          </AttentionGrid>
        </>
      )}

      {isAdmin && (
        <Section>
          <ChartHeader>
            <SectionTitle style={{ marginBottom: 0 }}>Revenue Over Time</SectionTitle>
            <RangeSelector>
              {CHART_RANGE_OPTIONS.map(opt => (
                <RangeButton
                  key={opt.value}
                  type="button"
                  $active={chartRange === opt.value}
                  onClick={() => setChartRange(opt.value)}
                >
                  {opt.label}
                </RangeButton>
              ))}
            </RangeSelector>
          </ChartHeader>
          <Suspense fallback={<LoadingSpinner />}>
            <RevenueChart data={filteredRevenueData} />
          </Suspense>
        </Section>
      )}

      <GroupLabel>Manage</GroupLabel>
      <ManageGrid>
        <ManageCard to="/admin/upcoming-exams">
          <ManageIcon><CalendarDays size={18} /></ManageIcon>
          <ManageLabel>Upcoming Exams</ManageLabel>
          <ManageArrow size={18} />
        </ManageCard>
        <ManageCard to="/admin/mock-exams">
          <ManageIcon><GraduationCap size={18} /></ManageIcon>
          <ManageLabel>Mock Exams</ManageLabel>
          <ManageArrow size={18} />
        </ManageCard>
        <ManageCard to="/admin/study-tags">
          <ManageIcon><Tags size={18} /></ManageIcon>
          <ManageLabel>Study Tags</ManageLabel>
          <ManageArrow size={18} />
        </ManageCard>
        {isAdmin && (
          <ManageCard to="/admin/mobile-app">
            <ManageIcon><Smartphone size={18} /></ManageIcon>
            <ManageLabel>Mobile App</ManageLabel>
            <ManageArrow size={18} />
          </ManageCard>
        )}
        {isAdmin && (
          <ManageCard to="/admin/discount-codes">
            <ManageIcon><Tag size={18} /></ManageIcon>
            <ManageLabel>Discount Codes</ManageLabel>
            <ManageArrow size={18} />
          </ManageCard>
        )}
        {isAdmin && (
          <ManageCard to="/admin/bundle-discounts">
            <ManageIcon><Percent size={18} /></ManageIcon>
            <ManageLabel>Bundle Discounts</ManageLabel>
            <ManageArrow size={18} />
          </ManageCard>
        )}
        {isAdmin && (
          <ManageCard to="/admin/campaigns">
            <ManageIcon><Link2 size={18} /></ManageIcon>
            <ManageLabel>Campaign Links</ManageLabel>
            <ManageArrow size={18} />
          </ManageCard>
        )}
        {isAdmin && (
          <ManageCard to="/admin/support-tickets">
            <ManageIcon><LifeBuoy size={18} /></ManageIcon>
            <ManageLabel>Support Tickets</ManageLabel>
            <ManageArrow size={18} />
          </ManageCard>
        )}
        {isAdmin && (
          <ManageCard to="/admin/institutions">
            <ManageIcon><Building2 size={18} /></ManageIcon>
            <ManageLabel>Institutions</ManageLabel>
            <ManageArrow size={18} />
          </ManageCard>
        )}
        {isAdmin && (
          <ManageCard to="/admin/institution-requests">
            <ManageIcon><ClipboardList size={18} /></ManageIcon>
            <ManageLabel>Institution Requests</ManageLabel>
            <ManageArrow size={18} />
          </ManageCard>
        )}
        {isAdmin && (
          <ManageCard to="/admin/notifications">
            <ManageIcon><Bell size={18} /></ManageIcon>
            <ManageLabel>Push Notifications</ManageLabel>
            <ManageArrow size={18} />
          </ManageCard>
        )}
        {isAdmin && (
          <ManageCard to="/admin/announcement">
            <ManageIcon><Megaphone size={18} /></ManageIcon>
            <ManageLabel>Announcement Banner</ManageLabel>
            <ManageArrow size={18} />
          </ManageCard>
        )}
      </ManageGrid>

      <Section>
        <SectionTitle>Payments to review</SectionTitle>
        <PaymentReview payments={pendingPayments} onChanged={fetchData} />
      </Section>

      {isAdmin && (
        <Section>
          <SectionTitle>Payment Settings</SectionTitle>
          <PaymentSettingsPanel onStripeChange={setStripeEnabled} />
        </Section>
      )}

    </Container>
  );
};

export default AdminDashboard;
