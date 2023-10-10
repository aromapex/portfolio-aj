const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('project-aj.db');

// Create the career table if it doesn't exist
db.run(`
CREATE TABLE IF NOT EXISTS career (
  entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  institution TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  description TEXT
)
`, function (err) {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Career table created successfully');
  }
});

// Display education and work experience data
router.get('/', (req, res) => {
  db.all('SELECT * FROM career', (err, careerData) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal Server Error');
      return;
    }

    console.log(careerData);
    res.render('about', { careerData });
  });
});

// Create Operation
router.post('/', (req, res) => {
  const { start_date, end_date, institution, title, location, description } = req.body;

  if (!start_date || !institution || !title) {
    return res.status(400).send('Start date, institution, and title are required.');
  }

  const insertStatement = db.prepare('INSERT INTO career (start_date, end_date, institution, title, location, description) VALUES (?, ?, ?, ?, ?, ?)');
  insertStatement.run(start_date, end_date, institution, title, location, description);
  insertStatement.finalize();

  res.redirect('/about');
});

// Delete Operation
router.post('/:entry_id/delete', (req, res) => {
  const entryId = req.params.entry_id;

  const deleteStatement = db.prepare('DELETE FROM career WHERE entry_id=?');
  deleteStatement.run(entryId);
  deleteStatement.finalize();

  res.redirect('/about');
});

// Edit Operation for updating individual fields of a career entry
router.post('/:entry_id/edit', (req, res) => {
  const entryId = req.params.entry_id;
  const { start_date, end_date, institution, title, location, description } = req.body;

  // Check if at least one field has been provided for update
  if (!start_date && !end_date && !institution && !title && !location && !description) {
    return res.status(400).send('At least one field (start date, end date, institution, title, location, or description) should be provided for update.');
  }

  // Construct the SQL query based on the provided fields
  const updateFields = [];
  const updateValues = [];

  if (start_date) {
    updateFields.push('start_date = ?');
    updateValues.push(start_date);
  }

  if (end_date) {
    updateFields.push('end_date = ?');
    updateValues.push(end_date);
  }

  if (institution) {
    updateFields.push('institution = ?');
    updateValues.push(institution);
  }

  if (title) {
    updateFields.push('title = ?');
    updateValues.push(title);
  }

  if (location) {
    updateFields.push('location = ?');
    updateValues.push(location);
  }

  if (description) {
    updateFields.push('description = ?');
    updateValues.push(description);
  }

  // Build the SQL query dynamically
  const updateQuery = `UPDATE career SET ${updateFields.join(', ')} WHERE entry_id=?`;
  updateValues.push(entryId);

  // Execute the dynamic update query
  const updateStatement = db.prepare(updateQuery);
  updateStatement.run(...updateValues);
  updateStatement.finalize();

  res.redirect('/about');
});

module.exports = router;
