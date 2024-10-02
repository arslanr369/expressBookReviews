const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Mock function to simulate a database call
const fetchBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
        // Simulate a delay to mimic async operation
        setTimeout(() => {
            const booksByTitle = Object.values(books).filter(book => book.title === title);
            if (booksByTitle.length > 0) {
                resolve(booksByTitle);
            } else {
                reject(new Error("No books found with this title"));
            }
        }, 1000);
    });
};

// Get book details based on title using Async/Await
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;

    try {
        const booksByTitle = await fetchBooksByTitle(title);
        return res.status(200).json(booksByTitle);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

// Other routes remain unchanged
public_users.get('/', async function (req, res) {
    try {
        const allBooks = await fetchBooks();
        return res.status(200).json(allBooks);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books" });
    }
});

// Add additional routes...

module.exports.general = public_users;
