// routes/productRoutes.js
const express = require('express');
const {
  addProduct,updateProduct,
  getProductList,getProductById,deleteProduct,
} = require('../controllers/productController');

const { authMiddleware } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

const router = express.Router();

router.post('/addproduct',authMiddleware(['admin']),upload.array('media', 5),addProduct);
router.patch('/updateproduct/:id',authMiddleware(['admin']),upload.array('newMedia', 5), updateProduct);
router.get("/listproducts", getProductList);
router.get("/product/:id", getProductById);
router.delete("/delete/:id",authMiddleware(['admin']), deleteProduct);

module.exports = router;