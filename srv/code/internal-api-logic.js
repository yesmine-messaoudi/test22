const cds = require('@sap/cds');

/**
 * Keeps `lastModified` up to date on every create/update.
 * @param {cds.Request} req
 */
function setLastModified(req) {
    req.data.lastModified = new Date().toISOString();
}

/**
 * Methods and operations are plain associations, so remove them
 * together with their API (runs only if the delete was allowed).
 * @param {any} _result
 * @param {cds.Request} req
 */
async function deleteItems(_result, req) {
    const { Method, Operation } = cds.entities('apiapp');
    const apiId = req.data.ID;
    await DELETE.from(Method).where({ internalApi_ID: apiId });
    await DELETE.from(Operation).where({ internalApi_ID: apiId });
}

module.exports = { setLastModified, deleteItems };
