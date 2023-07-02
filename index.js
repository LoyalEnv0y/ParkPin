if (process.env.NODE_ENV !== "production") {
	require('dotenv').config();
}

// Express
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const port = process.env.PORT || 3000;
const DbString = process.env.DB_URL || 'mongodb://127.0.0.1:27017/ParkPin';

// Mongo Injection Protection
const mongoSanitize = require('express-mongo-sanitize');
app.use(
	mongoSanitize({
		replaceWith: '_',
	}),
);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Session and Flash
const session = require('express-session');

const MongoStore = require('connect-mongo');
const store = MongoStore.create({
	mongoUrl: DbString,
	touchAfter: 24 * 60 * 60,
	crypto: {
		secret: 'thisshouldbeabettersecret!'
	}
});

store.on('error', err => {
	console.log('Session store error => ', err);
})

const sessionConfig = {
	name: 'session',
	store,
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

const helmet = require('helmet');
app.use(session(sessionConfig));
app.use(flash());
app.use(
	helmet({
		contentSecurityPolicy: false,
	})
);

// EJS and Views
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Mongoose
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
async function main() {
	await mongoose.connect(DbString)
		.then(() => console.log('Mongodb connection successful'));
}
main().catch((err) => console.log('Mongodb connection failed', err));

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
const dataRoutes = require('./routes/data');
const reservationRoutes = require('./routes/reservations');

app.use('/parkingLots', parkingLotRoutes);
app.use('/parkingLots/:id/reviews', reviewsRoutes);
app.use('/cars', carRoutes);
app.use('/', userRoutes);
app.use('/data', dataRoutes);
app.use('/parkingLots/:id/reservation', reservationRoutes);

// Errors
const AppError = require('./utils/appError');

app.all('*', (req, res, next) => {
	next(new AppError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
	if (!err.status) err.status = 500;
	if (!err.message) err.message = "Oh no! something went wrong";

	res.status(err.status).render('error', { title: 'ParkPin | Error', err });
});

app.listen(port, () => console.log(`Listening on port ${port}`));