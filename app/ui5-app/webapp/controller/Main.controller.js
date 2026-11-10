sap.ui.define([
    "./BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("com.app.controller.Main", {
        onSearch: function (oEvent) {
            const sQuery = (oEvent.getParameter("query") || "").trim();
            const oParams = { kind: "standard" };
            if (sQuery) {
                oParams["?query"] = { search: sQuery };
            }
            this.getRouter().navTo("apiList", oParams);
        },

        onExplore: function () {
            this.getRouter().navTo("apiList", { kind: "standard" });
        },

        onManage: function () {
            this.getRouter().navTo("apiList", { kind: "mine" });
        },

        onAskApi: function () {
            this.getOwnerComponent().getModel("app").setProperty("/chatOpen", true);
        }
    });
});
