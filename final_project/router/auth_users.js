const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [  { username: "newuser", password: "newpassword" }
];

const isValid = (username)=>{ const isValid = (username) => {
  return users.some(user => user.username === username);
};
}

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // Generate JWT token upon successful login
  const accessToken = jwt.sign({ username }, 'secret_key', { expiresIn: '1h' });
  req.session.token = accessToken;

  return res.status(200).json({ message: "Login successful", token: accessToken });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const token = req.session.token;

  // Check if the user is logged in
  if (!token) {
    return res.status(401).json({ message: "Unauthorized, please login" });
  }

  // Verify the JWT token
  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const username = decoded.username;
    
    // Find the book by ISBN
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Add or modify the review
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
  });
  // Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const token = req.session.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized, please login" });
  }

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const username = decoded.username;

    if (!books[isbn] || !books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "Review not found" });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review deleted successfully" });
  });
});

});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
