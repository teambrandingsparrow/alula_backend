// server/routes/test.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'API connected successfully!' });
});

module.exports = router;
