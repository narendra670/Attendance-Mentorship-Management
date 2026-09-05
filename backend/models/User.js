const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'mentor', 'admin'],
      default: 'student',
    },
    profilePhoto: { type: String, default: '' },
    phone: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['online', 'offline'], default: 'offline' },
    // Student specific
    rollNumber: { type: String, default: '' },
    course: { type: String, default: '' },
    department: { type: String, default: '' },
    semester: { type: String, default: '' },
    academicPerformance: {
      cgpa: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
    },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    careerGoal: { type: String, default: '' },
    bio: { type: String, default: '' },
    // Mentor specific
    designation: { type: String, default: '' },
    specialization: { type: String, default: '' },
    experience: { type: Number, default: 0 },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model('User', userSchema);