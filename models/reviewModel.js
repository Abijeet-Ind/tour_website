const mongoose = require('mongoose');
const Tour = require('./tourModel');

// review, rating, createdAt, ref to Tour, ref to user
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'an id must belong to tour'],
      },
    ],
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'an id must belong to user'],
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {


  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// stop multicommenting on a tour
reviewSchema.index({tour: 1, user: 1}, {unique: true});

// this was created to for calculating average rating of tour 
// reviewSchema.statics.calcAverageRatings = async function (tourId) {
//   const stats = await this.aggregate([
//     {
//       $match: { tour: tourId },
//     },
//     {
//       $group: {
//         _id: '$tour',
//         nRating: { $sum: 1 },
//         avgRating: { $avg: '$rating' },
//       },
//     },
//   ]);
//   console.log(stats)

//   await Tour.findByIdAndUpdate(tourId, {
//     ratingsQuantity: stats[0].nRating,
//     ratingsAverage: stats[0].avgRating
//   })
// };

// this was used to post the data
// reviewSchema.post('save', function () {
//   // this point to current review
//   this.constructor.calcAverageRatings(this.tour);
// });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
