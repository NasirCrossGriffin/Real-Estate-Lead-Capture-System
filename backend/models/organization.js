const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    webhook : {
      type: String,
      required: false,
      trim: true,
    },
    logo: {
      type: String, // URL or file path
      required: false
    },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Organization', OrganizationSchema);
