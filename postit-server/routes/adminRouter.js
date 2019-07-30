const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.send('Admin router, you can only acces this if you are an admin')
});

module.exports = router;