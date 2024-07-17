Barber Appointment System
This is a web application for booking appointments for a barber shop called "Barbari". The application allows customers to select a day and time for their appointment, view available slots, and receive confirmation emails upon booking.

Table of Contents
Features
Installation
Usage
File Structure
Code Explanation
Dependencies
Features
Responsive design for various devices
Carousel for showcasing images
Date and time selection for appointments
Real-time updates to remove booked slots
Email confirmation upon booking
Installation
To set up the project locally, follow these steps:

Clone the repository:

bash
Copy code
git clone https://github.com/yourusername/barber-appointment-system.git
cd barber-appointment-system
Install dependencies:

bash
Copy code
npm install
Set up MongoDB:

Ensure MongoDB is installed and running on your local machine.
Create a database named appointments.
Configure environment variables:

Create a .env file in the root directory and add your Gmail credentials:
makefile
Copy code
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=yourpassword
Start the server:

bash
Copy code
npm start
Open your browser and go to:

bash
Copy code
Usage
Select a date from the dropdown list.
View the available time slots for the selected date.
Click on a time slot to book an appointment.
Fill in your name and email address, then submit.
Receive an email confirmation for your booking.
File Structure
arduino
Copy code
barber-appointment-system/
├── models/
│   └── appointment.js
├── public/
│   ├── assets/
│   │   └── img/
│   │       └── loader1.svg
│   ├── image/
│   │   ├── image1.webp
│   │   ├── image2.webp
│   │   └── image3.webp
│   └── styles.css
├── views/
│   ├── confirm.ejs
│   └── index.ejs
├── .env
├── package.json
└── server.js
Code Explanation
server.js
This file sets up the Express server, connects to MongoDB, and handles routing and email notifications.

Dependencies: express, body-parser, mongoose, nodemailer
Database Connection: Connects to MongoDB using Mongoose.
Routes:
/: Renders the main page with available time slots.
/confirm: Renders the confirmation page after booking.
/book: Handles appointment bookings and sends confirmation emails.
models/appointment.js
Defines the Appointment schema for MongoDB using Mongoose.

views/index.ejs
Renders the main page, allowing users to select a date and view available time slots.

views/confirm.ejs
Renders the confirmation page after a successful booking.

public/assets/img
Contains the loader image displayed during page load.

public/image
Contains the images used in the carousel.

public/styles.css
Contains custom styles for the application.

Dependencies
Express: Web framework for Node.js.
Body-Parser: Middleware for parsing request bodies.
Mongoose: MongoDB object modeling for Node.js.
Nodemailer: Module for sending emails.
EJS: Embedded JavaScript templating.
Bootstrap: CSS framework for responsive design.
Font Awesome: Icon set and toolkit.
Select2: jQuery-based replacement for select boxes.
SweetAlert2: Beautiful, responsive, customizable alerts.
Contact
If you have any questions or suggestions, please feel free to reach out to me at [@Roei01].

