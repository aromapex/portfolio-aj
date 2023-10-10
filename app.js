const express = require('express');
const { engine } = require('express-handlebars');
const port = 8080;
const app = express();
const projectsRouter = require('./routers/projects-routers');
const bodyParser = require('body-parser'); 
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('project-aj.db');
const { setupDatabase } = require('./projects-database');
const { router: authRouter, isAuthenticated } = require('./routers/auth-router');
const session = require('express-session');

const blogRouter = require('./routers/blogs-router');

app.use(session({
  secret: 'your-secret-key', // Change this to a secret key 
  resave: false,
  saveUninitialized: true,
}));

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isAuthenticated || false;
  next();
});

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

// Use the projects router for handling project-related routes
app.use('/projects', require('./routers/projects-routers'));
app.use('/blog', require('./routers/blogs-router'));
app.use('/tech', require('./routers/tech-router'));

app.use('/', authRouter);

-

// Call the setupDatabase function to create the database and insert 
//setupDatabase();

// CONTROLLER (THE BOSS)
// defines route "/"
app.get('/', function(request, response){
  response.render('home.handlebars')
})

// renders a view WITHOUT DATA
app.get('/about', (req, res) => {
  res.render('about');
  console.log("accessing about route");
});



app.get('/login', (req, res) => {
  res.render('login');
  console.log("accessing login route");
});


// defines the final default route 404 NOT FOUND
app.use(function(req,res){
  res.status(404).render('404.handlebars');
});

app.listen(port, () => {
  console.log(`Server running and listening on port ${port}...`);
});

module.exports = app;
