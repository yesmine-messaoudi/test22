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

    const FILE_TYPES = {
        ppt: { icon: "sap-icon://ppt-attachment", label: "PowerPoint" },
        pptx: { icon: "sap-icon://ppt-attachment", label: "PowerPoint" },
        doc: { icon: "sap-icon://doc-attachment", label: "Word" },
        docx: { icon: "sap-icon://doc-attachment", label: "Word" },
        xls: { icon: "sap-icon://excel-attachment", label: "Excel" },
        xlsx: { icon: "sap-icon://excel-attachment", label: "Excel" },
        pdf: { icon: "sap-icon://pdf-attachment", label: "PDF" }
    };

    function lower(sValue) {
        return (sValue || "").toLowerCase();
    }

    function extension(sFileName) {
        const iDot = (sFileName || "").lastIndexOf(".");
        return iDot === -1 ? "" : lower(sFileName.substring(iDot + 1));
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

        typeIcon: function (sType) {
            return lower(sType) === "soap" ? "sap-icon://chain-link" : "sap-icon://synchronize";
        },

        // Icon and label from the document's file extension
        fileIcon: function (sFileName) {
            return FILE_TYPES[extension(sFileName)]?.icon || "sap-icon://document";
        },

        fileType: function (sFileName) {
            return FILE_TYPES[extension(sFileName)]?.label || extension(sFileName).toUpperCase();
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
