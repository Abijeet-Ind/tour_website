const mongoose = require('mongoose');
const slugify = require('slugify');
const Review = require('./reviewModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      unique: true,
      maxlength: [40, 'name must be less then 40 character'],
      minlength: [10, 'name must be greater then 10 character'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'duration is required'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'max group size is required'],
    },
    difficulty: {
      type: String,
      required: [true, 'difficulty level is required'],
      enum: {
        // it's the passed value is equal
        values: ['easy', 'medium', 'large'],
        message: 'difficulty should be between easy, medium and large',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be greater then 1.0'],
      max: [5, 'rating must be less then 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'price is required'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'discounted amount is too high then the original price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'an summary of destination is requied'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'an Tour must have an cover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //IT WILL DISABLE VIEWING FROM THE MONGOOSE
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });


tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.pre(/^find/, function (next) {
  // dont ever make an mistake of trying to retrive data from pre function because it's not gonna work
  this.populate({
    path: 'guides',
    select: '-__v ',
  });

  next();
});

// Document middle ware runds before .save and .create
// we can create 2 middleware for same object
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function(next) {
//   const PromiseGuide = this.guides.map(async Id => await User.findById(Id));
//   this.guides = await Promise.all(PromiseGuide);
//   next();
// })

// way of finding an object in BD
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(
    `tour took ${Date.now() - this.start} millisecond to load the data`
  );
  next();
});

// aggregation middleware
// pre is for before the command
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); //we use shift to add the data at ending of array and unshift the data at begining of an array
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
