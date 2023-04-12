if (process.env.NODE_ENV !== "production") {
	require('dotenv').config();
}

// Express
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Models
const CitiesAndProvinces = require('./seeds/CitiesAndProvinces');

// Mongoose
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
async function main() {
	await mongoose.connect('mongodb://127.0.0.1:27017/ParkPin',)
		.then(() => console.log('Mongodb connection successful'));
}
main().catch(() => console.log('Mongodb connection failed'));

const parkingLotRoutes = require('./routes/parkingLots');
const reviewsRoutes = require('./routes/reviews');

// Routes
app.get('/', (req, res) => {
	res.render('home', { title: 'ParkPin | Home' });
});

app.use('/parkingLots', parkingLotRoutes);
app.use('/parkingLots/:id/reviews', reviewsRoutes);


// *********************************
// JSON Start
// *********************************
app.get('/citiesAndProvinces', (req, res) => {
	res.json(CitiesAndProvinces);
});

app.listen(port, () => console.log(`Listening on port ${port}`));