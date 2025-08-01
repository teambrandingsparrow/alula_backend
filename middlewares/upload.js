const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");
const path = require("path");

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalName = path.parse(file.originalname).name.replace(/\s/g, "_");

    return {
      folder: "alula/media_uploads",
      resource_type: "auto", // handles both images and videos
      public_id: `${originalName}-${uniqueSuffix}`,
    };
  },
});

// const upload = multer({ storage });
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/mpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images and videos (mp4/mpeg) are allowed"));
    }
  },
});

module.exports = { upload };
