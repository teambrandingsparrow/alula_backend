// routes/categoryRoutes.js
const express = require('express');
const {
  addCategory,updateCategory,
  getCategoryList,getCategoryById,deleteCategory,
} = require('../controllers/categoryController');

const { authMiddleware } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

const router = express.Router();

router.post('/addcategory',authMiddleware(['admin']),upload.array('media', 5),addCategory);
router.patch('/updatecategory/:id',authMiddleware(['admin']),upload.array('newMedia', 5), updateCategory);
router.get("/listcategorys", getCategoryList);
router.get("/category/:id", getCategoryById);
router.delete("/delete/:id",authMiddleware(['admin']), deleteCategory);

module.exports = router;