const cloudinary = require("cloudinary").v2;

cloudinary.config({
  // cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  // api_key: process.env.CLOUDINARY_API_KEY,
  // api_secret: process.env.CLOUDINARY_API_SECRET,

  cloud_name: "dlkhiwq7c",
  api_key: "367466678438138",
  api_secret: "4s2MbHTLBi3rKjprvYy2IxJHIaU",
 
});

module.exports = cloudinary;