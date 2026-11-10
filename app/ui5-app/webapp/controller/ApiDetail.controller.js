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

    // Read-only detail page of a SAP standard API or an internal API (SharePoint document).
    // The API is read once and shown through the JSON model "api".
    return BaseController.extend("com.app.controller.ApiDetail", {
        onInit: function () {
            this.setModel(new JSONModel({}), "view");
            this.setModel(new JSONModel({}), "api");
            this.getRouter().getRoute("apiDetail").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const oArgs = oEvent.getParameter("arguments");
            this._sKind = oArgs.kind === "standard" ? "standard" : "internal";
            this.getModel("app").setProperty("/selectedKey", this._sKind);

            this.getModel("api").setData({});
            this.getModel("view").setData({
                busy: true,
                isInternal: this._sKind === "internal",
                isSoap: false,
                listTitle: this.getText(LIST_TITLES[this._sKind])
            });

            this._loadApi(oArgs.id);
        },

        _loadApi: function (sId) {
            const oViewModel = this.getModel("view");
            let sPath;
            let oParameters = {};

            if (this._sKind === "standard") {
                // Standard API keys are numbers (ID_PACKAGE)
                sPath = "/StandardAPI(" + parseInt(sId, 10) + ")";
                oParameters = { $expand: "methods($orderby=section,ID),operations($orderby=portType)" };
            } else {
                // Internal API keys are strings (SharePoint IDs)
                sPath = "/InternalApis('" + encodeURIComponent(String(sId).replace(/'/g, "''")) + "')";
            }

            const oBinding = this.getOwnerComponent().getModel().bindContext(sPath, null, oParameters);
            oBinding.requestObject().then(function (oApi) {
                if (!oApi) {
                    throw new Error("not found");
                }
                this.getModel("api").setData(oApi);
                oViewModel.setProperty("/isSoap", formatter.isSoap(oApi.type));
            }.bind(this)).catch(function () {
                MessageBox.error(this.getText("apiNotFound"), { onClose: this.onNavToList.bind(this) });
            }.bind(this)).finally(function () {
                oViewModel.setProperty("/busy", false);
                oBinding.destroy();
            });
        },

        onOpenDocument: function () {
            window.open(this.getModel("api").getProperty("/url"), "_blank", "noopener");
        },

        onNavToList: function () {
            this.getRouter().navTo("apiList", { kind: this._sKind });
        }
    });
});
