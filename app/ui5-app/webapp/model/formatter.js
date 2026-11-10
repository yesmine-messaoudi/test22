sap.ui.define([
    "sap/ui/core/format/DateFormat"
], function (DateFormat) {
    "use strict";

    const DATE_FORMAT = DateFormat.getDateInstance({ style: "medium" });

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

        // "2025-07-06T23:09:06.197635" or "2025-07-15" -> "6 juil. 2025" (user's locale)
        date: function (vValue) {
            if (!vValue) {
                return "";
            }
            const oDate = vValue instanceof Date ? vValue : new Date(String(vValue).replace(" ", "T"));
            return isNaN(oDate.getTime()) ? String(vValue) : DATE_FORMAT.format(oDate);
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
