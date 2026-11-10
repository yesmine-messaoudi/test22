sap.ui.define([], function () {
    "use strict";

    const STATUS_STATES = {
        active: "Success",
        released: "Success",
        published: "Success",
        beta: "Warning",
        draft: "Information",
        deprecated: "Error",
        retired: "Error"
    };

    const METHOD_STATES = {
        get: "Information",
        post: "Success",
        put: "Warning",
        patch: "Warning",
        delete: "Error"
    };

    function lower(sValue) {
        return (sValue || "").toLowerCase();
    }

    return {
        statusState: function (sStatus) {
            return STATUS_STATES[lower(sStatus)] || "None";
        },

        methodState: function (sMethod) {
            return METHOD_STATES[lower(sMethod)] || "None";
        },

        typeText: function (sType) {
            return sType ? sType.toUpperCase() : "";
        },

        isSoap: function (sType) {
            return lower(sType) === "soap";
        },

        initials: function (sFirstName, sLastName, sEmail) {
            const sInitials = ((sFirstName || "").charAt(0) + (sLastName || "").charAt(0)).toUpperCase();
            return sInitials || (sEmail || "?").substring(0, 2).toUpperCase();
        }
    };
});
