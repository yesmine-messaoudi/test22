/**
 * Returns the logged-in user's profile.
 * Names come from the mocked user's `attr` locally, or from the XSUAA token in production.
 * @param {cds.Request} req
 */
module.exports = function (req) {
    const { user } = req;
    const attr = user.attr || {};
    const token = user.tokenInfo;
    const payload = (token && (typeof token.getPayload === 'function' ? token.getPayload() : token.payload)) || {};

    return {
        id: user.id,
        email: attr.email || payload.email || user.id,
        firstName: attr.givenName || payload.given_name || '',
        lastName: attr.familyName || payload.family_name || '',
        hasAccess: user.is('APIHubUser')
    };
};
