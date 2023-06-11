const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const docs = await Model.findByIdAndDelete(req.params.id);

    if (!docs) {
      return next(new AppError('no tour found with that id', 404));
    }

    res.status(204).json({
      status: 'deleted',
      message: 'data sucessfully deleted',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const docs = await Model.findOneAndUpdate(req.params.id, req.body, {
      new: true, // yasle modified variable dekhauxa rather then the original one
      runValidators: true, // runValidators le chai update garxa code lai
    });

    res.status(200).json({
      status: 'sucess',
      data: {
        docs,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const docs = await Model.create(req.body);
    /* NOTE: Tour.create(paramaters) returns a promise so we used await */
    res.status(201).json({
      status: 'sucess',
      data: {
        tours: docs,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const docs = await query;

    if (!docs) {
      return next(new AppError('no tour found with that id', 404));
    }

    res
      .status(200)
      .json({
        status: 'success',

        data: {
          data: doc,
        },
      });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // it allows nested get reviews on tour
    let filter = {};
    if (req.params.tourId) filter = {
      tour: req.params.tourId
    }; //this allow the user to get all the review that has been commented on a tour

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // execute query
    // const docs = await features.query.explain();
    const docs = await features.query;
    // console.log('query output', query);

    res.status(200).json({
      status: 'success',
      result: docs.length,
      data: {
        data: docs,
      },
    });
  });