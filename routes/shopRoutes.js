const express = require('express');
const multer = require('multer');
const {
  // createShop,
  registerShop, 
  loginShop,verifyToken,
  getShopsList,
  getMyShops,
  getShopById,
  updateShop,getShopStats ,getMyShopStats,deleteMyShop,
} = require('../controllers/shopController');
const { authMiddleware } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

const router = express.Router();

// Multer config: save uploads to "uploads/" directory
// const upload = multer({ dest: 'uploads/' });

router.post('/register', authMiddleware(['vendor', 'admin']),
  upload.array('media', 5), registerShop);
router.post('/login', loginShop);
router.get("/verify-token", verifyToken);

router.get('/getshops', authMiddleware(['admin', 'vendor']), getShopsList);
router.patch(
  '/updateshop/:id',
  authMiddleware(['admin', 'vendor','shop']),
  upload.array('newMedia', 10),
  updateShop
);
router.get('/shop/:id', getShopById);
router.get('/getmyshops', authMiddleware(['admin', 'vendor']), getMyShops);
router.delete('/delete/:id', authMiddleware(['admin', 'vendor']), deleteMyShop);

router.get('/shopstats', authMiddleware(['admin', 'vendor']), getShopStats);
router.get('/myshopstats', authMiddleware(['admin', 'vendor']), getMyShopStats);

module.exports = router;
