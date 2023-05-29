const path = require('path');

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

const CitiesAndProvinces = require('./CitiesAndProvinces');
const axios = require('axios');

// Models
const Floor = require('../models/floor');
const Slot = require('../models/slot');
const HourPricePair = require('../models/hourPricePair');
const User = require('../models/user');
const ParkingLot = require('../models/parkingLot');
const Review = require('../models/review');
const Car = require('../models/car');
const Stay = require('../models/stay')

// Helper Functions
const catchAsync = (fn) => {
    return (...args) => {
        return fn(...args).catch((err) => {
            handleError(err);
        });
    };
};

const handleError = err => {
    console.error("There was an Error\n", err);
}

// Returns a random value from a given object or array
const getSampleFromData = data => (data[getRandNum(data.length)]);

// Returns a random number between the floor (inclusive) and ceil (exclusive)
const getRandNum = (ceil, floor = 0) => {
    return Math.floor(Math.random() * (ceil - floor)) + floor
};

// Mongoose
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
const main = catchAsync(async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/ParkPin');
    console.log('MongoDB connection successful');

    await seedDB();
    console.log('Database seeding completed');

    mongoose.connection.close();
    console.log('MongoDB collection closed.');
});

// Cloudinary
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload images to cloudinary
const uploadImage = catchAsync(async imagePath => {
    const result = await cloudinary.uploader
        .upload(imagePath, { folder: 'ParkPin/ParkingLots' });
    return result;
});

// Gets random landscape oriented images from a collection on Unsplash
const seedImgs = catchAsync(async imgLimit => {
    const randImgCount = Math.floor(Math.random() * imgLimit) + 1;
    const imgPromises = [];

    for (let i = 0; i < randImgCount; i++) {
        const resp = await axios.get('https://api.unsplash.com/photos/random', {
            params: {
                client_id: process.env.UNSPLASH_ACCESS_KEY,
                collections: 'YrD1o4l6cWs',
                orientation: 'landscape'
            },
        });

        imgPromises.push(uploadImage(resp.data.urls.regular));
    }

    let resolvedImages = await Promise.all(imgPromises);

    resolvedImages = resolvedImages
        .map(i => ({ url: i.url, filename: i.public_id }));

    return resolvedImages
});

const defaultLotImgURL = "https://res.cloudinary.com/dlie9x7yk/image/upload/v1684585107/ParkPin/Defaults/DefaultParkingLotImage.png"

const defaultUserImgURL = "https://res.cloudinary.com/dlie9x7yk/image/upload/v1684584394/ParkPin/Defaults/DefaultUserImage.jpg"
const defaultUserImgFilename = "ParkPin/Defaults/DefaultUserImage"

// Delete images from cloundinary
const clearLotPhotosFromCloudinary = catchAsync(async () => {
    const oldParkingLots = await ParkingLot.find();
    const clearedLotPhotos = []

    if (oldParkingLots.length < 1) return;

    for (let parkingLot of oldParkingLots) {
        parkingLot.images.forEach(image => {
            if (image.url == defaultLotImgURL) return;

            clearedLotPhotos.push(cloudinary.uploader.destroy(image.filename));
        });
    }

    return Promise.all(clearedLotPhotos);
});

// Delete images from cloundinary
const clearUserPhotosFromCloudinary = catchAsync(async () => {
    const oldUsers = await User.find();
    const clearedUserPhotos = []

    if (oldUsers.length < 1) return;

    for (let user of oldUsers) {
        if (!user.image) continue;
        if (user.image.url == defaultUserImgURL) continue;

        clearedUserPhotos.push(cloudinary.uploader.destroy(user.image.filename));
    }

    return Promise.all(clearedUserPhotos);
});

// MapBox
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

// Get Geolocation data from mapbox
const getGeolocation = catchAsync(async location => {
    const geoData = await geocoder.forwardGeocode({
        query: location,
        limit: 1
    }).send();

    return geoData.body.features[0].geometry;
});

// Creates randomly picked hour - price pairs.
const createRandomPrices = catchAsync(async () => {
    let randStartingPrice = getRandNum(20, 1);
    const randPriceStep = getRandNum(20, 5);

    let currentTime = 0;

    const generatedPairs = [];

    while (currentTime < 24) {
        let endTime = currentTime + getRandNum(3, 1);

        if (currentTime >= 12) {
            currentTime = 0;
            endTime = 24;
        } else if (currentTime >= 6) {
            endTime = 12;
        }

        const pair = new HourPricePair({
            start: currentTime,
            end: endTime,
            price: randStartingPrice
        })

        generatedPairs.push(pair.save());

        randStartingPrice += randPriceStep;
        currentTime += endTime;
    }

    return await Promise.all(generatedPairs);
});

const createRandomSlots = catchAsync(async (slotCount, floorNum, parkingLot) => {
    const createdSlots = [];

    for (let i = 0; i < slotCount; i++) {
        const newSlot = new Slot({
            isFull: getRandNum(2, 0) ? true : false,
            floorNum: floorNum,
            locatedAt: parkingLot
        });

        createdSlots.push(newSlot.save());
    }

    return await Promise.all(createdSlots);
});

const createRandomFloors = catchAsync(async (floorCount, parkingLot) => {
    const createdFloors = [];

    for (let i = 0; i < floorCount; i++) {
        const newFloor = new Floor({
            slots: await createRandomSlots(getRandNum(100, 10), i + 1, parkingLot),
            floorNum: i + 1
        })

        createdFloors.push(newFloor.save());
    }

    return await Promise.all(createdFloors);
});

/* Deletes old parking lots, creates new parking lots with random properties and
Assigns all those newly created parking lots to testUser. */
const createParkingLots = catchAsync(async (lotCount, imgLimit) => {
    const newLots = [];

    // Create new lots 
    for (let i = 0; i < lotCount; i++) {
        // Get new lot's data
        const randCity = getSampleFromData(Object.keys(CitiesAndProvinces));
        const randProvince = getSampleFromData(CitiesAndProvinces[randCity]);

        // Create a new lot
        const newLot = new ParkingLot({
            name: `${randCity} - ${randProvince} Parking Lot`,
            owner: testUser,
            location: `${randCity} - ${randProvince}`,
            available: Math.random() > 0.07,
            priceTable: await createRandomPrices(),
            images: await seedImgs(imgLimit)
        })

        newLot.geometry = await getGeolocation(newLot.location);

        // Assign the lot to testUser but saves the user only after the slot has been saved
        testUser.parkingLots.push(newLot._id);

        // Create random number of floors and assign them to the new parking lot
        const floors = await createRandomFloors(getRandNum(5, 1), newLot);
        newLot.floors = floors;

        // Save the lot
        newLots.push(newLot.save());
        console.log(`Parking Lot {#${i + 1}} have been created with {${newLot.images.length}} images`);
    }

    await Promise.all(newLots);
});

// Test user will be the owner for all the autogenerated parkin lots
let testUser = null;
// Deletes all the old users and creates a new user then assigns it to testUser
const createTestUser = catchAsync(async () => {
    // Create a new user with the password of 'aa'
    const newUser = new User({
        username: 'Tester',
        email: 'test@gmail.com',
        birthDate: '01-01-2000',
        image: { url: defaultUserImgURL, filename: defaultUserImgFilename },
        phoneNumber: '05555555555',
        citizenID: '55555555555',
        salt: '9d7568d2cfc88b84fa34ae8a2c0db3daaea6702db605ff752f2e2fb21a6f9d12',
        hash: '530092f22e293de49d4a2d412458e589957b4ede9d04fbd239b0fd8bf3d66e6b60952677303d0786acb7037081170302b4a00626df9e50c4542f2e943acff4ab9d850e59dc4443557e0510a18ada5c6480317c392de6b39f6aab07bab4d257ccdb3cd233c8e63c0b30b2ce1e32199b2f2a20de07d1faef67164becd389ea00149d8d236e4835cc93c435c16b117e7db43efaab7c152458bac7c2ec2426a09c83d75b105c66ad3288f758f925e64a1a7f227637a3e50bd25cbd9f7cd7685891b71c60ea719ce9279e2ff18de25e9f17bd5557c251c7b3012d0360261da926d4f40b5ae41e53bb3b7ac6b24b8c22bfef6c84c6abea64e8dd8e712591c1b704d6b7c7438bc135b67e54b863511358b21ef7e65792b91c4d0756538f226f78cb1c3b540d31d0d74fbc6e9107e9964dab0d6cda6485ea2f282e38565b75894d668d270f04d5307b56e10837ac5cf0915753321de452fa33db815948da308b800cfbad62d1e340a937bc7bb5b29e76f574dd5acaa0c33175f61af3da026257b0ba66f1e3b813188b603c9571337c389445e71bf23bd1628e5e2a82d9360faf757e0d28b52044f1f40d6a7ddc6e72aa708034862b68218b2464b1c2a76386ca3b29cec19eaa050d7bee1221e36b1ee413e5b96977502c9e81a42fe14613c8f768e86c7b61b24109a7d9e96a14aadb810da6776dbc64c1b243cd7036e339b7fd29a0537e'
    });

    testUser = await newUser.save();
});

const resetData = catchAsync(async () => {
    // Clear old photos from cloudinary
    await clearLotPhotosFromCloudinary();
    await clearUserPhotosFromCloudinary();

    // Clear old ParkingLot data from DB
    await ParkingLot.deleteMany();
    await Floor.deleteMany();
    await Slot.deleteMany();
    await HourPricePair.deleteMany();
    await Review.deleteMany();

    // Clear old User and Car data from DB 
    await User.deleteMany();
    await Car.deleteMany();
    await Stay.deleteMany(); 
});

const massSeed = false;

const seedDB = catchAsync(async () => {
    if (massSeed) {
        testUser = await User.findOne({ username: 'Tester' });
    } else {
        await resetData();
        console.log('Old data has been cleared.');

        await createTestUser();
        console.log('All users have been reset.');
    }

    await createParkingLots(2, 2);
    console.log('All parking lots have been reset.');
});

catchAsync(main());