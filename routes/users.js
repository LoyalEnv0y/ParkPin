// Express
const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

// Passport
const passport = require('passport')

// Middleware
const { validateUser } = require('../middleware');

// Controllers
const users = require('../controllers/users');

router.route('/login')
	.get(users.renderLogin)
	.post(
		passport.authenticate('local', {
			failureFlash: true,
			failureRedirect: '/login'
		}),
		users.login
	);

router.route('/register')
	.get(users.renderRegister)
	.post(
		validateUser,
		catchAsync(users.register)
	);

router.route('/logout')
	.get(users.logout);

module.exports = router;