const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv'); //dotenv is required needed to connect with the data base
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

dotenv.config({ path: './cofig.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
      : true,
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
    
  })
  .then(() => {
    console.log('NOW YOU CAN SEND DATA TO THE DATABASE');
  });

// read json file 
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
);

// IMPORT DATA IN DB
const importData = async () => {
  try {
    await Tour.create(tours, { validateBeforeSave: false });
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews, { validateBeforeSave: false });
    console.log('DATA SUCESSFULLY LOADED');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE DATA IN DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    console.log('DATA SUCESSFULLY DELETED');
  } catch (err) {
    console.log("error.message");
    console.log(err.message);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// module.exports = tours;