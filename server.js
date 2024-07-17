const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Appointment = require('./models/appointment');

const app = express();

mongoose.connect('mongodb://localhost:27017/appointments', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

function generateTimeSlots(dayOffset = 0) {
  const slots = [];
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + dayOffset);
  const startHour = 8;
  const endHour = 20;
  const interval = 15; // minutes
  const now = new Date();

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minutes = 0; minutes < 60; minutes += interval) {
      const slot = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hour, minutes);
      if (slot > now) { // only add future slots
        slots.push(slot);
      }
    }
  }

  return slots;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'royinagar2@gmail.com',
    pass: 'pryk uqde apyp kuwl'
}
});

app.get('/', (req, res) => {
  const dayOffset = parseInt(req.query.day || 0);
  const timeSlots = generateTimeSlots(dayOffset);
  const selectedDate = new Date();
  selectedDate.setDate(selectedDate.getDate() + dayOffset);
  selectedDate.setHours(0, 0, 0, 0);

  Appointment.find({ date: { $gte: selectedDate, $lt: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000) } }, (err, appointments) => {
    if (err) {
      console.log(err);
    } else {
      // Filter out the time slots that have already been booked
      const bookedSlots = appointments.map(appointment => appointment.date.getTime());
      const availableSlots = timeSlots.filter(slot => !bookedSlots.includes(slot.getTime()));
      res.render('index', { timeSlots: availableSlots, dayOffset: dayOffset });
    }
  });
});

app.get('/confirm', (req, res) => {
  const time = req.query.time;
  res.render('confirm', { time: time });
});

app.post('/book', (req, res) => {
  const newAppointment = new Appointment({
    name: req.body.name,
    date: new Date(req.body.time),
    email: req.body.email
  });

  newAppointment.save((err) => {
    if (err) {
      console.log(err);
    } else {
      const mailOptions = {
        from: 'royinagar2@gmail.com',
        to: req.body.email,
        subject: 'Appointment Confirmation',
        text: `Your appointment is confirmed for ${new Date(req.body.time).toLocaleString('he-IL', { dateStyle: 'full', timeStyle: 'short' })}`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      res.redirect('/');
    }
  });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
