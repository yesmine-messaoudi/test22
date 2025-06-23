/**
 * 
 * @On(event = { "READ" }, entity = "appSrv.StandardAPI")
 * @param {cds.Request} request - User information, tenant-specific CDS model, headers and query parameters
 * @param {Function} next - Callback function to the next handler
 */
module.exports = async function(request, next) {
    const { StandardAPI, Operations, Methods } = cds.entities;

    // Proceed with the default READ operation
    const result = await next();

    // Check if a specific StandardAPI is requested
    if (request.params.length === 1 && result) {
        const standardApiId = request.params[0].ID;

        // Fetch the specific StandardAPI
        const standardApi = await SELECT.one.from(StandardAPI).where({ ID: standardApiId });

        if (standardApi) {
            // Check the type of the StandardAPI
            if (standardApi.type === 'soap') {
                // Fetch operations if type is 'soap'
                const operations = await SELECT.from(Operations).where({ standardAPI_ID: standardApiId });
                standardApi.operations = operations;
            } else {
                // Fetch methods otherwise
                const methods = await SELECT.from(Methods).where({ standardAPI_ID: standardApiId });
                standardApi.methods = methods;
            }

            // Return the enriched StandardAPI
            return standardApi;
        }
    } else if (Array.isArray(result)) {
        // If a list of StandardAPIs is requested, filter the fields
        return result.map(standardApi => ({
            title: standardApi.title,
            description: standardApi.description,
            type: standardApi.type,
            version: standardApi.version,
            status: standardApi.status
        }));
    }

    // Return the result as is for list or if no specific ID is requested
    return result;
}