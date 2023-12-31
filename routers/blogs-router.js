const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('project-aj.db');
const { isAuthenticated } = require('./auth-router'); // Import the isAuthenticated middleware, to be used as a method

//Drop the existing table
// db.run('DROP TABLE IF EXISTS blogs;', function(err) {
//     if (err) {
//         console.error(err.message);
//     } else {
//         console.log('Table dropped successfully');
//     }
// });

db.run('CREATE TABLE IF NOT EXISTS blogs (' +
    'post_id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
    'title TEXT NOT NULL, ' +
    'tags TEXT NOT NULL, ' +
    'author TEXT NOT NULL, ' +
    'content TEXT NOT NULL, ' +
    'img_url TEXT, ' + 
    'brief_summary TEXT' + 
');', function(err) {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Table created successfully');
    }
});

// Display blogs
router.get('/', (req, res) => {
    db.all('SELECT * FROM blogs', (err, blogsData) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        console.log(blogsData);
        res.render('blog', { blogsData });
    });
});

// route to handle detailed blog pages
router.get('/:post_id', (req, res) => {
    const postId = req.params.post_id;
    // Retrieve the blog post details from the database
    db.get('SELECT * FROM blogs WHERE post_id = ?', postId, (err, blogData) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Render the detailed blog page with the retrieved data
        res.render('blogdetail', blogData);
    });
});
// Create Operation, CAN ONLY BE DONE IF AUTHENTICATED (ADMIN)
router.post('/', isAuthenticated, (req, res) => {
    console.log('create operation');

    const { title, content, author, tags, img_url, brief_summary } = req.body;

    if (!title || !content || !author || !tags) {
        return res.status(400).send('Title, content, author, and tags are required.');
    }

    const insertStatement = db.prepare('INSERT INTO blogs (title, content, author, tags, img_url, brief_summary) VALUES (?, ?, ?, ?, ?, ?)');
    insertStatement.run(title, content, author, tags, img_url, brief_summary);
    insertStatement.finalize();

    res.redirect('/blog');
});

// Delete Operation, CAN ONLY BE DONE IF AUTHENTICATED (ADMIN)
router.post('/:post_id/delete', isAuthenticated, (req, res) => { 
    console.log('delete operation');
    const postId = req.params.post_id;

    const deleteStatement = db.prepare('DELETE FROM blogs WHERE post_id=?');
    deleteStatement.run(postId);
    deleteStatement.finalize();

    res.redirect('/blog');
});

// Edit Operation for updating individual fields of a blog post, CAN ONLY BE DONE IF AUTHENTICATED (ADMIN)
router.post('/:post_id/edit', isAuthenticated, (req, res) => {
    console.log('edit operation');
    const postId = req.params.post_id;
    const { title, content, author, tags, img_url, brief_summary } = req.body;

    // Check if at least one field has been provided for update
    if (!title && !content && !author && !tags && !img_url && !brief_summary) {
        return res.status(400).send('At least one field (title, content, author, tags, img_url, or brief_summary) should be provided for update.');
    }

    // Construct the SQL query based on the provided fields
    const updateFields = [];
    const updateValues = [];

    if (title) {
        updateFields.push('title = ?');
        updateValues.push(title);
    }

    if (content) {
        updateFields.push('content = ?');
        updateValues.push(content);
    }

    if (author) {
        updateFields.push('author = ?');
        updateValues.push(author);
    }

    if (tags) {
        updateFields.push('tags = ?');
        updateValues.push(tags);
    }

    if (img_url) {
        updateFields.push('img_url = ?');
        updateValues.push(img_url);
    }

    if (brief_summary) {
        updateFields.push('brief_summary = ?');
        updateValues.push(brief_summary);
    }

    // Build the SQL query dynamically
    const updateQuery = `UPDATE blogs SET ${updateFields.join(', ')} WHERE post_id=?`;
    updateValues.push(postId);

    // Execute the dynamic update query
    const updateStatement = db.prepare(updateQuery);
    updateStatement.run(...updateValues);
    updateStatement.finalize();

    res.redirect('/blog');
});

module.exports = router;