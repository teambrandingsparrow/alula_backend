// routes/dealRoutes.js
const express = require('express');
const  {
  addDeal,
  updateDeal,
  getDealById,
  deleteDeal,
  getDeals
} = require('../controllers/comboController');

const { authMiddleware } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

const router = express.Router();

router.post('/adddeal',authMiddleware(['admin']),upload.array('media', 5),addDeal);
router.patch('/updatedeal/:id',authMiddleware(['admin']),upload.array('newMedia', 5), updateDeal);
router.get("/listcombodeals", getDeals);
router.get("/deal/:id", getDealById);
router.delete("/delete/:id",authMiddleware(['admin']), deleteDeal);

module.exports = router;
