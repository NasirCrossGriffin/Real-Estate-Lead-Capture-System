const mongoose = require('mongoose');

const RealEstateQuerySchema = new mongoose.Schema(
  {
    // Multi-tenant isolation
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },

    // Customer reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Property address
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 2,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
    },

    // Foreclosure / loan details
    facingForeclosure: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    currentLoanBalance: {
      type: Number,
      required: false,
      min: 0,
    },
    amountBehind: {
      type: Number,
      required: false,
      min: 0,
    },
    loanType: {
      type: String,
      required: false,
      trim: true,
      enum: [
        'conventional',
        'fha',
        'va',
        'usda',
        'jumbo',
        'heloc',
        'hard_money',
        'other',
        'N/A',
      ],
    },
    lenderName: {
      type: String,
      required: false,
      trim: true,
    },

    auctionDate: {
      type: Date,
      required: false,
      index: true,
    },

    description: {
      type: String,
      required: false,
      trim: true,
    },

    consultationDate: {
      type: Date,
      required: true,
    },

    // Requested service
    service: {
      type: String,
      required: true,
      enum: ['buy', 'sell', 'invest'],
      index: true,
    },

    viewed: {
      type: Boolean,
      required: true,
      default: false
    },

    responded: {
      type: Boolean,
      required: true,
      default: false
    },
    status: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'new',
        'contacted',
        'appointment_set',
        'offer_made',
        'under_contract',
        'closed',
        'dead',
      ],
      default: 'new'
    },
    followUpDate: {
      type: Date,
      required: true,
      default: (new Date).toISOString()
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RealEstateQuery', RealEstateQuerySchema);