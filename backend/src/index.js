// require('dotenv').config({ path: './.env' });
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
}); // it is here because we are using uploadOnCloudinary in user.controller.js and it is imported before index.js, so we need to configure cloudinary before that.

import connectDB from './db/db.js';
import { app } from './app.js';

import { startAIWorker } from "./workers/aiWorker.js";

connectDB()
  .then(() => {
  startAIWorker();
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
  });
})
.catch((error) => {
  console.error('1.Error connecting to MongoDB:',error);
  process.exit(1);
});







// import mongoose, { connect } from 'mongoose';
// import { DB_NAME } from './constants';

// function connectDB() { }
// connectDB();
/*
(async () => {
  try { 
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
  }
  catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
})();
*/
