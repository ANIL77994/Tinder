
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        orderId: {
            type: String,
            required: true,
            unique: true
        },

        membershipType: {
            type: String,
            required: true
        },

        status: {
            type: String,
            required: true,
            default: "created"
        },

        amount: {
            type: Number,
            required: true
        },

        currency: {
            type: String,
            required: true,
            default: "INR"
        },

        receipt: {
            type: String,
            required: true
        },

        expiresAt: {
            type: Date,
            required: true
        },

        notes: {
            firstName: {
                type: String
            },

            lastName: {
                type: String
            },

            email: {
                type: String
            }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Payment", paymentSchema);

