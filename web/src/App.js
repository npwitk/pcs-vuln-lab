import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { PaymentWatchProvider } from './context/PaymentWatchContext';
import { InstitutionProvider } from './context/InstitutionContext';
import { SupportWatchProvider } from './context/SupportWatchContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PaymentConfirmedOverlay from './components/PaymentConfirmedOverlay';
import SupportReplyNotice from './components/SupportReplyNotice';
import Home from './pages/Home';
import Login from './pages/Login';
import GlobalStyles from './styles/GlobalStyles';

// Everything except Home is lazy — an anonymous homepage visitor shouldn't
// pay for admin/seller pages, stream-chat, or katex. Home stays eager since
// it's the near-guaranteed first render.
const CheatSheetDetail = lazy(() => import('./pages/CheatSheetDetail'));
const MyPurchases = lazy(() => import('./pages/MyPurchases'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const UploadCheatSheet = lazy(() => import('./pages/UploadCheatSheet'));
const EditCheatSheet = lazy(() => import('./pages/EditCheatSheet'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const Support = lazy(() => import('./pages/Support'));
const Cart = lazy(() => import('./pages/Cart'));
const ApplyToBeSeller = lazy(() => import('./pages/ApplyToBeSeller'));
const LegalDocsLayout = lazy(() => import('./pages/legal/LegalDocsLayout'));
const SellerApprovals = lazy(() => import('./pages/admin/SellerApprovals'));
const CheatSheetApprovals = lazy(() => import('./pages/admin/CheatSheetApprovals'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const AllCheatSheets = lazy(() => import('./pages/admin/AllCheatSheets'));
const SellerSummary = lazy(() => import('./pages/admin/SellerSummary'));
const GiveawayManagement = lazy(() => import('./pages/admin/GiveawayManagement'));
const UpcomingExamsManagement = lazy(() => import('./pages/admin/UpcomingExamsManagement'));
const InstitutionManagement = lazy(() => import('./pages/admin/InstitutionManagement'));
const AnnouncementConsole = lazy(() => import('./pages/admin/AnnouncementConsole'));
const BundleDiscountManagement = lazy(() => import('./pages/admin/BundleDiscountManagement'));
const CampaignManagement = lazy(() => import('./pages/admin/CampaignManagement'));
const RequestInstitution = lazy(() => import('./pages/RequestInstitution'));
const InstitutionRequests = lazy(() => import('./pages/admin/InstitutionRequests'));
const MockExamManagement = lazy(() => import('./pages/admin/MockExamManagement'));
const CourseManagement = lazy(() => import('./pages/admin/CourseManagement'));
const StudyTagsManagement = lazy(() => import('./pages/admin/StudyTagsManagement'));
const MobileAppConsole = lazy(() => import('./pages/admin/MobileAppConsole'));
const DiscountCodeManagement = lazy(() => import('./pages/admin/DiscountCodeManagement'));
const SupportTickets = lazy(() => import('./pages/admin/SupportTickets'));
const NotificationsConsole = lazy(() => import('./pages/admin/NotificationsConsole'));
const MyEarnings = lazy(() => import('./pages/seller/MyEarnings'));
const MyCheatSheets = lazy(() => import('./pages/seller/MyCheatSheets'));
const PrintRequests = lazy(() => import('./pages/seller/PrintRequests'));
const Settings = lazy(() => import('./pages/Settings'));
const MockExams = lazy(() => import('./pages/MockExams'));
const HappyBirthday = lazy(() => import('./pages/HappyBirthday'));
const PrintBalance = lazy(() => import('./pages/PrintBalance'));
const PayrollReport = lazy(() => import('./pages/PayrollReport'));
const StorePage = lazy(() => import('./pages/StorePage'));
const RequestFlagshipStore = lazy(() => import('./pages/RequestFlagshipStore'));
const ManageFlagshipStore = lazy(() => import('./pages/ManageFlagshipStore'));
const FlagshipStoreRequests = lazy(() => import('./pages/admin/FlagshipStoreRequests'));
const RedeemTransferCode = lazy(() => import('./pages/RedeemTransferCode'));

// Protected route wrapper
const ProtectedRoute = ({ children, adminOnly = false, uploaderOnly = false, staffOnly = false, requireGroup = null }) => {
  const { isAuthenticated, isAdmin, canUpload, canManageApprovals, user, loading } = useAuth();
  const { t } = useTranslation();

  const groupMismatch = !loading && isAuthenticated && requireGroup && user?.university_group !== requireGroup;
  // Only surface this extra explanation for requireGroup-gated routes — a
  // logged-out visitor is more likely to have arrived via a public link (the
  // homepage announcement) with no other context than to have hit some
  // other protected page by accident.
  const loggedOutOnGatedRoute = !loading && !isAuthenticated && requireGroup;

  useEffect(() => {
    if (groupMismatch) {
      toast.error(`This feature is only available to ${requireGroup === 'thammasat' ? 'Thammasat' : requireGroup} students.`);
    } else if (loggedOutOnGatedRoute) {
      toast.error('Please log in to use this feature.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupMismatch, loggedOutOnGatedRoute]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>{t('common.loading')}</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }

  if (staffOnly && !canManageApprovals) {
    return <Navigate to="/" />;
  }

  if (uploaderOnly && !canUpload) {
    return <Navigate to="/" />;
  }

  if (requireGroup && user?.university_group !== requireGroup) {
    return <Navigate to="/" />;
  }

  return children;
};

// React Router v6 doesn't reset scroll position on a client-side navigate() —
// without this, pushing to a new page keeps whatever scrollY the previous
// page was at, so e.g. clicking a cheat sheet card after scrolling down the
// home page opened the detail page already scrolled into its reviews section.
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function AppContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ScrollToTop />
      <Navbar />
      <main style={{ flex: 1 }}>
        <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cheatsheet/:id" element={<CheatSheetDetail />} />
        <Route path="/store/:slug" element={<StorePage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/redeem" element={<RedeemTransferCode />} />

        <Route
          path="/my-purchases"
          element={
            <ProtectedRoute>
              <MyPurchases />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute staffOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/seller-approvals"
          element={
            <ProtectedRoute staffOnly>
              <SellerApprovals />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/flagship-store-requests"
          element={
            <ProtectedRoute staffOnly>
              <FlagshipStoreRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/cheatsheet-approvals"
          element={
            <ProtectedRoute staffOnly>
              <CheatSheetApprovals />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute adminOnly>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/mobile-app"
          element={
            <ProtectedRoute adminOnly>
              <MobileAppConsole />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/cheatsheets"
          element={
            <ProtectedRoute adminOnly>
              <AllCheatSheets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/seller-summary"
          element={
            <ProtectedRoute adminOnly>
              <SellerSummary />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/institutions"
          element={
            <ProtectedRoute adminOnly>
              <InstitutionManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/announcement"
          element={
            <ProtectedRoute adminOnly>
              <AnnouncementConsole />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/bundle-discounts"
          element={
            <ProtectedRoute adminOnly>
              <BundleDiscountManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/campaigns"
          element={
            <ProtectedRoute adminOnly>
              <CampaignManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/institution-requests"
          element={
            <ProtectedRoute staffOnly>
              <InstitutionRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute adminOnly>
              <NotificationsConsole />
            </ProtectedRoute>
          }
        />

        {/* Seller Routes */}
        <Route
          path="/seller/earnings"
          element={
            <ProtectedRoute uploaderOnly>
              <MyEarnings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/my-cheatsheets"
          element={
            <ProtectedRoute uploaderOnly>
              <MyCheatSheets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/print-requests"
          element={
            <ProtectedRoute uploaderOnly>
              <PrintRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/upcoming-exams"
          element={
            <ProtectedRoute staffOnly>
              <UpcomingExamsManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/mock-exams"
          element={
            <ProtectedRoute staffOnly>
              <MockExamManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute staffOnly>
              <CourseManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/study-tags"
          element={
            <ProtectedRoute staffOnly>
              <StudyTagsManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/discount-codes"
          element={
            <ProtectedRoute adminOnly>
              <DiscountCodeManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/support-tickets"
          element={
            <ProtectedRoute adminOnly>
              <SupportTickets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/giveaway"
          element={
            <ProtectedRoute adminOnly>
              <GiveawayManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/upload"
          element={
            <ProtectedRoute uploaderOnly>
              <UploadCheatSheet />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cheatsheet/:id/edit"
          element={
            <ProtectedRoute>
              <EditCheatSheet />
            </ProtectedRoute>
          }
        />

        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/apply-seller"
          element={
            <ProtectedRoute>
              <ApplyToBeSeller />
            </ProtectedRoute>
          }
        />

        <Route
          path="/request-flagship-store"
          element={
            <ProtectedRoute uploaderOnly>
              <RequestFlagshipStore />
            </ProtectedRoute>
          }
        />

        <Route
          path="/request-institution"
          element={
            <ProtectedRoute>
              <RequestInstitution />
            </ProtectedRoute>
          }
        />

        <Route
          path="/store-management"
          element={
            <ProtectedRoute uploaderOnly>
              <ManageFlagshipStore />
            </ProtectedRoute>
          }
        />

        <Route
          path="/store-management/:slug"
          element={
            <ProtectedRoute adminOnly>
              <ManageFlagshipStore />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route path="/legal/:slug" element={<LegalDocsLayout />} />
        <Route path="/privacy" element={<Navigate to="/legal/privacy-policy" replace />} />
        <Route path="/terms" element={<Navigate to="/legal/terms-of-service" replace />} />
        <Route path="/mock-exams" element={<MockExams />} />
        <Route path="/happy-birthday" element={<HappyBirthday />} />
        <Route
          path="/print-balance"
          element={
            <ProtectedRoute requireGroup="thammasat">
              <PrintBalance />
            </ProtectedRoute>
          }
        />
        <Route path="/payroll/:token" element={<PayrollReport />} />

        <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </Suspense>
      </main>
      <Footer />
      <PaymentConfirmedOverlay />
      <SupportReplyNotice />

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg, #363636)',
            color: 'var(--toast-text, #fff)',
            borderRadius: '10px',
            padding: '12px 20px',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            iconTheme: {
              primary: '#34C759',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF3B30',
              secondary: '#fff',
            },
            duration: 5000,
          },
          loading: {
            duration: Infinity,
            iconTheme: {
              primary: '#007AFF',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <GlobalStyles />
          <LanguageProvider>
            <AuthProvider>
              <CartProvider>
                <PaymentWatchProvider>
                  <InstitutionProvider>
                    <SupportWatchProvider>
                      <AppContent />
                    </SupportWatchProvider>
                  </InstitutionProvider>
                </PaymentWatchProvider>
              </CartProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
