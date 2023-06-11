const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');

const filterObj = (obj, ...allowerdField) => {
  // object contain everything that is written in JSON file
  // allowedFields contain only the targated object
  // allowerdField [ 'name', 'email' ]
  // obj [ 'name', 'role' ]

  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowerdField.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/img/user')
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
  }
})

const multerFilter = (req, file, cb) => {
  if(req.file.memetype.startsWith('image')){
    cb(null, true);
  }else{
    cb(new AppError('PLEASE ENTER IMAGE', 400), false);
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})

exports.insertPhoto = upload.single('photo');

exports.deleteMe = catchAsync(async (req, res, next) => {
  // when the id will be match then active will be false
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'sucess',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
}

exports.updateMe = async (req, res, next) => {
  // 1) create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('this route is not for password, use another route', 400)
    );
  }

  // 2) filterout the unwanted inputs form the database
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) update user docuement
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidator: true,
  });

  res.status(200).json({
    status: 'sucess',
    user: {
      updateUser,
    },
  });
};


exports.getUser = factory.getOne(User);
exports.getAllUser = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
