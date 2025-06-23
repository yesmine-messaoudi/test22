const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
    constructor(db) {
        this.db = db;
        this.jwtSecret = 'your-secret-key'; 
    }

    async login(email, password) {
        try {
            const user = await this.db.read('app.Users').where({ email: email }).limit(1);

            if (!user || user.length === 0) {
                throw new Error('User not found');
            }

            const userData = user[0];
            const isHashed = userData.password.startsWith('$2b$');
            let isValidPassword = false;

            if (isHashed) {
                isValidPassword = await bcrypt.compare(password, userData.password);
            } else {

                isValidPassword = password === userData.password;
            }

            if (!isValidPassword) {
                throw new Error('Invalid password');
            }


            const token = jwt.sign(
                { 
                    id: userData.ID,
                    email: userData.email,
                    role: userData.role
                },
                this.jwtSecret,
                { expiresIn: '24h' }
            );

            return {
                token,
                user: {
                    id: userData.ID,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    role: userData.role
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async register(userData) {
        try {
            if (!userData.email.endsWith('@aymax.fr')) {
                throw new Error('Email must end with @aymax.fr');
            }
            const existingUser = await this.db.read('app.Users').where({ email: userData.email }).limit(1);

            if (existingUser && existingUser.length > 0) {
                throw new Error('User already exists');
            }

            const validRoles = ['admin', 'technical consultant', 'functional consultant'];
            if (!validRoles.includes(userData.role)) {
                throw new Error('Invalid role');
            }

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const newUser = await this.db.create('app.Users', {
                email: userData.email,
                password: hashedPassword,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role
            });

            return {
                message: 'User registered successfully',
                user: {
                    id: newUser.ID,
                    email: newUser.email,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    role: newUser.role
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async validateToken(token) {
        try {
            const decoded = jwt.verify(token, this.jwtSecret);
            return decoded;
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}

module.exports = AuthService; 