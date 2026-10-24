/**
 * CareCompass Platform Admin Controller
 * Manages hospital verification reviews, approvals, private documents, and audit logs.
 */

const partnerService = require('../services/partnerService');
const authService = require('../services/authService');
const db = require('../db/supabase');

/**
 * POST /api/admin/auth/login
 * Public endpoint: Authenticate platform administrator
 */
async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const authResult = await authService.adminLogin(email, password);
    res.json({
      success: true,
      token: authResult.token,
      admin: authResult.admin
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      error: err.message
    });
  }
}

/**
 * GET /api/admin/verifications
 * Protected (requireAdminAuth): List hospital verification requests
 */
async function listRequests(req, res, next) {
  try {
    const { status, limit, offset } = req.query;
    const result = await partnerService.adminListVerificationRequests({
      status,
      limit,
      offset
    });
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/verifications/:id/approve
 * Protected (requireAdminAuth): Approve verification
 */
async function approveRequest(req, res, next) {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const result = await partnerService.adminApproveVerification({
      requestId: id,
      adminId: req.admin.id,
      adminEmail: req.admin.email,
      adminNotes: notes,
      ipAddress: req.ip
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
}

/**
 * POST /api/admin/verifications/:id/reject
 * Protected (requireAdminAuth): Reject verification
 */
async function rejectRequest(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const result = await partnerService.adminRejectVerification({
      requestId: id,
      adminId: req.admin.id,
      adminEmail: req.admin.email,
      rejectionReason: reason,
      ipAddress: req.ip
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
}

/**
 * GET /api/admin/audit-logs
 * Protected (requireAdminAuth): View platform & hospital audit logs
 */
async function getAuditLogs(req, res, next) {
  try {
    const { hospitalId, limit, offset } = req.query;
    const logs = await partnerService.getAuditLogs({
      hospitalId,
      limit,
      offset
    });
    res.json({
      success: true,
      logs
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/verifications/:id/documents/:docId
 * Protected (requireAdminAuth): Access private verification documents metadata & securely serve
 */
async function getDocument(req, res, next) {
  try {
    const { id, docId } = req.params;
    const docRes = await db.query(
      'SELECT * FROM verification_documents WHERE id = $1 AND request_id = $2 LIMIT 1',
      [docId, id]
    );

    if (docRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Verification document not found.'
      });
    }

    const doc = docRes.rows[0];
    res.json({
      success: true,
      document: {
        id: doc.id,
        fileName: doc.file_name,
        fileType: doc.file_type,
        fileSizeBytes: doc.file_size_bytes,
        storagePath: doc.storage_path,
        uploadedAt: doc.uploaded_at,
        accessLevel: doc.access_level
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  adminLogin,
  listRequests,
  approveRequest,
  rejectRequest,
  getAuditLogs,
  getDocument
};
