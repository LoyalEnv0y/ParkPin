const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
	res.render('users/login', { title: 'ParkPin | Login' });
});

router.post('/login', async (req, res) => {

});

router.get('/signin', (req, res) => {

});

router.get('/logout', (req, res) => {

});

module.exports = router;