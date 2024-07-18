const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({//לתקן ולעבור על הדברים
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: false
  },
  time: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
