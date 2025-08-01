// models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  desc: { type: String, required: true },
  price: { type: Number, required: true },
  offerprice: { type: Number, default: true },
  percentage: { type: Number, default: true },
  variant: { type: String },
  // category: { type: Array,required: true  },
  category: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
      },
      name: {
        type: String,
        required: true
      }
    },
  size: { type: String, required: true  },
  color: { type: String  },
  stock: { type: Number, required: true },
  media: [
      {
        type: { type: String },
        url: String,
      },
    ],
});

export default mongoose.model('Product', productSchema);