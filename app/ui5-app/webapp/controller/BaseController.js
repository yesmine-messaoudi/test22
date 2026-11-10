sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../model/formatter",
    "../model/api"
], function (Controller, UIComponent, JSONModel, MessageBox, MessageToast, formatter, api) {
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
        },

        getUserId: function () {
            return this.getOwnerComponent().getModel("user").getProperty("/id");
        },

        /* ---------- Create / edit an internal API (used by list and detail pages) ---------- */

        /**
         * Opens the API dialog. Resolves with true when the API was saved.
         * @param {object|null} oApi existing API to edit, or null to create one
         * @returns {Promise<boolean>}
         */
        openApiDialog: function (oApi) {
            return this._getApiDialog().then(function (oDialog) {
                oApi = oApi || {};
                oDialog.getModel("form").setData({
                    isEdit: !!oApi.ID,
                    ID: oApi.ID,
                    title: oApi.title || "",
                    description: oApi.description || "",
                    version: oApi.version || "1.0.0",
                    type: (oApi.type || "rest").toLowerCase(),
                    status: oApi.status || "Active",
                    titleState: "None"
                });
                oDialog.open();
                return new Promise(function (resolve) {
                    this._fnApiDialogDone = resolve;
                }.bind(this));
            }.bind(this));
        },

        onApiTitleChange: function () {
            this._getApiDialog().then(function (oDialog) {
                oDialog.getModel("form").setProperty("/titleState", "None");
            });
        },

        onApiDialogSave: async function () {
            const oDialog = await this._getApiDialog();
            const oForm = oDialog.getModel("form");
            const oData = oForm.getData();

            if (!oData.title.trim()) {
                oForm.setProperty("/titleState", "Error");
                return;
            }

            const oPayload = {
                title: oData.title.trim(),
                description: oData.description.trim(),
                version: oData.version.trim(),
                type: oData.type,
                status: oData.status.trim()
            };

            oDialog.setBusy(true);
            try {
                if (oData.isEdit) {
                    await api.update("InternalApis", oData.ID, oPayload);
                } else {
                    await api.create("InternalApis", oPayload);
                }
                oDialog.close();
                MessageToast.show(this.getText(oData.isEdit ? "apiUpdated" : "apiCreated"));
                this._fnApiDialogDone(true);
            } catch (oError) {
                MessageBox.error(oError.message);
            } finally {
                oDialog.setBusy(false);
            }
        },

        onApiDialogCancel: async function () {
            (await this._getApiDialog()).close();
            this._fnApiDialogDone(false);
        },

        /**
         * Asks for confirmation and deletes an internal API. Resolves with true when deleted.
         * @param {object} oApi
         * @returns {Promise<boolean>}
         */
        confirmDeleteApi: function (oApi) {
            return new Promise(function (resolve) {
                MessageBox.warning(this.getText("apiDeleteConfirm", [oApi.title]), {
                    actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.DELETE,
                    onClose: async function (sAction) {
                        if (sAction !== MessageBox.Action.DELETE) {
                            resolve(false);
                            return;
                        }
                        try {
                            await api.remove("InternalApis", oApi.ID);
                            MessageToast.show(this.getText("apiDeleted"));
                            resolve(true);
                        } catch (oError) {
                            MessageBox.error(oError.message);
                            resolve(false);
                        }
                    }.bind(this)
                });
            }.bind(this));
        },

        _getApiDialog: function () {
            if (!this._pApiDialog) {
                this._pApiDialog = this.loadFragment({ name: "com.app.view.ApiDialog" }).then(function (oDialog) {
                    oDialog.setModel(new JSONModel(), "form");
                    return oDialog;
                });
            }
            return this._pApiDialog;
        }
    });
});
