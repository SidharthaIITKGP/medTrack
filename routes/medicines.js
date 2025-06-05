const express = require('express');
const Medicine = require('../models/Medicine');
const MedicineLog = require('../models/MedicineLog');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const medicines = await Medicine.find({ userId: req.user._id, isActive: true });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, icon, dosage, frequency, duration, startDate, instructions } = req.body;
    
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + duration);

    const medicine = new Medicine({
      userId: req.user._id,
      name,
      icon,
      dosage,
      frequency,
      duration,
      startDate: start,
      endDate: end,
      instructions,
    });

    await medicine.save();

    // Create medicine logs for each day
    const current = new Date(start);
    while (current <= end) {
      const doseTimes = [];
      for (let i = 0; i < frequency; i++) {
        const hour = 8 + (i * Math.floor(12 / frequency));
        doseTimes.push({
          time: `${hour.toString().padStart(2, '0')}:00`,
          taken: false,
        });
      }

      await MedicineLog.create({
        userId: req.user._id,
        medicineId: medicine._id,
        date: new Date(current),
        doseTimes,
      });

      current.setDate(current.getDate() + 1);
    }

    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;