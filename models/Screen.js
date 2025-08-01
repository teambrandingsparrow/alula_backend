import mongoose from 'mongoose';

const screenSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    contact: String,
    description: String,
    media: [
      {
        type: { type: String },
        url: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
    },
    creatorRole: String,
  },
  { timestamps: true }
);

export default mongoose.model('Screen', screenSchema);