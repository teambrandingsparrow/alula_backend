// routes/userRoutes.js
const express = require('express');
const {
  registerUser,
  login,verifyToken,getUsers,getUserById,updateUser,deleteUser
} = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.post('/register',registerUser);
router.post('/login', login);
router.get("/verify-token", verifyToken);
router.get("/users", getUsers);
router.get("/user/:id",authMiddleware(['admin']), getUserById);
router.patch('/updateuser/:id',authMiddleware(['admin']),updateUser);
router.delete('/delete/:id', authMiddleware(['admin']), deleteUser);

module.exports = router;