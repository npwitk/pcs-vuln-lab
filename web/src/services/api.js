import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  withCredentials: true, // Important for session cookies
  timeout: 30000, // 30 second timeout to prevent hanging requests on mobile
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // VULN(V1): username/password login replacing Google OAuth for this lab.
  login: (email, password) => api.post('/api/auth/login', { email, password }),

  loginWithGoogle: () => {
    window.location.href = `${api.defaults.baseURL}/auth/google`;
  },

  getCurrentUser: () => api.get('/auth/me'),

  logout: () => api.post('/auth/logout'),

  updateYearLevel: (year_level) => api.patch('/auth/year-level', { year_level }),
  updateSocial: (data) => api.patch('/auth/social', data),
};

// Cheat Sheets API
export const cheatSheetsAPI = {
  getAll: (params) => api.get('/api/cheatsheets', { params }),

  getById: (id) => api.get(`/api/cheatsheets/${id}`),

  // Mints a signed GCS URL the browser can PUT a PDF to directly, bypassing
  // this API server entirely — Cloud Run caps incoming requests at 32MB,
  // which large cheat sheets can exceed. Returns { uploadUrl, objectPath };
  // PUT the raw file to uploadUrl (Content-Type: application/pdf), then
  // send objectPath as pdf_object_path to create/edit instead of a pdf file.
  getUploadUrl: (data) => api.post('/api/cheatsheets/upload-url', data),

  create: (formData, onUploadProgress) => api.post('/api/cheatsheets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000, // 5 minutes for large file uploads
    onUploadProgress: onUploadProgress,
  }),

  update: (id, data) => api.put(`/api/cheatsheets/${id}`, data),

  edit: (id, formData, onUploadProgress) => api.patch(`/api/cheatsheets/${id}/edit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000, // 5 minutes for large file uploads
    onUploadProgress: onUploadProgress,
  }),

  delete: (id) => api.delete(`/api/cheatsheets/${id}`),

  // Adds a free sheet to the library without downloading it (free pre-orders).
  claimFree: (id) => api.post(`/api/cheatsheets/${id}/claim-free`),

  downloadFree: (id, onDownloadProgress) => api.get(`/api/cheatsheets/${id}/download-free`, {
    responseType: 'blob',
    timeout: 300000, // 5 minutes for large PDF downloads with watermarking
    onDownloadProgress: onDownloadProgress,
  }),

  // Full-preview page image. responseType 'blob' regardless of status —
  // a 202 "still preparing" JSON body arrives as a Blob too, since axios
  // picks the response type before it knows the status. Callers must
  // inspect response.status/content-type themselves (202 is a 2xx, so it
  // resolves normally here, it never hits axios's error path).
  getPreviewPage: (id, page) => api.get(`/api/cheatsheets/${id}/full-preview/${page}`, {
    responseType: 'blob',
    timeout: 15000, // single small page image, not a full document
  }),
};

// Cheat sheet supplementary (extra attachment) files — any file type, gated
// by the same entitlement as the main PDF. Same direct-to-GCS signed-URL
// pattern as cheatSheetsAPI.getUploadUrl/create: mint a URL, PUT the raw
// file to it, then register the object's metadata.
export const cheatSheetFilesAPI = {
  getUploadUrl: (cheatsheetId, original_filename) =>
    api.post(`/api/cheatsheets/${cheatsheetId}/supplementary-files/upload-url`, { original_filename }),

  register: (cheatsheetId, data) =>
    api.post(`/api/cheatsheets/${cheatsheetId}/supplementary-files`, data),

  listForOwner: (cheatsheetId) =>
    api.get(`/api/cheatsheets/${cheatsheetId}/supplementary-files/manage`),

  listForBuyer: (cheatsheetId) =>
    api.get(`/api/cheatsheets/${cheatsheetId}/supplementary-files`),

  delete: (cheatsheetId, fileId) =>
    api.delete(`/api/cheatsheets/${cheatsheetId}/supplementary-files/${fileId}`),

  download: (cheatsheetId, fileId) =>
    api.get(`/api/cheatsheets/${cheatsheetId}/supplementary-files/${fileId}/download`, {
      responseType: 'blob',
      timeout: 300000,
    }),
};

// Cheat sheet collaborators — additional people credited on a cheat sheet
// beyond its uploader, added by email (no live search). An email that
// doesn't match a registered account yet is still added as a pending
// invite and auto-links the next time that person logs in.
export const cheatSheetCollaboratorsAPI = {
  listForOwner: (cheatsheetId) =>
    api.get(`/api/cheatsheets/${cheatsheetId}/collaborators/manage`),

  add: (cheatsheetId, data) =>
    api.post(`/api/cheatsheets/${cheatsheetId}/collaborators`, data),

  delete: (cheatsheetId, collaboratorId) =>
    api.delete(`/api/cheatsheets/${cheatsheetId}/collaborators/${collaboratorId}`),
};

// Payments API
export const paymentsAPI = {
  createPayment: (cheatsheetId) =>
    api.post('/api/payments/create', { cheatsheet_id: cheatsheetId }),

  // verifyQr: the receipt is on screen, so the server also double-checks
  // with Stripe that the QR hasn't expired (backup for a missed webhook).
  getPaymentStatus: (orderId, { verifyQr = false } = {}) =>
    api.get(`/api/payments/status/${orderId}`, { params: verifyQr ? { verify_qr: 1 } : undefined }),

  createBundlePayment: (bundle_order_id) =>
    api.post('/api/payments/create-bundle', { bundle_order_id }),

  getBundleStatus: (bundleOrderId, { verifyQr = false } = {}) =>
    api.get(`/api/payments/bundle-status/${bundleOrderId}`, { params: verifyQr ? { verify_qr: 1 } : undefined }),

  getQRCode: (orderId) =>
    api.get(`/api/payments/qr/${orderId}`),
};

// Purchases API
export const purchasesAPI = {
  getMyPurchases: () => api.get('/api/purchases/my'),

  getPurchaseById: (orderId) => api.get(`/api/purchases/${orderId}`),

  downloadCheatSheet: (orderId, onDownloadProgress) => {
    return api.get(`/api/purchases/${orderId}/download`, {
      responseType: 'blob',
      timeout: 300000, // 5 minutes for large PDF downloads with watermarking
      onDownloadProgress: onDownloadProgress,
    });
  },

  checkAccess: (cheatsheetId) =>
    api.get(`/api/purchases/check/${cheatsheetId}`),
};

// Transfer Code API — cross-device PDF handoff, no auth needed for check/download
export const downloadTransferAPI = {
  generateCode: (orderId) =>
    api.post(`/api/download-transfer/${orderId}/generate`),

  checkCode: (code) =>
    api.get(`/api/download-transfer/${code}`),

  downloadWithCode: (code, onDownloadProgress) => {
    // {} not null — axios JSON-stringifies the body, and `null` becomes the
    // literal text "null", which Express's strict-mode JSON body-parser
    // rejects (it only accepts objects/arrays at the top level).
    return api.post(`/api/download-transfer/${code}/download`, {}, {
      responseType: 'blob',
      timeout: 300000, // 5 minutes for large PDF downloads with watermarking
      onDownloadProgress: onDownloadProgress,
    });
  },
};

// Admin API
export const adminAPI = {
  getPendingPayments: () => api.get('/api/admin/payments/pending'),

  approvePayment: (orderId, paymentId) =>
    api.post(`/api/admin/payments/${orderId}/approve`, { payment_id: paymentId }),

  rejectPayment: (orderId, reason) =>
    api.post(`/api/admin/payments/${orderId}/reject`, { reason }),

  // A cart checkout is approved or rejected as one order.
  approveBundle: (bundleOrderId) =>
    api.post(`/api/admin/payments/bundles/${encodeURIComponent(bundleOrderId)}/approve`),

  rejectBundle: (bundleOrderId, reason) =>
    api.post(`/api/admin/payments/bundles/${encodeURIComponent(bundleOrderId)}/reject`, { reason }),

  getAllPurchases: (params) => api.get('/api/admin/purchases', { params }),

  getStats: () => api.get('/api/admin/stats'),

  getRevenueTimeseries: () => api.get('/api/admin/stats/revenue-timeseries'),
  getMobileAppStats: () => api.get('/api/admin/stats/mobile-app'),

  getUserSignupsTimeseries: () => api.get('/api/admin/stats/user-signups-timeseries'),

  getAllTickets: (params) => api.get('/api/support/tickets/all', { params }),

  updateTicketStatus: (ticketId, status) =>
    api.patch(`/api/support/tickets/${ticketId}/status`, { ticket_status: status }),

  sendTicketReply: (ticketId, message) =>
    api.post(`/api/support/tickets/${ticketId}/messages`, { message }),

  markTicketRead: (ticketId) => api.patch(`/api/support/tickets/${ticketId}/read`),

  getTicketMessages: (ticketId) => api.get(`/api/support/tickets/${ticketId}/messages`),

  joinTicketChannel: (ticketId) => api.post(`/api/support/tickets/${ticketId}/join`),

  // Cheat sheet approvals
  getPendingCheatsheets: (params) => api.get('/api/admin/cheatsheets/pending', { params }),

  approveCheatsheet: (cheatsheetId) =>
    api.post(`/api/admin/cheatsheets/${cheatsheetId}/approve`),

  rejectCheatsheet: (cheatsheetId, rejectionReason) =>
    api.post(`/api/admin/cheatsheets/${cheatsheetId}/reject`, { rejection_reason: rejectionReason }),

  // User management
  getAllUsers: (params) => api.get('/api/admin/users', { params }),

  updateUserRoles: (userId, roles) =>
    api.patch(`/api/admin/users/${userId}/roles`, roles),

  // All cheat sheets management
  getAllCheatSheets: () => api.get('/api/admin/cheatsheets/all'),

  updateCheatSheetStatus: (cheatsheetId, isActive) =>
    api.patch(`/api/admin/cheatsheets/${cheatsheetId}/status`, { is_active: isActive }),

  // Seller summary
  getSellerSummary: (params) => api.get('/api/admin/seller-summary', { params }),

  getSellerTransactions: (sellerId, params) =>
    api.get(`/api/admin/seller-summary/${sellerId}/transactions`, { params }),

  generateSellerPDF: (sellerId, params) =>
    api.post(`/api/admin/seller-summary/${sellerId}/generate-pdf`, params, {
      responseType: 'blob',
      timeout: 60000, // 1 minute for PDF generation
    }),

  // Giveaway
  giveCheatSheetAccess: (userId, cheatsheetId) =>
    api.post('/api/admin/purchases/giveaway', { user_id: userId, cheatsheet_id: cheatsheetId }),

  // Admin settings
  getSettings: () => api.get('/api/admin/settings'),

  updateSettings: (settings) => api.patch('/api/admin/settings', settings),

  // User library management
  getUserLibrary: (userId) => api.get(`/api/admin/users/${userId}/library`),

  revokeAccess: (userId, orderId, reason) =>
    api.post(`/api/admin/users/${userId}/revoke/${orderId}`, { reason }),

  restoreAccess: (userId, orderId, reason) =>
    api.post(`/api/admin/users/${userId}/restore/${orderId}`, { reason }),

  refundPurchase: (userId, orderId, reason) =>
    api.post(`/api/admin/users/${userId}/refund/${orderId}`, { reason }),

  getAdminActions: (params) => api.get('/api/admin/actions', { params }),

  generatePayroll: (data) => api.post('/api/admin/payroll/generate', data),
  getPayrolls: (params) => api.get('/api/admin/payroll', { params }),
  // Seller's default commission (%), or null for the platform default (10%).
  setSellerCommission: (sellerId, commission_percentage) =>
    api.patch(`/api/admin/sellers/${sellerId}/commission`, { commission_percentage }),
  // Seller payout bank details: masked read, and an audited update.
  getSellerBank: (sellerId) => api.get(`/api/admin/sellers/${sellerId}/bank`),
  updateSellerBank: (sellerId, data) => api.put(`/api/admin/sellers/${sellerId}/bank`, data),
  sendPayrollEmail: (token) => api.post('/api/admin/payroll/send-email', { token }),
};

// Public payroll report (no auth required — token is the security)
export const payrollAPI = {
  getReport: (token) => api.get(`/api/payroll/${token}`),
};

// Support API
export const supportAPI = {
  submitTicket: (ticketData) => api.post('/api/support/tickets', ticketData),

  getMyTickets: () => api.get('/api/support/tickets'),

  getTicketMessages: (ticketId) => api.get(`/api/support/tickets/${ticketId}/messages`),

  sendMessage: (ticketId, message) => api.post(`/api/support/tickets/${ticketId}/messages`, { message }),

  markAsRead: (ticketId) => api.patch(`/api/support/tickets/${ticketId}/read`),

  getStreamToken: () => api.post('/api/support/stream/token'),

  deleteAccount: () => api.delete('/api/support/account'),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/api/cart'),

  addToCart: (cheatsheet_id) => api.post('/api/cart/add', { cheatsheet_id }),

  removeFromCart: (cart_id) => api.delete(`/api/cart/${cart_id}`),

  clearCart: () => api.delete('/api/cart'),

  getCartCount: () => api.get('/api/cart/count'),

  checkout: (discountCode) => api.post('/api/cart/checkout', discountCode ? { discount_code: discountCode } : {}),
};

// Discount Codes API
export const discountCodesAPI = {
  validate: (code) => api.post('/api/discount-codes/validate', { code }),
  adminGetAll: () => api.get('/api/discount-codes/admin/all'),
  create: (data) => api.post('/api/discount-codes/admin', data),
  bulkCreate: (data) => api.post('/api/discount-codes/admin/bulk', data),
  update: (id, data) => api.put(`/api/discount-codes/admin/${id}`, data),
  resendGiftEmail: (id) => api.post(`/api/discount-codes/admin/${id}/gift-email`),
};

// Reviews API
export const reviewsAPI = {
  createOrUpdateReview: (cheatsheetId, rating, comment) =>
    api.post('/api/reviews', {
      cheatsheet_id: cheatsheetId,
      rating,
      comment,
    }),

  getReviewsForCheatSheet: (cheatsheetId, params) =>
    api.get(`/api/reviews/cheatsheet/${cheatsheetId}`, { params }),

  getMyReview: (cheatsheetId) =>
    api.get(`/api/reviews/my-review/${cheatsheetId}`),

  deleteReview: (reviewId) => api.delete(`/api/reviews/${reviewId}`),

  // Admin
  getAllReviews: (params) => api.get('/api/reviews/admin/all', { params }),

  updateReviewApproval: (reviewId, isApproved) =>
    api.patch(`/api/reviews/${reviewId}/approval`, { is_approved: isApproved }),
};

// Seller API
export const sellerAPI = {
  getMyEarnings: (params) => api.get('/api/seller/my-earnings', { params }),
  getStats: () => api.get('/api/seller/stats'),

  // Seller Dashboard - Cheat Sheet Management
  getMyCheatSheets: (params) => api.get('/api/seller/my-cheatsheets', { params }),
  // Daily sales/earnings/views per sheet for the last 90 days.
  getPerformance: () => api.get('/api/seller/my-cheatsheets/performance'),
  // Payouts: this month's estimate, 12-month history, masked bank on file.
  getPayouts: () => api.get('/api/seller/payouts'),
  getPayoutStatement: (year, month) => api.get(`/api/seller/payouts/${year}/${month}`),
  toggleActive: (id) => api.patch(`/api/seller/cheatsheets/${id}/toggle-active`),
  toggleSponsored: (id) => api.patch(`/api/seller/cheatsheets/${id}/toggle-sponsored`),
  getSponsorshipFee: () => api.get('/api/seller/sponsorship-fee'),
};

// Seller Applications API
export const sellerApplicationAPI = {
  submit: (data) => api.post('/api/seller-applications', data),

  getMy: () => api.get('/api/seller-applications/my'),

  // Admin
  getAll: (params) => api.get('/api/seller-applications/admin/all', { params }),

  approve: (id, adminNotes) =>
    api.post(`/api/seller-applications/${id}/approve`, { admin_notes: adminNotes }),

  reject: (id, adminNotes) =>
    api.post(`/api/seller-applications/${id}/reject`, { admin_notes: adminNotes }),
};

// Analytics API
export const analyticsAPI = {
  // Track an event
  track: (eventType, data = {}) =>
    api.post('/api/analytics/track', {
      event_type: eventType,
      ...data
    }),

  // Get analytics summary (admin only)
  getSummary: () => api.get('/api/analytics/summary'),

  // Get cheat sheet analytics (admin only)
  getCheatSheetAnalytics: (id) => api.get(`/api/analytics/cheatsheet/${id}`),
};

// Upcoming Exams API
// Course registry API — course_code -> canonical course_name
export const coursesAPI = {
  // institutionId (optional) ranks that institution's courses first
  suggest: (q, institutionId) => api.get('/api/courses/suggest', {
    params: { q, institution_id: institutionId && institutionId !== 'all' ? institutionId : undefined },
  }),

  getByCode: (code) => api.get(`/api/courses/${code}`),

  create: (data) => api.post('/api/courses', data),

  siitLookup: (code) => api.get(`/api/courses/siit-lookup/${code}`),
  // Live name check against the institution's own registrar (SIIT, MFU);
  // institutionId defaults server-side to the caller's institution.
  registrarLookup: (code, institutionId) => api.get(`/api/courses/registrar-lookup/${encodeURIComponent(code)}`, {
    params: institutionId ? { institution_id: institutionId } : undefined,
  }),

  // Admin
  adminGetAll: (params) => api.get('/api/courses/admin/all', { params }),

  adminUpdate: (code, course_name) => api.patch(`/api/courses/admin/${code}`, { course_name }),

  adminDelete: (code) => api.delete(`/api/courses/admin/${code}`),

  adminBulkEnrich: () => api.post('/api/courses/admin/bulk-enrich', {}, { timeout: 120000 }),
};

export const upcomingExamsAPI = {
  // Public - get upcoming exams
  getUpcoming: (params) => api.get('/api/upcoming-exams', { params }),

  // Admin - get all exams (including past)
  getAll: (params) => api.get('/api/upcoming-exams/admin/all', { params }),

  // Admin - create new exam
  create: (data) => api.post('/api/upcoming-exams/admin', data),

  // Admin - look up exam schedule candidates from the SIIT registrar
  siitLookup: (courseCode) => api.get('/api/upcoming-exams/admin/siit-lookup', { params: { courseCode } }),
  // Admin - same, for whichever registrar the institution has (SIIT, MFU, ...)
  registrarLookup: (institutionId, courseCode) => api.get('/api/upcoming-exams/admin/registrar-lookup', { params: { institutionId, courseCode } }),

  // Admin - bulk create exams from JSON
  bulkCreate: (examsArray) => api.post('/api/upcoming-exams/admin/bulk', { exams: examsArray }),

  // Admin - update exam
  update: (id, data) => api.put(`/api/upcoming-exams/admin/${id}`, data),

  // Admin - toggle active status
  toggleActive: (id) => api.patch(`/api/upcoming-exams/admin/${id}/toggle-active`),

  // Admin - delete exam
  delete: (id) => api.delete(`/api/upcoming-exams/admin/${id}`),
};

// Study tags: per-institution programs/faculties (server/routes/studyTags.js).
// Only the picker, Settings and the admin console use them; buyers never see
// tag names on content.
// Peanut turns 1: the party page behind the "Happy Birthday" search.
export const birthdayAPI = {
  status: () => api.get('/api/birthday'),
  claim: () => api.post('/api/birthday/claim'),
};

export const studyTagsAPI = {
  // Public - active tag tree for one institution
  list: (institutionId) => api.get('/api/study-tags', { params: { institution_id: institutionId } }),

  // The signed-in user's picks
  getMine: () => api.get('/api/study-tags/me'),
  setMine: (tagIds) => api.put('/api/study-tags/me', { tag_ids: tagIds }),

  // Staff
  adminList: (institutionId) => api.get('/api/study-tags/admin', { params: { institution_id: institutionId } }),
  adminCreate: (data) => api.post('/api/study-tags/admin', data),
  adminUpdate: (id, data) => api.patch(`/api/study-tags/admin/${id}`, data),
  adminDelete: (id) => api.delete(`/api/study-tags/admin/${id}`),
  adminCourses: (institutionId, untagged) => api.get('/api/study-tags/admin/courses', {
    params: { institution_id: institutionId, untagged: untagged ? 1 : undefined },
  }),
  adminSetSecondSemesterStart: (institutionId, monthDay) => api.patch(
    `/api/study-tags/admin/institutions/${institutionId}`,
    { second_semester_start: monthDay }
  ),
  adminSetCourseTags: (courseCode, institutionId, tagIds) => api.put(
    `/api/study-tags/admin/courses/${encodeURIComponent(courseCode)}`,
    { institution_id: institutionId, tag_ids: tagIds }
  ),
};

// Push Notifications API (admin console)
export const notificationsAPI = {
  sendTest: (title, body) => api.post('/api/notifications/admin/test', { title, body }),
  send: (title, body, target, data) =>
    api.post('/api/notifications/admin/send', { title, body, target, data }),
  getHistory: () => api.get('/api/notifications/admin/history'),
};

// Mock Exams API
export const mockExamsAPI = {
  // institutionId: one institution's set; omit for every institution's.
  getPublic: (institutionId) => api.get('/api/mock-exams', { params: { institution_id: institutionId || undefined } }),
  unlock: (id, password) => api.post(`/api/mock-exams/${id}/unlock`, { password }, {
    validateStatus: (status) => status < 500, // prevent 401 wrong-password from triggering logout interceptor
  }),
  adminGetAll: () => api.get('/api/mock-exams/admin/all'),
  create: (data) => api.post('/api/mock-exams/admin', data),
  update: (id, data) => api.put(`/api/mock-exams/admin/${id}`, data),
  delete: (id) => api.delete(`/api/mock-exams/admin/${id}`),

  // File management (question papers / answer keys) — either a PDF upload
  // (send `formData` with a `pdf` field, pushed to GCS) or an external URL
  // (send a plain object with a `url` field instead) — both go through the
  // same endpoint since the server distinguishes by which is present.
  adminGetFiles: (examId) => api.get(`/api/mock-exams/admin/${examId}/files`),
  adminAddFile: (examId, data, onUploadProgress) => api.post(
    `/api/mock-exams/admin/${examId}/files`,
    data,
    data instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 300000, onUploadProgress }
      : undefined
  ),
  adminDeleteFile: (fileId) => api.delete(`/api/mock-exams/admin/files/${fileId}`),
};

// Institutions API
// Public site settings (no auth) — currently just the homepage announcement
export const settingsAPI = {
  getAnnouncement: () => api.get('/api/settings/announcement'),
};

// Admin-only bundle discount tier CRUD (min_items -> discount_percentage,
// e.g. buy 2+ get 10% off). Also read by server/services/checkoutService.js
// and GET /api/cart at checkout/pricing time — no client wrapper needed for
// those, they're server-internal.
export const bundleDiscountsAPI = {
  adminGetAll: () => api.get('/api/admin/bundle-discounts'),
  create: (data) => api.post('/api/admin/bundle-discounts', data),
  update: (id, data) => api.put(`/api/admin/bundle-discounts/${id}`, data),
  toggleActive: (id) => api.patch(`/api/admin/bundle-discounts/${id}/toggle`),
  delete: (id) => api.delete(`/api/admin/bundle-discounts/${id}`),
};

export const campaignLinksAPI = {
  adminGetAll: (cheatsheetId) => api.get('/api/admin/campaign-links', { params: cheatsheetId ? { cheatsheet_id: cheatsheetId } : {} }),
  create: (data) => api.post('/api/admin/campaign-links', data),
  toggleActive: (id) => api.patch(`/api/admin/campaign-links/${id}/toggle`),
  delete: (id) => api.delete(`/api/admin/campaign-links/${id}`),
};

export const institutionsAPI = {
  getAll: () => api.get('/api/institutions'),

  // Admin - list all institutions (including inactive)
  adminGetAll: () => api.get('/api/admin/institutions'),

  // Admin - create new institution
  create: (data) => api.post('/api/admin/institutions', data),

  // Admin - update institution
  update: (id, data) => api.put(`/api/admin/institutions/${id}`, data),

  // Admin - toggle active status
  toggleActive: (id) => api.patch(`/api/admin/institutions/${id}/toggle`),

  // Admin - upload/replace an institution's logo (multipart, field name "logo")
  uploadLogo: (id, formData) => api.post(`/api/admin/institutions/${id}/logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Admin - delete institution
  delete: (id) => api.delete(`/api/admin/institutions/${id}`),

  // Any authenticated user - request a new institution be added
  submitRequest: (data) => api.post('/api/institutions/requests', data),
  getMyRequest: () => api.get('/api/institutions/requests/my'),

  // Staff/admin - review institution requests
  adminGetAllRequests: (params) => api.get('/api/admin/institution-requests', { params }),
  approveRequest: (id, data) => api.post(`/api/admin/institution-requests/${id}/approve`, data),
  rejectRequest: (id, admin_notes) => api.post(`/api/admin/institution-requests/${id}/reject`, { admin_notes }),
};

// Flagship Stores API
export const storesAPI = {
  // Public
  getBySlug: (slug) => api.get(`/api/stores/${slug}`),

  // Any uploader (is_seller || is_admin)
  submitRequest: (data) => api.post('/api/stores/requests', data),
  getMyRequest: () => api.get('/api/stores/requests/my'),
  getMyStore: () => api.get('/api/stores/mine'),
  uploadBanner: (storeId, formData, onUploadProgress) => api.post(`/api/stores/${storeId}/banner`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
    onUploadProgress,
  }),
  uploadIcon: (storeId, formData, onUploadProgress) => api.post(`/api/stores/${storeId}/icon`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
    onUploadProgress,
  }),

  // Admin
  getAllRequests: (params) => api.get('/api/stores/requests/admin/all', { params }),
  approveRequest: (id, data) => api.post(`/api/stores/requests/${id}/approve`, data),
  rejectRequest: (id, adminNotes) => api.post(`/api/stores/requests/${id}/reject`, { admin_notes: adminNotes }),
  searchEligibleMembers: (search) => api.get('/api/stores/admin/eligible-users', { params: { search } }),
  adminCreate: (data) => api.post('/api/stores/admin/create', data),
  adminGetAllStores: () => api.get('/api/stores/admin/all'),
};

// SafeQ print-quota balance + print submission — Thammasat-only, each
// visitor submits their own SafeQ username/password. Verifying once unlocks
// print submission for 30 days with no further password entry (balance
// checks still need the password every time — SafeQ requires a live session
// for that, which this site never caches).
export const safeqAPI = {
  // validateStatus prevents a wrong SafeQ password (401) from tripping the
  // global response interceptor's "401 = your site session is invalid, log
  // out" handling — same fix as mockExamsAPI.unlock below. Callers must
  // check response.data.success themselves instead of relying on catch.
  getBalance: (username, password) => api.post('/api/safeq/balance', { username, password }, {
    validateStatus: (status) => status < 500,
  }),
  verify: (username, password) => api.post('/api/safeq/verify', { username, password }, {
    validateStatus: (status) => status < 500,
  }),
  getStatus: () => api.get('/api/safeq/status'),
  submitPrint: (formData) => api.post('/api/safeq/print', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Print Service API
export const printServiceAPI = {
  getSettings: (cheatsheetId) =>
    api.get(`/api/print-service/settings/${cheatsheetId}`),

  saveSettings: (cheatsheetId, data) =>
    api.put(`/api/print-service/settings/${cheatsheetId}`, data),

  createRequest: (data) =>
    api.post('/api/print-service/requests', data),

  getMyRequests: () =>
    api.get('/api/print-service/my-requests'),

  getRequestById: (requestId) =>
    api.get(`/api/print-service/requests/${requestId}`),

  getSellerRequests: (params) =>
    api.get('/api/print-service/seller-requests', { params }),

  updateRequestStatus: (requestId, status) =>
    api.patch(`/api/print-service/requests/${requestId}/status`, { status }),
};

export default api;
