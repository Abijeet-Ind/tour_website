const express = require('express');
const tourController = require('./../controller/tourController');
const AuthController = require('./../controller/authController');
const reviewController = require('./../controller/reviewController');
const reviewRoutes = require('./../router/reviewRoutes');
const router = express.Router();


router
  .route('/top-5-cheap-tours')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStat);

router
  .route('/monthly-plan/:year')
  .get(AuthController.notrestrictTo('user'), tourController.getMonthlyPlan);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    AuthController.protect,
    AuthController.notrestrictTo('admin', 'lead-guide'),
    tourController.postTour
  );

router
  .route('/:id')
  .get(tourController.getById)
  .patch(
    AuthController.protect,
    AuthController.notrestrictTo('admin', 'guide'),
    tourController.updateTour
  )
  .delete(
    AuthController.protect,
    AuthController.notrestrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistance);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin)

// router
//   .route('/:tourId/reviews')
//   .post(
//     AuthController.protect,
//     AuthController.restrictTo('user'),
//     reviewController.createNewReview
//   );

router.use('/:tourId/reviews', reviewRoutes);

module.exports = router;
