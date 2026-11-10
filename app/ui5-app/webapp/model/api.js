sap.ui.define([], function () {
    "use strict";

    // Small helper for calls to the CAP service that are not plain entity reads.
    // Entity reads go through the OData V4 model.
    const SERVICE_URL = "/service/api_management_app/";

    async function get(sPath) {
        const oResponse = await fetch(SERVICE_URL + sPath, {
            headers: { "Accept": "application/json" },
            credentials: "same-origin"
        });
        if (!oResponse.ok) {
            let sMessage = oResponse.statusText || ("HTTP " + oResponse.status);
            try {
                const oBody = await oResponse.json();
                sMessage = (oBody.error && oBody.error.message) || sMessage;
            } catch (e) { /* keep status text */ }
            throw new Error(sMessage);
        }
        return oResponse.json();
    }

    return {
        getCurrentUser: function () {
            return get("me()");
        }
    };
});
