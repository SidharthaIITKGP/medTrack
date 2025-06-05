const mongoose = require('mongoose');

const medicineLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  doseTimes: [{
    time: {
      type: String,
      required: true,
    },
    taken: {
      type: Boolean,
      default: false,
    },
    takenAt: {
      type: Date,
    },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('MedicineLog', medicineLogSchema);