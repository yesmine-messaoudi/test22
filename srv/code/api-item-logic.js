const cds = require('@sap/cds');

/**
 * Methods and operations can only be changed by the owner of their internal API.
 * Items that belong to standard APIs are read-only.
 * @param {cds.Request} req
 */
module.exports = async function (req) {
    const { InternalApi } = cds.entities('apiapp');
    let apiId = req.data.internalApi_ID;

    if (req.event !== 'CREATE') {
        const key = req.params[req.params.length - 1];
        const itemId = (key && typeof key === 'object') ? key.ID : key;
        const item = await SELECT.one.from(req.target, itemId).columns('internalApi_ID');
        if (!item) return req.reject(404, 'Item not found');
        if (req.data.internalApi_ID && req.data.internalApi_ID !== item.internalApi_ID) {
            return req.reject(400, 'An item cannot be moved to another API');
        }
        apiId = item.internalApi_ID;
    }

    if (!apiId) return req.reject(403, 'Only items of internal APIs can be changed');

    const api = await SELECT.one.from(InternalApi, apiId).columns('createdBy');
    if (!api) return req.reject(400, 'Internal API not found');
    if (api.createdBy !== req.user.id) return req.reject(403, 'You can only change your own APIs');

    // Internal API items are never linked to a standard API
    if (req.event !== 'DELETE') delete req.data.package_id;
};
