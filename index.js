if (process.env.NODE_ENV !== "production") {
	require('dotenv').config();
}

// Express
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const sessionConfig = {
	secret: process.env.SECRET_SESSION_KEY,
	resave: false,
	saveUninitialized: true,

	cookie: {
		httpOnly: true,
		// make sure it expires after a week
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7
	}
}

app.use(session(sessionConfig));
app.use(flash());

// EJS and Views
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Models
const CitiesAndProvinces = require('./seeds/CitiesAndProvinces.json');
const CarBrandsAndModels = require('./seeds/CarBrandsAndModels.json');

// Mongoose
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
async function main() {
	await mongoose.connect('mongodb://127.0.0.1:27017/ParkPin',)
		.then(() => console.log('Mongodb connection successful'));
}
main().catch(() => console.log('Mongodb connection failed'));

//Models
const User = require('./models/user');

//Passport
const passport = require('passport');
const LocalStrategy = require('passport-local');

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware
app.use((req, res, next) => {
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	res.locals.currentUser = req.user;
	next();
});

// Routes
app.get('/', (req, res) => {
	res.render('home', { title: 'ParkPin | Home' });
});

const parkingLotRoutes = require('./routes/parkingLots');
const reviewsRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const carRoutes = require('./routes/cars');

app.use('/parkingLots', parkingLotRoutes);
app.use('/parkingLots/:id/reviews', reviewsRoutes);
app.use('/cars', carRoutes);
app.use('/', userRoutes);

// *********************************
// JSON Start
// *********************************
app.get('/citiesAndProvinces', (req, res) => {
	res.json(CitiesAndProvinces);
});

app.get('/carBrandsAndModels', (req, res) => {
	res.json(CarBrandsAndModels);
});

// Errors
const AppError = require('./utils/AppError');

app.all('*', (req, res, next) => {
	next(new AppError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
	if (!err.status) err.status = 500;
	if (!err.message) err.message = "Oh no! something went wrong";

	res.status(err.status).render('error', { title: 'ParkPin | Error', err });
});

app.listen(port, () => console.log(`Listening on port ${port}`));