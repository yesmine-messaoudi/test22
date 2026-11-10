sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "../model/formatter"
], function (Controller, UIComponent, formatter) {
    "use strict";

    return Controller.extend("com.app.controller.BaseController", {
        formatter: formatter,

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        setModel: function (oModel, sName) {
            this.getView().setModel(oModel, sName);
            return this;
        },

        getText: function (sKey, aArgs) {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey, aArgs);
        }
    });
});
