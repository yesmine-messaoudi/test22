sap.ui.define([], function () {
    "use strict";

    // Small helper for write calls to the CAP service.
    // Reads go through the OData V4 model; writes use fetch so errors are easy to show.
    const SERVICE_URL = "/service/api_management_app/";
    let sCsrfToken = null;

    async function fetchCsrfToken() {
        const oResponse = await fetch(SERVICE_URL, {
            headers: { "X-CSRF-Token": "Fetch" },
            credentials: "same-origin"
        });
        sCsrfToken = oResponse.headers.get("X-CSRF-Token") || "none";
        return sCsrfToken;
    }

    async function readError(oResponse) {
        try {
            const oBody = await oResponse.json();
            return (oBody.error && oBody.error.message) || oResponse.statusText;
        } catch (e) {
            return oResponse.statusText || ("HTTP " + oResponse.status);
        }
    }

    async function request(sMethod, sPath, oBody, bRetried) {
        const oHeaders = { "Accept": "application/json" };
        if (oBody) {
            oHeaders["Content-Type"] = "application/json";
        }
        if (sMethod !== "GET") {
            oHeaders["X-CSRF-Token"] = sCsrfToken || await fetchCsrfToken();
        }

        const oResponse = await fetch(SERVICE_URL + sPath, {
            method: sMethod,
            headers: oHeaders,
            body: oBody ? JSON.stringify(oBody) : undefined,
            credentials: "same-origin"
        });

        // Token expired: fetch a new one and retry once
        const sTokenHeader = (oResponse.headers.get("X-CSRF-Token") || "").toLowerCase();
        if (oResponse.status === 403 && sTokenHeader === "required" && !bRetried) {
            sCsrfToken = null;
            return request(sMethod, sPath, oBody, true);
        }
        if (!oResponse.ok) {
            throw new Error(await readError(oResponse));
        }
        return oResponse.status === 204 ? null : oResponse.json();
    }

    return {
        getCurrentUser: function () {
            return request("GET", "me()");
        },
        create: function (sEntitySet, oData) {
            return request("POST", sEntitySet, oData);
        },
        update: function (sEntitySet, sId, oData) {
            return request("PATCH", sEntitySet + "(" + sId + ")", oData);
        },
        remove: function (sEntitySet, sId) {
            return request("DELETE", sEntitySet + "(" + sId + ")");
        }
    };
});
