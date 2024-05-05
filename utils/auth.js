const jwt = require('jsonwebtoken');

const ensureAuthenticated = (req, res, next) => {
    if (!req.headers['authorization']) {
        return res.status(403).json({ message: 'Token is required.' });
    }
    try {
        const token = req.headers['authorization'].split(' ')[1];
        const decoded = jwt.verify(token, process.env.SECRET);

        // You can set the decoded token data to the request object for future use
        req.user = decoded;

        return next();
    } catch (error) {
        return res.status(403).json({ message: 'Token is not valid or expired' });
    }
}

module.exports = {
    ensureAuthenticated
}