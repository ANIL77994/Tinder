const razorPayInstance = require("../utils/razorpay.js");
const crypto = require("crypto");
const paymentModel = require("../models/paymentModel.js");

// ============================================
// SERVER-SIDE SOURCE OF TRUTH FOR PRICING
// Never trust amount from the client
// ============================================
const PLAN_PRICES = {
    silver: 199,
    gold: 499,
    platinum: 999
};

const primiumController = async (req, res) => {
    const { firstName, lastName, email, _id } = req.user;

    try {
        const membershipType = req.body.membershipType;

        // ============================================
        // 1. VALIDATE PLAN + DERIVE AMOUNT SERVER-SIDE
        // ============================================
        if (!membershipType || !PLAN_PRICES.hasOwnProperty(membershipType)) {
            return res.status(400).json({
                success: false,
                message: "Valid membershipType is required"
            });
        }

        const amount = PLAN_PRICES[membershipType]; // trust only this

        const now = new Date();

        // ============================================
        // 2. CHECK SAME PLAN PENDING ORDER
        // ============================================
        const existingOrder = await paymentModel.findOne({
            userId: _id,
            membershipType: membershipType,
            status: "created",
            expiresAt: { $gt: now }
        });

        if (existingOrder) {
            return res.status(200).json({
                success: true,
                message: "Existing pending order reused",
                order: existingOrder
            });
        }

        // ============================================
        // 3. CANCEL OTHER PENDING ORDERS (different plan)
        // ============================================
        await paymentModel.updateMany(
            {
                userId: _id,
                status: "created",
                expiresAt: { $gt: now }
            },
            { $set: { status: "cancelled" } }
        );

        // ============================================
        // 4. CREATE NEW RAZORPAY ORDER
        // ============================================
        const options = {
            amount: amount * 100, // paise
            currency: "INR",
            receipt: `${_id}_${Date.now()}`,
            partial_payment: false,
            notes: {
                firstName,
                lastName,
                email,
                membershipType
            }
        };

        let order;
        try {
            order = await razorPayInstance.orders.create(options);
        } catch (razorpayError) {
            console.error("Razorpay order creation failed:", razorpayError);
            return res.status(502).json({
                success: false,
                message: "Payment gateway error, please try again"
            });
        }

        // ============================================
        // 5. SAVE NEW ORDER (with duplicate-key guard)
        // ============================================
        let savedPayment;
        try {
            const payment = new paymentModel({
                userId: _id,
                orderId: order.id,
                membershipType: membershipType,
                status: "created",
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt,
                notes: {
                    firstName,
                    lastName,
                    email,
                    membershipType
                },
                expiresAt: new Date(Date.now() + 10 * 60 * 1000)
            });

            savedPayment = await payment.save();
        } catch (dbError) {
            // Order exists on Razorpay but DB save failed — log for manual reconciliation
            console.error(
                `CRITICAL: Razorpay order ${order.id} created but DB save failed for user ${_id}:`,
                dbError
            );

            // Duplicate key = race condition, another request already created the pending order
            if (dbError.code === 11000) {
                const raceOrder = await paymentModel.findOne({
                    userId: _id,
                    membershipType: membershipType,
                    status: "created",
                    expiresAt: { $gt: now }
                });
                if (raceOrder) {
                    return res.status(200).json({
                        success: true,
                        message: "Existing pending order reused",
                        order: raceOrder
                    });
                }
            }

            return res.status(500).json({
                success: false,
                message: "Failed to save order, please contact support",
                razorpayOrderId: order.id // helps support trace the orphaned order
            });
        }

        // ============================================
        // 6. RESPONSE
        // ============================================
        return res.status(200).json({
            success: true,
            message: "New payment order created",
            order: savedPayment
        });
    } catch (error) {
        console.error("Premium API error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    primiumController
};