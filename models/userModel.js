const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcrypt');

// name, email, photo, password, confirm
const LoginSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'username is require'],
  },

  email: {
    type: String,
    required: [true, 'email is require'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please enter a valid  email'],
  },

  photo: String, // this only save the path of the image

  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },

  password: {
    type: String,
    required: [true, 'password is required'],
    minlength: 8,
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// NOTE: WE ONLY NEED TO KEEP THE SENSITIVE DATA IN THE ENCRYPTED FORM SO TO COMPARE THE ENCRYPTED DATA TO ENCRYPTED ONES
LoginSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changeTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp > changeTimeStamp;
  }
  return false;
};


LoginSchema.pre('save', function (next) {
  // THIS FUNCTION WILL RUN BEFORE SAVING THE DOCUMENT, SO FUNTION (NEXT) IS A PERFECT PLACE TO WRITEIN.
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});


LoginSchema.pre('save', async function (next) {
  // ONLY RUN THIS FUNCTION IF THE PASSWORD IS ACTUALLY MODIFIED
  if (!this.isModified('password')) return next();

  // hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // HASH THE PASSWORD WITH THE COST OF 12
  this.passwordConfirm = undefined;
});

LoginSchema.pre(/^find/, function (next) {
  // it means display those element whose active is not equal to false
  this.find({ active: { $ne: false } });
  next();
})



LoginSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); //  Generate reset token

  this.passwordResetToken = crypto
    .createHash('sha256') // encrypt the reset token
    .update(resetToken) // update the reset token  in database
    .digest('hex'); // store it as hexadeciaml value

  // console.log({ resetPassword }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};



// instance method
LoginSchema.methods.correctPassword = async function ( candidatePassword, userPassword ) {
  // note: this.password will not be available because we have used select: flase
  // console.log("candidatePassword", candidatePassword);
  // console.log("userpassword", userPassword);

  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', LoginSchema);

module.exports = User;

/*
    pre-middleware run between getting the data and saving the data into the database. 
    
    instance method is certain collection of method that is gonna be available on all document of a certain collection
*/
