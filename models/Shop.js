// models/Shop.js
import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
    },
    address: String,
    contact: String,
    owner: String,
    description: String,
    role: {
      type: String,
      default: 'shop',
    },
    media: [
      {
        type: { type: String },
        url: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    creatorRole: String,
  },
  { timestamps: true }
);

export default mongoose.model('Shop', shopSchema);



