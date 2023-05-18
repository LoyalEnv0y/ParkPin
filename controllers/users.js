const User = require('../models/user');

module.exports.renderLogin = (req, res) => {
	res.render('users/login', { title: 'ParkPin | Login' });
}

module.exports.login = (req, res) => {
	req.flash('success', 'Welcome back!');
	res.redirect('/parkingLots');
}

module.exports.renderRegister = (req, res) => {
	res.render('users/register', { title: 'ParkPin | Register' });
}

module.exports.register = async (req, res) => {
	try {
		const user = req.body.user

		const newUser = User({
			username, email, birthDate, profilePicLink,
			phoneNumber, citizenID
		} = user);

		const registeredUser = await User.register(newUser, user.password);
		req.login(registeredUser, (err) => {
			if (err) {
				return next(err)
			}

			req.flash('success', 'Welcome to ParkPin!')
			res.redirect('/');
		})

	} catch (err) {
		req.flash('error', err.message)
		res.redirect('/register');
	}
}

module.exports.logout = (req, res) => {
	req.logout((err) => {
		if (err) {
			return next(err);
		}
	});
	req.flash('success', 'Goodbye!');
	res.redirect('/');
}