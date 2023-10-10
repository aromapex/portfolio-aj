const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('project-aj.db');

// Define your routes here, such as displaying projects, deleting projects, etc.
// Example:
router.get('/', (req, res) => {
   
  db.all('SELECT * FROM projects', (err, projectsData) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal Server Error');
      return;
    }
    console.log(projectsData);
    res.render('projects', { projectsData});
  });
});


// Create Operation
router.post('/', (req, res) => {
    const { title, description, img } = req.body;
  
    if (!title || !description) {
      return res.status(400).send('Title and description are required.');
    }
  
    const insertStatement = db.prepare('INSERT INTO projects (title, description, img) VALUES (?, ?, ?)');
    insertStatement.run(title, description, img);
    insertStatement.finalize();
  
    res.redirect('/projects');
});



router.post('/:id/delete', (req, res) => {
    const projectId = req.params.id;
  
    const deleteStatement = db.prepare('DELETE FROM projects WHERE id=?');
    deleteStatement.run(projectId);
    deleteStatement.finalize();
  
    res.redirect('/projects');
  });
  

  router.post('/:id/edit', (req, res) => {
    const projectId = req.params.id;
    const { title, description, img } = req.body;
  
    // Check if at least one field has been provided for update
    if (!title && !description && !img) {
      return res.status(400).send('At least one field (title, description, or img) should be provided for update.');
    }
  
    // Construct the SQL query based on the provided fields
    const updateFields = [];
    const updateValues = [];
  
    if (title) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
  
    if (description) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
  
    if (img) {
      updateFields.push('img = ?');
      updateValues.push(img);
    }
  
    // Build the SQL query dynamically
    const updateQuery = `UPDATE projects SET ${updateFields.join(', ')} WHERE id=?`;
    updateValues.push(projectId);
  
    // Execute the dynamic update query
    const updateStatement = db.prepare(updateQuery);
    updateStatement.run(...updateValues);
    updateStatement.finalize();
  
    res.redirect('/projects');
  });
  

  module.exports = router;
// Add more routes as needed


