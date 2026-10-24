/**
 * CareCompass Platform Administration Routes
 * Manages verification reviews, approvals, private documents, and system audit logs.
 */

const express = require('express');
const router = express.Router();
const adminPartnerController = require('../controllers/adminPartnerController');
const { requireAdminAuth } = require('../middleware/authMiddleware');
const { lookupLimiter } = require('../middleware/rateLimiter');

// Admin Login
router.post('/auth/login', lookupLimiter, adminPartnerController.adminLogin);

// Protected Admin Endpoints
router.get('/verifications', requireAdminAuth, adminPartnerController.listRequests);
router.post('/verifications/:id/approve', requireAdminAuth, adminPartnerController.approveRequest);
router.post('/verifications/:id/reject', requireAdminAuth, adminPartnerController.rejectRequest);
router.get('/verifications/:id/documents/:docId', requireAdminAuth, adminPartnerController.getDocument);
router.get('/verifications/:id/documents/:docId/download', requireAdminAuth, adminPartnerController.downloadDocument);
router.get('/audit-logs', requireAdminAuth, adminPartnerController.getAuditLogs);

module.exports = router;
