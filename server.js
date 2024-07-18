const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Appointment = require('./models/appointment');

const app = express();

const uri = "mongodb+srv://royinagar2:0ZbTAJ4T5YUkeduu@cluster0.cpfyu6i.mongodb.net/Cluster0?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

function generateTimeSlots(dayOffset = 0) {
  const slots = [];
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + dayOffset);

  // Set the date to the start of the day in Israel time
  const israelTime = new Date(currentDate.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
  israelTime.setHours(0, 0, 0, 0);

  const startHour = 8;
  const endHour = 20;
  const interval = 15; // minutes

  const now = new Date();

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minutes = 0; minutes < 60; minutes += interval) {
      const slot = new Date(israelTime);
      slot.setHours(hour, minutes);

      // Only add future slots
      if (slot > now) {
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

app.get('/timeslots', (req, res) => {
  const dayOffset = parseInt(req.query.day || 0);
  const timeSlots = generateTimeSlots(dayOffset);
  const selectedDate = new Date();
  selectedDate.setDate(selectedDate.getDate() + dayOffset);
  selectedDate.setHours(0, 0, 0, 0);

  console.log('Selected Date:', selectedDate);

  Appointment.find({ date: { $gte: selectedDate, $lt: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000) } }, (err, appointments) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error fetching appointments');
    } else {
      res.json(availableSlots);
    }
  });
});

app.get('/confirm', (req, res) => {
  const time = req.query.time;
  res.render('confirm', { time: time });
});

app.post('/book', (req, res) => {
  console.log('Booking data:', req.body); // הוסף את השורה הזו כדי לבדוק מה נשלח לשרת
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


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on portw ${PORT}`);
});
