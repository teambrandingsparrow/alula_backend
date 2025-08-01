const express = require('express');
const multer = require('multer');
const {
  createScreen,
  getScreensList,getScreens,
  getScreenById,
  updateScreen,getMyScreens,deleteMyScreen,
  getScreenStats ,getMyScreenStats,createScreenByUser,
} = require('../controllers/screenController');
const { authMiddleware } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

const router = express.Router();

// Multer config: save uploads to "uploads/" directory
// const upload = multer({ dest: 'uploads/'});

router.post(
  '/createscreen',
  authMiddleware(['admin','vendor','shop']),
  upload.array('media', 5),
  createScreen
);

router.get('/getscreens', authMiddleware(['admin','vendor','shop']), getScreens);
router.patch(
  '/updatescreen/:id',
  authMiddleware(['admin','vendor','shop']),
  upload.array('newMedia', 10),
  updateScreen
);
router.get('/screen/:id', getScreenById);
router.delete('/delete/:id', authMiddleware(['admin','vendor','shop']), deleteMyScreen);
router.get('/getmyscreens', authMiddleware(['admin','vendor','shop']), getMyScreens);
router.get('/screenstats', authMiddleware(['admin','vendor','shop']), getScreenStats);
router.get('/myscreenstats', authMiddleware(['admin','vendor','shop']), getMyScreenStats);

module.exports = router;
