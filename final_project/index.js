const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Set up session for customer routes
app.use("/customer", session({
    secret: "fingerprint_customer", 
    resave: true, 
    saveUninitialized: true
}));

// Authentication middleware for /customer/auth/* routes
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if session has an access token
    if (req.session.accessToken) {
        // Verify the access token
        jwt.verify(req.session.accessToken, 'your_secret_key', (err, user) => {
            if (err) {
                // If the token is invalid or expired
                return res.status(403).json({ message: "Invalid or expired token" });
            }
            // If the token is valid, attach user info to the request object
            req.user = user;
            next();
        });
    } else {
        // If no access token is found in the session
        return res.status(401).json({ message: "Unauthorized, please login" });
    }
});

const PORT = 5000;

// Customer routes (authenticated)
app.use("/customer", customer_routes);

// General routes (public)
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
