const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  // 1. get tour data form collection.
  const tours = await Tour.find();

  // 2. build tempelate.

  // 3. render the tempelate using tour data 1.
  res.status(200).render('overview.pug', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res) => {
  console.log(req.params.slug)
  // 1. get data from the requested tour
  const tour = await Tour.findOne({
    slug: req.params.slug
  }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  // 2. build tempelates
  // 3. render the tempelate

  console.log(tour.reviews)
  res
    .status(200)
    .render('tour.pug', {
      title: req.params.slug.replaceAll('-', ' '),
      tour,
    });
});

exports.getLoginForm = (req, res) => {

  res.status(200).render('login.pug', {
    title: 'login into your account',
  });
};