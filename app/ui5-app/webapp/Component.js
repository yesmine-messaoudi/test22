sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "./model/api",
    "./model/formatter"
], function (UIComponent, JSONModel, api, formatter) {
    "use strict";

    return UIComponent.extend("com.app.Component", {
        metadata: {
            manifest: "json",
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            // UI state: selected nav tab and chatbot panel
            this.setModel(new JSONModel({
                selectedKey: "home",
                chatOpen: false,
                chatMessages: []
            }), "app");

            // Logged-in user (from XSUAA via the backend)
            const oUserModel = new JSONModel({ loaded: false, hasAccess: false });
            this.setModel(oUserModel, "user");

            api.getCurrentUser().then(function (oUser) {
                const sFullName = [oUser.firstName, oUser.lastName].filter(Boolean).join(" ");
                oUserModel.setData(Object.assign({}, oUser, {
                    loaded: true,
                    fullName: sFullName || oUser.email,
                    initials: formatter.initials(oUser.firstName, oUser.lastName, oUser.email)
                }));
            }).catch(function (oError) {
                oUserModel.setData({ loaded: true, hasAccess: false, error: oError.message });
            }).then(function () {
                // Only start navigation once we know the user may use the app
                if (oUserModel.getProperty("/hasAccess")) {
                    this.getRouter().initialize();
                }
            }.bind(this));
        }
    });
});
