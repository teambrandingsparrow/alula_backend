import mongoose from 'mongoose';

const comboProductSchema = new mongoose.Schema(
  {
    comboProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    offerprice: {
      type: Number,
      required: true,
    },
    offerPercentage: {
      type: Number,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date, // Optional, can be set = endDate
    },
     media: [
      {
        type: { type: String }, // 'image' or 'video'
        url: String,
        public_id: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Optional: auto-set expiresAt based on endDate
comboProductSchema.pre('save', function (next) {
  if (!this.expiresAt && this.endDate) {
    this.expiresAt = this.endDate;
  }
  next();
});

export default mongoose.model('ComboProduct', comboProductSchema);

