const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport')
const AppError = require('../utils/AppError');

const { userSchema: userJOI } = require('../utils/JoiSchemas');

const validateUser = (req, res, next) => {
	const { error } = userJOI.validate(req.body);
	if (error) {
		const msg = error.details.map(el => el.message).join(',');
		throw new AppError(msg, 400);
	} else {
		next();
	}
}

router.get('/login', (req, res) => {
	res.render('users/login', { title: 'ParkPin | Login' });
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
	req.flash('success', 'Welcome back!');
	res.redirect('/parkingLots');
});

router.get('/register', (req, res) => {
	res.render('users/register', { title: 'ParkPin | Register' });
});

router.post('/register', validateUser, catchAsync(async (req, res) => {
	try {
		const user = req.body.user

		const newUser = User({
			username, email, birthDate, profilePicLink,
			phoneNumber, citizenID
		} = user);

		await User.register(newUser, user.password);

		req.flash('success', 'Welcome to ParkPin!')
		res.redirect('/login');

	} catch (err) {
		req.flash('error', err.message)
		res.redirect('/register');
	}
}));

router.get('/logout', (req, res) => {

});

module.exports = router;