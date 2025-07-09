/**
 * 
 * @On(event = { "CREATE","READ","UPDATE","DELETE" }, entity = "appSrv.Users")
 * @param {cds.Request} request - User information, tenant-specific CDS model, headers and query parameters
 * @param {Function} next - Callback function to the next handler
 */
const bcrypt = require('bcrypt');

module.exports = async function(request, next) {
    const { Users } = cds.entities;

    // Implement authorization logic here using request.user, which is populated by CAP
    const isAuthenticated = request.user && request.user.authenticated;
    const isAdmin = request.user && request.user.role === 'admin';
    const userId = request.user && request.user.id;

    if (!isAuthenticated) {
        return request.reject(401, 'Authentication required');
    }

    if (request.event === 'READ') {
        if (!isAdmin) {
            request.query.where({ ID: userId });
        }
    } else if (request.event === 'CREATE') {
        const { email, password, role } = request.data;
        if (!email.endsWith('@aymax.fr')) {
            return request.reject(400, 'Email must end with @aymax.fr');
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            request.data.password = hashedPassword;
        }
    } else if (['UPDATE', 'DELETE'].includes(request.event)) {
        if (!isAdmin) {
            const { ID } = request.data;
            if (ID !== userId) {
                return request.reject(403, 'You are not authorized to manage other users');
            }
        }
        if (request.event === 'UPDATE') {
            const { password } = request.data;
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                request.data.password = hashedPassword;
            }
        }
    }

    return next();
};s
