const express = require('express');
const MedicineLog = require('../models/MedicineLog');
const Medicine = require('../models/Medicine');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/date/:date', auth, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const logs = await MedicineLog.find({
      userId: req.user._id,
      date: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    }).populate('medicineId');

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/take', auth, async (req, res) => {
  try {
    const { logId, doseIndex } = req.body;

    const log = await MedicineLog.findOne({
      _id: logId,
      userId: req.user._id,
    });

    if (!log) {
      return res.status(404).json({ message: 'Medicine log not found' });
    }

    log.doseTimes[doseIndex].taken = !log.doseTimes[doseIndex].taken;
    log.doseTimes[doseIndex].takenAt = log.doseTimes[doseIndex].taken ? new Date() : null;

    await log.save();
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;