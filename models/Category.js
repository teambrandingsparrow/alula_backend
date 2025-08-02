// models/Category.js
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  
  name: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  media: [
      {
        type: { type: String },
        url: String,
      },
    ], 
});

export default mongoose.model('Category', categorySchema);

