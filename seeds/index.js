const path = require('path');

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

const CitiesAndProvinces = require('./CitiesAndProvinces');
const axios = require('axios');

// Mongoose
const mongoose = require('mongoose');
const Floor = require('../models/floor');
const Slot = require('../models/slot');
const HourPricePair = require('../models/hourPricePair');
const User = require('../models/user');
const ParkingLot = require('../models/parkingLot');
const Review = require('../models/review');

mongoose.set('strictQuery', true);
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/ParkPin',)
        .then(() => console.log('Mongodb connection successful'));
}
main().catch(() => console.log('Mongodb connection failed'));

// Cloudinary
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Returns a random value from a given object or array
const getSampleFromData = data => (data[getRandNum(data.length)]);

// Returns a random number between the floor (inclusive) and ceil (exclusive)
const getRandNum = (ceil, floor = 0) => {
    return Math.floor(Math.random() * (ceil - floor)) + floor
};

// Test user will be the owner for all the autogenerated parkin lots
let testUser = null;
// Deletes all the old users and creates a new user then assigns it to testUser
const resetUsers = async () => {
    // Clear old user photos
    await clearUserPhotosFromCloudinary();
    // Clear old users
    await User.deleteMany();

    // Create a new user with the password of 'aa'
    const newUser = new User({
        username: 'Tester',
        email: 'test@gmail.com',
        birthDate: '01-01-2000',
        phoneNumber: '05555555555',
        citizenID: '55555555555',
        salt: '9d7568d2cfc88b84fa34ae8a2c0db3daaea6702db605ff752f2e2fb21a6f9d12',
        hash: '530092f22e293de49d4a2d412458e589957b4ede9d04fbd239b0fd8bf3d66e6b60952677303d0786acb7037081170302b4a00626df9e50c4542f2e943acff4ab9d850e59dc4443557e0510a18ada5c6480317c392de6b39f6aab07bab4d257ccdb3cd233c8e63c0b30b2ce1e32199b2f2a20de07d1faef67164becd389ea00149d8d236e4835cc93c435c16b117e7db43efaab7c152458bac7c2ec2426a09c83d75b105c66ad3288f758f925e64a1a7f227637a3e50bd25cbd9f7cd7685891b71c60ea719ce9279e2ff18de25e9f17bd5557c251c7b3012d0360261da926d4f40b5ae41e53bb3b7ac6b24b8c22bfef6c84c6abea64e8dd8e712591c1b704d6b7c7438bc135b67e54b863511358b21ef7e65792b91c4d0756538f226f78cb1c3b540d31d0d74fbc6e9107e9964dab0d6cda6485ea2f282e38565b75894d668d270f04d5307b56e10837ac5cf0915753321de452fa33db815948da308b800cfbad62d1e340a937bc7bb5b29e76f574dd5acaa0c33175f61af3da026257b0ba66f1e3b813188b603c9571337c389445e71bf23bd1628e5e2a82d9360faf757e0d28b52044f1f40d6a7ddc6e72aa708034862b68218b2464b1c2a76386ca3b29cec19eaa050d7bee1221e36b1ee413e5b96977502c9e81a42fe14613c8f768e86c7b61b24109a7d9e96a14aadb810da6776dbc64c1b243cd7036e339b7fd29a0537e'
    });

    testUser = await newUser.save();
};

// Gets random landscape oriented images from a collection on Unsplash
const seedImgs = async () => {
    const randImgCount = Math.floor(Math.random() * 2) + 1;
    const imgPromises = [];

    try {
        for (let i = 0; i < randImgCount; i++) {
            const resp = await axios.get('https://api.unsplash.com/photos/random', {
                params: {
                    client_id: process.env.UNSPLASH_ACCESS_KEY,
                    collections: 'YrD1o4l6cWs',
                    orientation: 'landscape'
                },
            });

            const uploadedImage = uploadImage(resp.data.urls.regular);
            imgPromises.push(uploadedImage)
        }
    } catch (err) {
        console.error(err);
        return err;
    }

    let resolvedImages = await Promise.all(imgPromises);

    resolvedImages = resolvedImages
        .map(i => ({ url: i.url, filename: i.public_id }));

    return resolvedImages
}

// Upload images to cloudinary
const uploadImage = async imagePath => {
    try {
        const result = await cloudinary.uploader.upload(imagePath, { folder: 'ParkPin/ParkingLots' });
        return result;
    } catch (err) {
        console.log("Error at upload Image => ", err);
    }
}

// Delete images from cloundinary
const clearLotPhotosFromCloudinary = async () => {
    const oldParkingLots = await ParkingLot.find();
    const clearedLotPhotos = []

    if (oldParkingLots.length < 1) return;

    for (let parkingLot of oldParkingLots) {
        parkingLot.images.forEach(image => {
            clearedLotPhotos.push(cloudinary.uploader.destroy(image.filename));
        });
    }

    return Promise.all(clearedLotPhotos);
}

// Delete images from cloundinary
const clearUserPhotosFromCloudinary = async () => {
    const oldUsers = await User.find();
    const clearedUserPhotos = []

    if (oldUsers.length < 1) return;

    for (let user of oldUsers) {
        if (!user.image) continue;

        clearedUserPhotos.push(cloudinary.uploader.destroy(user.image.filename));
    }

    return Promise.all(clearedUserPhotos);
}

// Creates randomly picked hour - price pairs.
const createRandomPrices = () => {
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

        generatedPairs.push(pair)
        randStartingPrice += randPriceStep;
        currentTime += endTime;
        pair.save();
    }

    return generatedPairs;
}

const createRandomFloors = async (floorCount, parkingLot) => {
    const createdFloors = [];

    for (let i = 0; i < floorCount; i++) {
        const newFloor = new Floor({
            slots: await createRandomSlots(getRandNum(100, 10), i + 1, parkingLot),
            floorNum: i + 1
        })

        newFloor.save()
            .then(floor => createdFloors.push(floor))
            .catch(err => console.log(`Error while saving a new floor ${err}`))
    }

    return await Promise.all(createdFloors);
}

const createRandomSlots = async (slotCount, floorNum, parkingLot) => {
    const createdSlots = [];

    for (let i = 0; i < slotCount; i++) {
        const newSlot = new Slot({
            isFull: getRandNum(2, 0) ? true : false,
            floorNum: floorNum,
            locatedAt: parkingLot
        });

        newSlot.save()
            .then(slot => createdSlots.push(slot))
            .catch(err => console.log(`Error while saving a new slot ${err}`))
    }

    return await Promise.all(createdSlots);
}

/* Deletes old parking lots, creates new parking lots with random properties and
Assigns all those newly created parking lots to testUser. */
const resetParkingLots = async () => {
    // Clear old lots
    await clearLotPhotosFromCloudinary();
    await ParkingLot.deleteMany();
    await Floor.deleteMany();
    await Slot.deleteMany();
    await HourPricePair.deleteMany();
    await Review.deleteMany();

    // Create new lots 
    for (let i = 0; i < 2; i++) {
        // Get new lot's data
        const randCity = getSampleFromData(Object.keys(CitiesAndProvinces));
        const randProvince = getSampleFromData(CitiesAndProvinces[randCity]);

        // Create a new lot
        const newLot = new ParkingLot({
            name: `${randCity} - ${randProvince} Parking Lot`,
            owner: testUser,
            location: `${randCity} - ${randProvince}`,
            available: Math.random() > 0.07,
            priceTable: createRandomPrices(),
            images: await seedImgs()
        })

        // Assign the lot to testUser but saves the user only after the slot has been saved
        testUser.parkingLots.push(newLot._id);

        // Create random number of floors and assign them to the new parking lot
        newLot.floors = await createRandomFloors(getRandNum(5, 1), newLot);

        // Save the lot
        await newLot.save()
            .then(async () => {
                console.log(`The lot #${i + 1} has been saved`);
                return await testUser.save();
            })
            .then(() => console.log(`The lot #${i + 1} has been associated with owner`))
            .catch(err => console.log(`Error: The lot #${i + 1} couldn't be saved`, err));
    }

}

const seedDB = async () => {
    await resetUsers()
        .then(() => console.log('Reset all users'))
        .catch(err => console.log('Error while resetting users', err))
    await resetParkingLots()
        .then(() => console.log('Reset all parking lots'))
        .catch(err => console.log('Error while resetting parking lots', err));
}

seedDB()
    .then(() => {
        console.log('Closing mongo connection');
        mongoose.connection.close()
    })