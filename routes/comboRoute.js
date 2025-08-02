// routes/dealRoutes.js
const express = require('express');
const  {
  addComboDeal,
  updateComboDeal,
  getComboDealById,
  deleteDeal,
  getComboDeals,
} = require('../controllers/comboController');

const { authMiddleware } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

const router = express.Router();

router.post('/addcombodeal',authMiddleware(['admin']),upload.array('media', 5),addComboDeal);
router.patch('/updatecombodeal/:id',authMiddleware(['admin']),upload.array('newMedia', 5), updateComboDeal);
router.get("/listcombodeals", getComboDeals);
router.get("/combodeal/:id", getComboDealById);
router.delete("/delete/:id",authMiddleware(['admin']), deleteDeal);


module.exports = router;
