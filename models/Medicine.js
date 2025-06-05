const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    required: true,
    enum: ['tablet', 'capsule', 'syrup', 'injection', 'drops', 'inhaler', 'cream'],
    default: 'tablet',
  },
  dosage: {
    type: String,
    required: true,
  },
  frequency: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  instructions: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Medicine', medicineSchema);