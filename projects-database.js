const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('project-aj.db');

function setupDatabase() {
  // Create the projects table with the 'img' field
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY,
      title TEXT,
      description TEXT,
      img TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Error creating projects table:', err.message);
      db.close();
      return;
    }

    // Insert data into the projects table
    const projectsData = [
      { title: 'Project 1', description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.', img: 'project1.jpg' },
      { title: 'Project 2', description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.', img: 'project2.jpg' },
      // Add more projects as needed
    ];

    const insertStatement = db.prepare('INSERT INTO projects (title, description, img) VALUES (?, ?, ?)');

    projectsData.forEach((project) => {
      insertStatement.run(project.title, project.description, project.img);
    });

    insertStatement.finalize();

    console.log('Projects table created and data inserted successfully');

    // Close the database connection
    db.close();
  });
}

module.exports = { setupDatabase };
