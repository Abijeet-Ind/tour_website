const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

// it create cookies and send the respond
const createSendToken = (user, statusCode, res) => {

  const token = signinToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };


  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  console.log(res.cookie)

  res.status(statusCode).json({
    status: 'sucess',
    token,
    data: {
      user, // it inicates  "user: user",
    },
  });
};
const signinToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    // { id } it means { id:id }
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. checking if the email and password exist
  if (!email || !password) {
    return next(new AppError('please provide email and password', 400));
  }

  // 2. check the user exist and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('incorrect email or password', 401));
  }

  // 3. if everything is ok, then send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // 1) getting token and checking if its there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('you are not logged in please logg in ', 401));
  }

  // 2) verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) check if user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belongs to this token is no longer exist', 401)
    );
  }

  // 4) check if the user changed the password after the token was issued
  if (currentUser.passwordChangedAfter(decoded.iat)) {
    // console.log(currentUser.passwordChangedAfter(decoded.iat));
    return next(new AppError('user recently changed password! please login'));
  }

  // Grant access to protected route
  req.user = currentUser;

  next();
});

// only for render pages, no errors!
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  // matching token with cookie token
  if (req.cookies.jwt) {
    // 1) verification token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    // 2) check if user still exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      // return next();
      return next(new AppError('you are not logged in', 401));
    }

    // 3) check if the user changed the password after the token was issued
    if (currentUser.passwordChangedAfter(decoded.iat)) {
      // return next();
      return next(new AppError('your recently chagned password, relogin please', 401));
    }

    // Grant access to protected route
    res.locals.user = currentUser;
    // if we write --"req.locals."-- and define another variable like user --"req.locals.user"--
    // what ever we pass it will be a variable inside pug (all pug tempelate) like global varible
    // its simply like passing data by using render function
    return next();
  }
  next();
});

exports.notrestrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("you don't have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on postemail
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('The UserEmail not found', 401));
  }

  // 2) generate a random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // deactivate all the validator defined in our schema
  // if we did't deactivate the validateor then we get an error like  confirm your password

  // 3) send it to user email
  const resetURL = `${req.protocol}://${req.get(  
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `forget your password? submit  your patch request with new password and password confirm to: ${resetURL} if you did\'t forget your password then ignore this all `;

  await sendEmail({
    email: user.email,
    subject: 'your password reset token valid for 10 min',
    message,
  });

  res.status(200).json({
    status: 'sucess',
    message: 'token send to email',
    token: user.passwordResetToken,
  });
  // } catch (err) {
  //   user.passwordResetToken = undefined;
  //   user.passowordRestExpires = undefined;

  //   await user.save({ validateBeforeSave: false });

  //   return next(
  //     new AppError('there was an error sending an email, try again later!', 500)
  //   );
  // }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on token
  // a. encrypt the token and compare the token with the encrypted one in the db
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashToken, // find the matchable hash token
    passwordResetExpires: { $gt: Date.now() }, //compare the date
  });

  // 2) if token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('token is invalid or token  has expired', 400));
  } else {
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
  }

  // 3) update passwordChangedAt property for the user
  // user.passwordChangeAt = Date.now();

  // 4) log the user in JWT
  // console.log(res)
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get user from  collections
  const user = await user.findById(req.user.id).select('+password');

  // 2) check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('you current password is wrong', 401));
  }

  // 3) if so, updatePassword
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

/*
    in the decoded variable we can find
            id of the stored database item
            date of JWT created 
            date of JWT expire
*/
