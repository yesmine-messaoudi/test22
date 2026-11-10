sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "../model/formatter"
], function (BaseController, JSONModel, MessageBox, formatter) {
    "use strict";

    const LIST_TITLES = {
        standard: "navStandardApis",
        internal: "navInternalApis"
    };

    // Read-only detail page of a standard (SAP) or internal API
    return BaseController.extend("com.app.controller.ApiDetail", {
        onInit: function () {
            this.setModel(new JSONModel({}), "view");
            this.getRouter().getRoute("apiDetail").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const oArgs = oEvent.getParameter("arguments");
            this._sKind = oArgs.kind === "standard" ? "standard" : "internal";
            this.getModel("app").setProperty("/selectedKey", this._sKind);

            this.getModel("view").setData({
                busy: true,
                isSoap: false,
                listTitle: this.getText(LIST_TITLES[this._sKind])
            });

            const sEntitySet = this._sKind === "standard" ? "StandardAPI" : "InternalApis";
            this.getView().bindElement({ path: "/" + sEntitySet + "(" + oArgs.id + ")" });
            this._loadApi();
        },

        _loadApi: function () {
            const oViewModel = this.getModel("view");
            const oContext = this.getView().getElementBinding().getBoundContext();

            oViewModel.setProperty("/busy", true);
            return oContext.requestObject().then(function (oApi) {
                if (!oApi) {
                    throw new Error("not found");
                }
                oViewModel.setProperty("/isSoap", formatter.isSoap(oApi.type));
            }).catch(function () {
                MessageBox.error(this.getText("apiNotFound"), { onClose: this.onNavToList.bind(this) });
            }.bind(this)).finally(function () {
                oViewModel.setProperty("/busy", false);
            });
        },

        onNavToList: function () {
            this.getRouter().navTo("apiList", { kind: this._sKind });
        }
    });
});
