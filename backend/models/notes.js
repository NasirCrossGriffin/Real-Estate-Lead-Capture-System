const mongoose = require("mongoose");

const { Schema } = mongoose;

const NoteSchema = new Schema(
  {
    realEstateQuery: {
      type: Schema.Types.ObjectId,
      ref: "RealEstateQuery",
      required: true,
      index: true,
    },
    note: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Note", NoteSchema);