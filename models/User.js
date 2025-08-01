// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fname:{
        type:String,
        required: true
    },
    lname:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true,
        unique: true 
    },
    contact:{
        type:Number,
        required: true,
        unique: true 
    },
    address:{
        type:String,
        required: true,
    },
    pincode:{
        type:String,
        required: true
    },
    password:{
        type:String,
        required: true
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);