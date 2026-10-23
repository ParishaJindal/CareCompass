/**
 * CareCompass — Razorpay Payment Gateway Service
 * Handles secure order creation, HMAC SHA256 signature verification, webhooks, and refunds.
 * Card numbers and CVVs are NEVER handled by CareCompass servers; standard Razorpay Checkout is used.
 */

const crypto = require('node:crypto');
let Razorpay;
try {
  Razorpay = require('razorpay');
} catch (e) {
  Razorpay = null;
}

const KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_CareCompassDevKey';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'carecompass_secret_test_key_123';
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'carecompass_webhook_test_456';

let razorpayClient = null;

// Initialize official Razorpay SDK instance if valid credentials provided
if (Razorpay && KEY_ID && KEY_SECRET && !KEY_ID.includes('Sample') && !KEY_ID.includes('DevKey')) {
  try {
    razorpayClient = new Razorpay({
      key_id: KEY_ID,
      key_secret: KEY_SECRET
    });
    console.log('[Razorpay Service] Initialized with official credentials (Test/Live Mode).');
  } catch (err) {
    console.warn('[Razorpay Service] Failed to initialize official SDK, using test simulator:', err.message);
  }
}

/**
 * Get public payment gateway configuration for frontend checkout modal
 */
function getPublicConfig() {
  return {
    keyId: KEY_ID,
    isTestMode: KEY_ID.startsWith('rzp_test_'),
    currency: 'INR',
    companyName: 'CareCompass Healthcare',
    themeColor: '#0d9488',
    serviceFee: 0.00,
    supportEmail: 'support@carecompass.org',
    supportPhone: '+91 1800 123 4567'
  };
}

/**
 * Generate a cryptographically secure mock signature for test environments
 */
function generateTestSignature(orderId, paymentId, secret = KEY_SECRET) {
  return crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
}

/**
 * Create a new payment order with Razorpay
 * @param {Object} options
 * @param {number} options.amount - Amount in Rupees (e.g., 500.00)
 * @param {string} options.receipt - Unique booking reference (e.g., CC-20261023-8472)
 * @param {Object} [options.notes] - Associated metadata
 */
async function createOrder({ amount, receipt, notes = {} }) {
  const amountInPaise = Math.round(Number(amount) * 100);

  if (amountInPaise <= 0) {
    throw new Error('Appointment payable amount must be greater than zero.');
  }

  // If live or official Razorpay test keys are configured and client is active
  if (razorpayClient) {
    try {
      const order = await razorpayClient.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receipt.slice(0, 40), // Razorpay 40 char receipt limit
        notes: {
          booking_reference: receipt,
          ...notes
        }
      });
      return {
        orderId: order.id,
        amount: order.amount / 100,
        amountInPaise: order.amount,
        currency: order.currency,
        status: order.status,
        receipt: order.receipt,
        keyId: KEY_ID,
        isSimulated: false
      };
    } catch (err) {
      console.error('[Razorpay Order Creation Failed]:', err);
      throw new Error(`Razorpay Order creation failed: ${err.error?.description || err.message}`);
    }
  }

  // Deterministic, secure local test mode order for test environments
  const testOrderId = `order_test_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
  return {
    orderId: testOrderId,
    amount: Number(amount),
    amountInPaise,
    currency: 'INR',
    status: 'created',
    receipt,
    keyId: KEY_ID,
    isSimulated: true
  };
}

/**
 * Verify Razorpay payment signature
 * Verifies that the payment callback came from the genuine Razorpay checkout
 * HMAC SHA256 of (order_id + "|" + payment_id) with razorpay_key_secret
 */
function verifyPaymentSignature({ orderId, paymentId, signature }) {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8')
    );
  } catch (err) {
    console.error('[Razorpay Signature Verification Error]:', err.message);
    return false;
  }
}

/**
 * Verify Razorpay Webhook signature
 */
function verifyWebhookSignature(rawBody, signature) {
  if (!rawBody || !signature || !WEBHOOK_SECRET) return false;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8')
    );
  } catch (err) {
    console.error('[Razorpay Webhook Verification Error]:', err.message);
    return false;
  }
}

/**
 * Initiate an automated refund for cancelled eligible appointments
 */
async function processRefund({ paymentId, amount, notes = {} }) {
  const amountInPaise = Math.round(Number(amount) * 100);

  if (razorpayClient && paymentId && !paymentId.startsWith('pay_test_')) {
    try {
      const refund = await razorpayClient.payments.refund(paymentId, {
        amount: amountInPaise,
        notes: {
          reason: 'CareCompass patient cancellation within authorized policy',
          ...notes
        }
      });
      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      };
    } catch (err) {
      console.error('[Razorpay Refund Error]:', err);
      return {
        success: false,
        error: err.error?.description || err.message
      };
    }
  }

  // Simulated test refund
  const refundId = `rfnd_test_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
  return {
    success: true,
    refundId,
    amount: Number(amount),
    status: 'processed',
    isSimulated: true
  };
}

module.exports = {
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  processRefund,
  getPublicConfig,
  generateTestSignature,
  KEY_ID
};
