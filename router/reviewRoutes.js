const reviewController = require('./../controller/reviewController');
const authController = require('./../controller/authController');
const express = require('express');
const app = express();
const router = express.Router({ mergeParams: true});
// we need mergeParams because by default each routr has access to each parameters of specific router 
router
  .route('/')
  .get(reviewController.getAllReview)
  .post(
    authController.protect,
    authController.notrestrictTo('user'),
    reviewController.userTourid,
    reviewController.createNewReview
  );


app.use(authController.protect);

router
  .route('/:tourId/reviews')

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);


module.exports = router;
