const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const session = require('express-session');

router.use(bodyParser.urlencoded({ extended: true }));

// Sample hardcoded username and password for demonstration
const validUsername = 'demo';
const validPassword = 'password';

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    // The user is authenticated
    next();
  } else {
    // Redirect to the login page if not authenticated
    res.redirect('/login');
  }
};

// Render the login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Handle login form submission
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if the username and password match the hardcoded values
  if (username === validUsername && password === validPassword) {
    // Set user information in the session
    req.session.user = { username };
    // Successful login
    console.log('successfull login');
    req.session.isAuthenticated = true;

    res.redirect('/projects');
  } else {
    console.log('noooooooooo failed login');
    // Failed login, you might render the login page with an error message
    res.render('login', { error: 'Invalid username or password' });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  // Destroy the session to log out the user
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = { router, isAuthenticated };