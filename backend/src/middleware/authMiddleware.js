/**
 * CareCompass Zero-Trust Authentication Middleware
 * Enforces role-based permissions and strict tenant data isolation.
 */

const authService = require('../services/authService');
const db = require('../db/supabase');

/**
 * Middleware: Enforces authenticated hospital staff with verified hospital status
 */
async function requireStaffAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Missing or malformed Bearer token.'
      });
    }

    const token = authHeader.substring(7).trim();
    let payload;
    try {
      payload = authService.verifyToken(token);
    } catch (tokenErr) {
      return res.status(401).json({
        success: false,
        error: tokenErr.message
      });
    }

    if (!payload.hospitalId || !['hospital_staff', 'hospital_admin'].includes(payload.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Account lacks hospital staff permissions.'
      });
    }

    // Verify staff account exists and is still active
    const staffRes = await db.query(
      'SELECT id, hospital_id, full_name, email, role, is_active FROM hospital_staff_users WHERE id = $1 LIMIT 1',
      [payload.sub]
    );

    if (staffRes.rowCount === 0 || !staffRes.rows[0].is_active) {
      return res.status(403).json({
        success: false,
        error: 'Staff account has been deactivated or does not exist.'
      });
    }

    // Verify hospital remains verified
    const provRes = await db.query(
      'SELECT verification_status FROM appointment_providers WHERE hospital_id = $1 LIMIT 1',
      [payload.hospitalId]
    );

    const verificationStatus = provRes.rowCount > 0 ? provRes.rows[0].verification_status : 'Not Verified';
    if (verificationStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        error: `Hospital status is '${verificationStatus}'. Access requires active verification.`
      });
    }

    req.staff = {
      id: staffRes.rows[0].id,
      hospitalId: staffRes.rows[0].hospital_id,
      hospitalName: payload.hospitalName || 'Partner Hospital',
      email: staffRes.rows[0].email,
      fullName: staffRes.rows[0].full_name,
      role: staffRes.rows[0].role
    };

    next();
  } catch (err) {
    console.error('[requireStaffAuth Error]:', err.message);
    res.status(500).json({
      success: false,
      error: 'Internal authorization validation failure.'
    });
  }
}

/**
 * Middleware: Enforces authenticated platform administrator
 */
async function requireAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Administrator authentication required. Missing Bearer token.'
      });
    }

    const token = authHeader.substring(7).trim();
    let payload;
    try {
      payload = authService.verifyToken(token);
    } catch (tokenErr) {
      return res.status(401).json({
        success: false,
        error: tokenErr.message
      });
    }

    if (!['platform_admin', 'compliance_officer', 'system_admin'].includes(payload.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Account lacks platform administrator privileges.'
      });
    }

    const adminRes = await db.query(
      'SELECT id, email, full_name, role, is_active FROM admin_users WHERE id = $1 LIMIT 1',
      [payload.sub]
    );

    if (adminRes.rowCount === 0 || !adminRes.rows[0].is_active) {
      return res.status(403).json({
        success: false,
        error: 'Administrator account has been deactivated or does not exist.'
      });
    }

    req.admin = {
      id: adminRes.rows[0].id,
      email: adminRes.rows[0].email,
      fullName: adminRes.rows[0].full_name,
      role: adminRes.rows[0].role
    };

    next();
  } catch (err) {
    console.error('[requireAdminAuth Error]:', err.message);
    res.status(500).json({
      success: false,
      error: 'Internal admin authorization validation failure.'
    });
  }
}

module.exports = {
  requireStaffAuth,
  requireAdminAuth
};
