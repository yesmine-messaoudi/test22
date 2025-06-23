const jwt = require('jsonwebtoken');

const authMiddleware = async (req) => {
   
    if (req.user && req.user.authenticated) {
        return true; 
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('No token provided');
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, 'your-secret-key'); 
        
       
        if (typeof req.user !== 'object' || req.user === null) {
            req.user = {};
        }
        req.user.id = decoded.id;
        req.user.email = decoded.email;
        req.user.role = decoded.role; 
        req.user.authenticated = true; 
        console.log("AuthMiddleware: Token decoded successfully. User role:", decoded.role);

        return decoded; 

    } catch (error) {
        console.error("AuthMiddleware: Authentication failed:", error.message);
        throw new Error('Authentication failed: ' + error.message);
    }
};

module.exports = authMiddleware; 