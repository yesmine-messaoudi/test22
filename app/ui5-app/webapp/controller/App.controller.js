sap.ui.define([
    "./BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("com.app.controller.App", {
        onInit: function () {
            this.getRouter().attachRouteMatched(this._onRouteMatched, this);
        },

        // Keep the selected nav tab in sync with the URL
        // (the detail page sets it itself, based on where the user came from)
        _onRouteMatched: function (oEvent) {
            const sRoute = oEvent.getParameter("name");
            const oAppModel = this.getModel("app");
            if (sRoute === "main") {
                oAppModel.setProperty("/selectedKey", "home");
            } else if (sRoute === "apiList") {
                oAppModel.setProperty("/selectedKey", oEvent.getParameter("arguments").kind);
            }
        },

        onNavSelect: function (oEvent) {
            const sKey = oEvent.getParameter("key");
            if (sKey === "home") {
                this.getRouter().navTo("main");
            } else {
                this.getRouter().navTo("apiList", { kind: sKey });
            }
        },

        onLogoPress: function () {
            this.getRouter().navTo("main");
        },

        /* ---------- User menu ---------- */

        onAvatarPress: function (oEvent) {
            this.byId("userPopover").openBy(oEvent.getSource());
        },

        onLogout: function () {
            // Approuter logout endpoint (see app/ui5-app/xs-app.json)
            window.location.href = "/do/logout";
        },

        /* ---------- Chatbot ---------- */

        onToggleChat: function () {
            const oAppModel = this.getModel("app");
            oAppModel.setProperty("/chatOpen", !oAppModel.getProperty("/chatOpen"));
        },

        onCloseChat: function () {
            this.getModel("app").setProperty("/chatOpen", false);
        },

        onChatLiveChange: function (oEvent) {
            this.byId("chatSend").setEnabled(!!oEvent.getParameter("value").trim());
        },

        onSendChat: function () {
            const oInput = this.byId("chatInput");
            const sText = oInput.getValue().trim();
            if (!sText) {
                return;
            }

            const oAppModel = this.getModel("app");
            const oUser = this.getModel("user").getData();
            const aMessages = oAppModel.getProperty("/chatMessages").concat([
                { sender: oUser.fullName, initials: oUser.initials, text: sText },
                // The assistant has no backend yet
                { sender: this.getText("chatBotName"), initials: "AI", text: this.getText("chatBotNotConnected") }
            ]);
            oAppModel.setProperty("/chatMessages", aMessages);

            oInput.setValue("");
            this.byId("chatSend").setEnabled(false);
        }
    });
});
