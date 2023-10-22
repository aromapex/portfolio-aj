const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('project-aj.db');
const { isAuthenticated } = require('./auth-router'); // Import the isAuthenticated middleware

db.run(`
CREATE TABLE IF NOT EXISTS technologies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  picurl TEXT
)
`, (err) => {
  if (err) {
    console.error('Error creating technologies table:', err.message);
    db.close();
    return;
  }

  console.log('Technologies table created successfully');
});

// Display technologies
router.get('/', (req, res) => {
  db.all('SELECT * FROM technologies', (err, technologiesData) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal Server Error');
      return;
    }
    console.log(technologiesData);
    res.render('tech', { technologiesData });
  });
});

// Create Operation, CAN ONLY BE DONE IF AUTHENTICATED (ADMIN)
router.post('/', isAuthenticated, (req, res) => {
  const { name, picurl } = req.body;

  if (!name) {
    return res.status(400).send('Name is required.');
  }
  const insertStatement = db.prepare('INSERT INTO technologies (name, picurl) VALUES (?, ?)');
  insertStatement.run(name, picurl);
  insertStatement.finalize();

  res.redirect('/tech');
});

// Delete Operation, CAN ONLY BE DONE IF AUTHENTICATED (ADMIN)
router.post('/:id/delete', isAuthenticated, (req, res) => {
  const techId = req.params.id;

  const deleteStatement = db.prepare('DELETE FROM technologies WHERE id=?');
  deleteStatement.run(techId);
  deleteStatement.finalize();

  res.redirect('/tech');
});



// Edit Operation for updating individual fields of a technology, CAN ONLY BE DONE IF AUTHENTICATED (ADMIN)
router.post('/:id/edit', isAuthenticated, (req, res) => {
  const techId = req.params.id;
  const { name, picurl } = req.body;

  // Check if at least one field has been provided for update
  if (!name && !picurl) {
    return res.status(400).send('At least one field (name or picurl) should be provided for update.');
  }

  // Construct the SQL query based on the provided fields
  const updateFields = [];
  const updateValues = [];

  if (name) {
    updateFields.push('name = ?');
    updateValues.push(name);
  }

  if (picurl) {
    updateFields.push('picurl = ?');
    updateValues.push(picurl);
  }

  // Build the SQL query dynamically
  const updateQuery = `UPDATE technologies SET ${updateFields.join(', ')} WHERE id=?`;
  updateValues.push(techId);

  // Execute the dynamic update query
  const updateStatement = db.prepare(updateQuery);
  updateStatement.run(...updateValues);
  updateStatement.finalize();

  res.redirect('/tech');
});

module.exports = router;
