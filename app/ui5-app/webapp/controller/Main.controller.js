sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/m/MessageToast"
], function (Controller, UIComponent, JSONModel, Device, MessageToast) {
    "use strict";

    return Controller.extend("com.app.controller.Main", {
        onInit: function () {
            // Set device model for responsive design
            var oDeviceModel = new JSONModel(Device);
            oDeviceModel.setDefaultBindingMode("OneWay");
            this.getView().setModel(oDeviceModel, "device");

            // Register for routePatternMatched event to ensure elements are rendered
            this.getOwnerComponent().getRouter().getRoute("main").attachPatternMatched(this._onMainRouteMatched, this);

            // Ensure search field is visible by default
            var oView = this.getView();
            var oSearchField = oView.byId("searchField");
            if (oSearchField) {
                oSearchField.setVisible(true);
            }
        },

        _onMainRouteMatched: function() {
            // Initialize responsive design after the view has been fully matched and rendered
            Device.media.attachHandler(this._handleMediaChange, this); // Attach once
            this._handleMediaChange();
            
            // Ensure search field is visible when route is matched
            var oView = this.getView();
            var oSearchField = oView.byId("searchField");
            if (oSearchField) {
                oSearchField.setVisible(true);
            }
        },

        _handleMediaChange: function () {
            var rangeName = Device.media.getCurrentRange("StdExt").name;
            var oView = this.getView();
            const oSearchField = oView.byId("searchField");
            const oSearchButton = oView.byId("searchButton");

            // Make sure elements are found before trying to set properties
            if (!oSearchField || !oSearchButton) {
                console.error("SearchField or SearchButton not found in _handleMediaChange after route match.");
                return;
            }

            // Always keep search field visible regardless of screen size
            oSearchField.setVisible(true);
            oSearchButton.setVisible(false);

            // Handle text sizing based on screen size
            switch (rangeName) {
                case "LargeDesktop":
                    oView.byId("mainTitle").addStyleClass("main-title-large");
                    oView.byId("subTitle").addStyleClass("sub-title-large");
                    oView.byId("descriptionText").addStyleClass("description-text-large");
                    break;

                case "Desktop":
                    oView.byId("mainTitle").addStyleClass("main-title-medium");
                    oView.byId("subTitle").addStyleClass("sub-title-medium");
                    oView.byId("descriptionText").addStyleClass("description-text-medium");
                    break;

                case "Tablet":
                    oView.byId("mainTitle").addStyleClass("main-title-small");
                    oView.byId("subTitle").addStyleClass("sub-title-small");
                    oView.byId("descriptionText").addStyleClass("description-text-small");
                    break;

                case "Phone":
                    oView.byId("mainTitle").addStyleClass("main-title-xsmall");
                    oView.byId("subTitle").addStyleClass("sub-title-xsmall");
                    oView.byId("descriptionText").addStyleClass("description-text-xsmall");
                    break;
                default:
                    break;
            }
        },

        onExit: function() {
            Device.media.detachHandler(this._handleMediaChange, this);
            // Detach route pattern matched handler on exit to prevent memory leaks
            this.getOwnerComponent().getRouter().getRoute("main").detachPatternMatched(this._onMainRouteMatched, this);
        }
    });
}); 