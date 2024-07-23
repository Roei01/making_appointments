const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const Appointment = require('./models/appointment');
require('dotenv').config();

const app = express();

// MongoDB URI and connection
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/admin_history', express.static(path.join(__dirname, 'public/admin_history')));
app.set('views', './public/views');
app.set('view engine', 'ejs');
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret_key', // בדוק אם SESSION_SECRET מוגדר
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: uri })
}));


// Transporter for email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Function to generate time slots
function generateTimeSlots(dayOffset = 0) {
  const slots = [];
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + dayOffset);
  const israelTime = new Date(currentDate.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
  israelTime.setHours(0, 0, 0, 0);
  const startHour = 8;
  const endHour = 20;
  const interval = 15;
  const now = new Date();

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minutes = 0; minutes < 60; minutes += interval) {
      const slot = new Date(israelTime);
      slot.setHours(hour, minutes);
      if (slot > now) {
        slots.push(slot);
      }
    }
  }
  return slots;
}

// Routes
app.get('/login', (req, res) => {
  res.render('admin_login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const isPasswordValid = await bcrypt.compare(password, adminPassword);
  if (username === adminUsername && isPasswordValid) {
    req.session.user = { username: 'admin' };
    res.redirect('/admin_dashboard');
  } else {
    res.render('admin_login', { error: 'Invalid credentials' });
  }
});

app.get('/admin_dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  Appointment.find({}).sort({ date: 1 }).exec((err, appointments) => {
    if (err) {
      console.error('Error fetching appointments:', err);
      res.status(500).send('Error fetching appointments');
    } else {
      res.render('admin_dashboard', { user: req.session.user, appointments });
    }
  });
});


app.get('/admin_history', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  Appointment.find({ date: { $lt: new Date() } }).sort({ date: -1 }).exec((err, appointments) => {
    if (err) {
      console.error('Error fetching appointments:', err);
      res.status(500).send('Error fetching appointments');
    } else {
      res.render('admin_history', { user: req.session.user, appointments });
    }
  });
});



app.post('/delete_appointment', (req, res) => {
  if (!req.session.user) {
    return res.status(403).send('Forbidden');
  }
  const appointmentId = req.body.id;
  Appointment.findByIdAndDelete(appointmentId, (err) => {
    if (err) {
      console.error('Error deleting appointment:', err);
      res.status(500).send('Error deleting appointment');
    } else {
      res.redirect('/admin_dashboard');
    }
  });
});

app.get('/timeslots', (req, res) => {
  const dayOffset = parseInt(req.query.day || 0);
  const timeSlots = generateTimeSlots(dayOffset);
  const selectedDate = new Date();
  selectedDate.setDate(selectedDate.getDate() + dayOffset);
  selectedDate.setHours(0, 0, 0, 0);

  Appointment.find({ date: { $gte: selectedDate, $lt: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000) } }, (err, appointments) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error fetching appointments');
    } else {
      const bookedSlots = appointments.map(appointment => appointment.date.getTime());
      const availableSlots = timeSlots.filter(slot => !bookedSlots.includes(slot.getTime()));
      res.json(availableSlots);
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
        from: "royinagar2@gmail.com",
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
  console.log(`Server started on port ${PORT}`);
});
