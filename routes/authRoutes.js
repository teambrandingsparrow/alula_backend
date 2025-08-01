// routes/authRoutes.js
const express = require('express');
const {
  register,
  login,verifyToken,
  approveVendor,
  rejectVendor,
  deleteMyVendor,
  getUsers,getUserById,updateUser,getVendors,getMyVendorsApproved,getMyVendorsNotApproved,getUserStats ,getMyVendorStats,
  logout,
} = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.post('/register',authMiddleware(['admin','vendor']),register);
router.post('/login', login);
router.get("/verify-token", verifyToken);
router.patch('/approve/:id', authMiddleware(['admin']), approveVendor);
// router.patch('/reject/:id', authMiddleware(['admin']), approveVendor);
router.delete('/delete/:id', authMiddleware(['admin','vendor']), deleteMyVendor);
router.get('/getusers', authMiddleware(['admin']), getUsers);
router.get('/user/:id', getUserById);
router.patch(
  '/updateuser/:id',
  authMiddleware(['admin','vendor']),
  updateUser
);
router.get('/getvendors', authMiddleware(['admin','vendor']), getVendors);
router.get('/getmyvendorsapproved', authMiddleware(['admin','vendor']), getMyVendorsApproved);
router.get('/getmyvendorsnotapproved', authMiddleware(['admin','vendor']), getMyVendorsNotApproved);
router.get('/userstats', authMiddleware(['admin','vendor']), getUserStats);
router.get('/myvendorstats', authMiddleware(['admin','vendor']), getMyVendorStats);

router.post('/logout', logout);

module.exports = router;
