import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Default membership tiers (seeded if not exists)
const DEFAULT_TIERS = [
  {
    name: 'basic',
    price: 500, // $5.00 AUD
    interval: 'month',
    features: JSON.stringify([
      'Access to all basic pages',
      'Stock market participation',
      'Daily challenges',
      'Basic shop items',
      'Activity feed access'
    ])
  },
  {
    name: 'pro',
    price: 1500, // $15.00 AUD
    interval: 'month',
    features: JSON.stringify([
      'Everything in Basic',
      'Mech game access',
      'Advanced analytics',
      'Priority feature requests',
      'Exclusive shop items',
      'Custom profile themes'
    ])
  },
  {
    name: 'premium',
    price: 3000, // $30.00 AUD
    interval: 'month',
    features: JSON.stringify([
      'Everything in Pro',
      'API access',
      'Beta feature access',
      'Direct Discord support',
      'Exclusive cosmetic items',
      'No rate limits',
      'Custom badges'
    ])
  }
];

// Seed default tiers
async function seedTiers(): Promise<void> {
  const count = await prisma.membershipTier.count();
  if (count > 0) return;

  await prisma.membershipTier.createMany({
    data: DEFAULT_TIERS
  });
  console.log('✅ Membership tiers seeded');
}

/**
 * @openapi
 * /api/subscriptions/tiers:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Get all available membership tiers
 *     responses:
 *       200:
 *         description: List of membership tiers
 */
router.get('/tiers', async (req: Request, res: Response) => {
  try {
    await seedTiers();
    const tiers = await prisma.membershipTier.findMany({
      where: { is_active: true },
      orderBy: { price: 'asc' }
    });

    const formattedTiers = tiers.map(tier => ({
      ...tier,
      features: JSON.parse(tier.features),
      priceDisplay: `$${(tier.price / 100).toFixed(2)}`
    }));

    res.json({ tiers: formattedTiers });
  } catch (error) {
    console.error('Error fetching tiers:', error);
    res.status(500).json({ error: 'Failed to fetch membership tiers' });
  }
});

/**
 * @openapi
 * /api/subscriptions/status:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Get current user's subscription status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User subscription status
 */
router.get('/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        subscription_tier: true,
        subscription_status: true,
        subscription_start: true,
        subscription_end: true,
        payment_method: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if subscription is still valid
    let isActive = user.subscription_status === 'active';
    if (isActive && user.subscription_end) {
      const now = new Date();
      if (now > user.subscription_end) {
        isActive = false;
        // Update expired subscription
        await prisma.user.update({
          where: { id: req.user!.id },
          data: { subscription_status: 'expired' }
        });
      }
    }

    res.json({
      subscription: {
        tier: user.subscription_tier || 'free',
        status: isActive ? 'active' : (user.subscription_status || 'none'),
        startDate: user.subscription_start,
        endDate: user.subscription_end,
        paymentMethod: user.payment_method,
        isActive
      }
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

/**
 * @openapi
 * /api/subscriptions/checkout:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Initiate subscription checkout
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tier, paymentMethod]
 *             properties:
 *               tier:
 *                 type: string
 *                 enum: [basic, pro, premium]
 *               paymentMethod:
 *                 type: string
 *                 enum: [paypal, bank_transfer]
 *     responses:
 *       200:
 *         description: Checkout initiated
 */
router.post('/checkout', requireAuth, async (req: Request, res: Response) => {
  try {
    const { tier, paymentMethod } = req.body;

    if (!tier || !paymentMethod) {
      return res.status(400).json({ error: 'Tier and payment method are required' });
    }

    // Get tier details
    const tierData = await prisma.membershipTier.findUnique({
      where: { name: tier }
    });

    if (!tierData) {
      return res.status(404).json({ error: 'Invalid tier' });
    }

    // Create pending payment record
    const payment = await prisma.subscriptionPayment.create({
      data: {
        user_id: req.user!.id,
        tier_name: tier,
        amount: tierData.price,
        payment_method: paymentMethod,
        status: 'pending'
      }
    });

    if (paymentMethod === 'paypal') {
      // For PayPal, return checkout URL (in production, you'd integrate PayPal SDK)
      // This creates a manual flow where user pays and we verify
      res.json({
        success: true,
        paymentId: payment.id,
        checkoutUrl: `/shop/checkout/${payment.id}`,
        amount: tierData.price,
        currency: 'AUD',
        message: 'Complete payment via PayPal'
      });
    } else if (paymentMethod === 'bank_transfer') {
      // Return bank details for manual transfer
      res.json({
        success: true,
        paymentId: payment.id,
        bankDetails: {
          accountName: 'Seethbot Services',
          bsb: '062-000', // Placeholder - replace with real details
          accountNumber: '12345678', // Placeholder
          reference: `SUB${payment.id}`,
          amount: tierData.price / 100,
          currency: 'AUD'
        },
        message: 'Please transfer the amount with the reference code. Subscription will be activated after verification.'
      });
    }
  } catch (error) {
    console.error('Error creating checkout:', error);
    res.status(500).json({ error: 'Failed to create checkout' });
  }
});

/**
 * @openapi
 * /api/subscriptions/confirm-bank:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Confirm bank transfer payment (for admin use or manual confirmation)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paymentId]
 *             properties:
 *               paymentId:
 *                 type: integer
 *               bankRef:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment confirmed and subscription activated
 */
router.post('/confirm-bank', requireAuth, async (req: Request, res: Response) => {
  try {
    const { paymentId, bankRef } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    const payment = await prisma.subscriptionPayment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Payment already processed' });
    }

    // Mark payment as completed
    await prisma.subscriptionPayment.update({
      where: { id: paymentId },
      data: {
        status: 'completed',
        bank_ref: bankRef,
        completed_at: new Date()
      }
    });

    // Activate subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        subscription_tier: payment.tier_name,
        subscription_status: 'active',
        subscription_start: startDate,
        subscription_end: endDate,
        payment_method: 'bank_transfer'
      }
    });

    res.json({
      success: true,
      message: 'Subscription activated successfully',
      subscription: {
        tier: payment.tier_name,
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Error confirming bank payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

/**
 * @openapi
 * /api/subscriptions/paypal/complete:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Complete PayPal payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paymentId, orderId]
 *             properties:
 *               paymentId:
 *                 type: integer
 *               orderId:
 *                 type: string
 *               txnId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment completed and subscription activated
 */
router.post('/paypal/complete', requireAuth, async (req: Request, res: Response) => {
  try {
    const { paymentId, orderId, txnId } = req.body;

    if (!paymentId || !orderId) {
      return res.status(400).json({ error: 'Payment ID and Order ID are required' });
    }

    const payment = await prisma.subscriptionPayment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Payment already processed' });
    }

    // Mark payment as completed
    await prisma.subscriptionPayment.update({
      where: { id: paymentId },
      data: {
        status: 'completed',
        paypal_order_id: orderId,
        paypal_txn_id: txnId,
        completed_at: new Date()
      }
    });

    // Activate subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        subscription_tier: payment.tier_name,
        subscription_status: 'active',
        subscription_start: startDate,
        subscription_end: endDate,
        payment_method: 'paypal'
      }
    });

    res.json({
      success: true,
      message: 'Subscription activated successfully',
      subscription: {
        tier: payment.tier_name,
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Error completing PayPal payment:', error);
    res.status(500).json({ error: 'Failed to complete payment' });
  }
});

/**
 * @openapi
 * /api/subscriptions/cancel:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Cancel subscription
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription cancelled
 */
router.post('/cancel', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user || !user.subscription_tier) {
      return res.status(400).json({ error: 'No active subscription' });
    }

    // Mark subscription as cancelled (but keep active until end date)
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { subscription_status: 'cancelled' }
    });

    res.json({
      success: true,
      message: 'Subscription cancelled. You will have access until the end of your billing period.',
      accessUntil: user.subscription_end
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

/**
 * @openapi
 * /api/subscriptions/history:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Get payment history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment history
 */
router.get('/history', requireAuth, async (req: Request, res: Response) => {
  try {
    const payments = await prisma.subscriptionPayment.findMany({
      where: { user_id: req.user!.id },
      orderBy: { created_at: 'desc' },
      take: 20
    });

    res.json({ payments });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Admin endpoint to verify bank transfers
router.post('/admin/verify', requireAuth, async (req: Request, res: Response) => {
  try {
    // TODO: Add admin check
    const { paymentId, approve, notes } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    const payment = await prisma.subscriptionPayment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (approve) {
      // Activate subscription
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await prisma.$transaction([
        prisma.subscriptionPayment.update({
          where: { id: paymentId },
          data: {
            status: 'completed',
            admin_notes: notes,
            completed_at: new Date()
          }
        }),
        prisma.user.update({
          where: { id: payment.user_id },
          data: {
            subscription_tier: payment.tier_name,
            subscription_status: 'active',
            subscription_start: startDate,
            subscription_end: endDate,
            payment_method: 'bank_transfer'
          }
        })
      ]);

      res.json({ success: true, message: 'Payment verified and subscription activated' });
    } else {
      await prisma.subscriptionPayment.update({
        where: { id: paymentId },
        data: {
          status: 'failed',
          admin_notes: notes
        }
      });

      res.json({ success: true, message: 'Payment rejected' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

export default router;
