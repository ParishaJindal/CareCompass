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
    const signedToken = authService.generateDocumentSignedToken(doc.id, id, req.admin.id, 900);

    res.json({
      success: true,
      document: {
        id: doc.id,
        fileName: doc.file_name,
        fileType: doc.file_type,
        fileSizeBytes: doc.file_size_bytes,
        storagePath: doc.storage_path,
        uploadedAt: doc.uploaded_at,
        accessLevel: doc.access_level,
        signedDownloadUrl: `/api/admin/verifications/${id}/documents/${doc.id}/download?token=${signedToken}`,
        signedUrlExpiresInSeconds: 900
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/verifications/:id/documents/:docId/download
 * Validate signed token and serve private document
 */
async function downloadDocument(req, res, next) {
  try {
    const { id, docId } = req.params;
    const { token } = req.query;

    // Both administrator authentication AND document authorization token required (Requirement 7)
    if (!req.admin || !req.admin.id) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Valid administrator authentication session required to download private verification documents.'
      });
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Signed authorization token required to access private verification documents.'
      });
    }

    // Verify token matches document, request, AND the authenticated admin
    const isValid = authService.verifyDocumentSignedToken(token, docId, id, req.admin.id);
    if (!isValid) {
      return res.status(403).json({
        success: false,
        error: 'Invalid, forged, expired, or unauthorized document access token. Signed links expire in 15 minutes and can only be used by the authorized administrator who requested them.'
      });
    }

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

    // Audit log private document access
    await authService.logAudit({
      eventType: 'private_document_accessed',
      entityType: 'verification_document',
      entityId: String(doc.id),
      hospitalId: doc.hospital_id,
      actorType: 'admin',
      action: `Admin accessed private verification document ${doc.file_name}`,
      details: { docId: doc.id, requestId: id, storagePath: doc.storage_path },
      ipAddress: req.ip
    });

    res.setHeader('Content-Type', doc.file_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${doc.file_name}"`);
    res.send(`[CareCompass Private Storage] Verified Document: ${doc.file_name} (${doc.storage_path})`);
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
  getDocument,
  downloadDocument
};
