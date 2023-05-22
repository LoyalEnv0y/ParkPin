// Express
const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

// Passport
const passport = require('passport')

// Middleware
const { validate, isLoggedIn } = require('../middleware');

// Controllers
const users = require('../controllers/users');

// Multer
const multer = require('multer')
const { storage } = require('../cloudinary/usersStorage');
const upload = multer({ storage });

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
		upload.single('image'),
		validate('User'),
		catchAsync(users.register)
	);

router.route('/me')
	.get(
		isLoggedIn,
		users.renderMe
	);

router.route('/logout')
	.get(users.logout);

module.exports = router;