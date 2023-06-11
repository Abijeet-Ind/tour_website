const Tour = require('./../models/tourModel');
const Review = require('./../models/reviewModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getById = factory.getOne(Tour, { path: 'reviews' });
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.postTour = factory.createOne(Tour);


exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(new AppError('please provide longitude and latitude', 400));
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'sucess',
    result: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  console.log(latlng);

  const multiplier  = unit  === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(new AppError('please provide longitude and latitude', 400));
  }

  const distances = await Tour.aggregate([
    {
      // note: for geoSphere aggregation there is only one stage
      //geonear actually require at least one geoSphere index
      // geoNear structly check one of the index that require one NeoSphere data
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
        spherical: true,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'sucess',
    data: {
      data: distances,
    },
  });
});


exports.getTourStat = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { rating: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: null,
        num: { $sum: 1 },
        numRatings: { $avg: '$rating' },
        maxprice: { $max: '$price' },
        minpirce: { $min: '$price' },
        avgPrice: { $avg: '$price' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',   // unwind le data ko bhitra bhitra ek ek ota data ma gayera check garxa
    },

    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-1-1`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    {
      $group: {
        _id: { $month: 'startDates' }, //name of the field that we will extract date from
        numTours: { $add: 1 }, //it will add one when some data will passes through
        tours: { $push: '$name' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    length: plan.length,
    data: {
      plan,
    },
  });
});
