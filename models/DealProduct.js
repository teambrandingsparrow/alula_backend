// models/DealProduct.js
import mongoose from 'mongoose';

const DealProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    dealOfferprice: {
      type: Number,
    },
    dealPercentage: {
      type: Number,
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
      type: Date,
    },
    media: [
      {
        type: { type: String }, // 'image' or 'video'
        url: String,
        public_id: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('DealProduct', DealProductSchema);
