sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../model/formatter",
    "../model/api"
], function (BaseController, JSONModel, MessageBox, MessageToast, formatter, api) {
    "use strict";

    const LIST_TITLES = {
        standard: "navStandardApis",
        internal: "navInternalApis",
        mine: "navMyApis"
    };

    // Editable fields of methods (REST) and operations (SOAP)
    const ITEM_TYPES = {
        method: {
            entitySet: "Methods",
            table: "methodsTable",
            required: "path",
            fields: ["method", "path", "section", "description"],
            defaults: { method: "GET" }
        },
        operation: {
            entitySet: "Operations",
            table: "operationsTable",
            required: "portType",
            fields: ["portType", "namespace", "port", "location", "protocol", "transportProtocol", "defaultStyle"],
            defaults: {}
        }
    };

    return BaseController.extend("com.app.controller.ApiDetail", {
        onInit: function () {
            this.setModel(new JSONModel({}), "view");
            this.getRouter().getRoute("apiDetail").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const oArgs = oEvent.getParameter("arguments");
            const oAppModel = this.getModel("app");
            this._sKind = oArgs.kind === "standard" ? "standard" : "internal";
            this._sId = oArgs.id;

            // Return to the list the user came from ("My APIs" or "Internal APIs")
            this._sListKind = this._sKind === "standard" ? "standard"
                : (oAppModel.getProperty("/selectedKey") === "mine" ? "mine" : "internal");
            oAppModel.setProperty("/selectedKey", this._sListKind);

            this.getModel("view").setData({
                busy: true,
                isSoap: false,
                canEdit: false,
                isInternal: this._sKind === "internal",
                listTitle: this.getText(LIST_TITLES[this._sListKind])
            });

            const sEntitySet = this._sKind === "standard" ? "StandardAPI" : "InternalApis";
            this.getView().bindElement({ path: "/" + sEntitySet + "(" + this._sId + ")" });
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
                oViewModel.setProperty("/canEdit", this._sKind === "internal" && oApi.createdBy === this.getUserId());
            }.bind(this)).catch(function () {
                MessageBox.error(this.getText("apiNotFound"), { onClose: this.onNavToList.bind(this) });
            }.bind(this)).finally(function () {
                oViewModel.setProperty("/busy", false);
            });
        },

        onNavToList: function () {
            this.getRouter().navTo("apiList", { kind: this._sListKind });
        },

        /* ---------- API actions (owner only) ---------- */

        onEditApi: function () {
            const oApi = this.getView().getBindingContext().getObject();
            this.openApiDialog(oApi).then(function (bSaved) {
                if (bSaved) {
                    this.getView().getElementBinding().refresh();
                    this._loadApi();
                }
            }.bind(this));
        },

        onDeleteApi: function () {
            const oApi = this.getView().getBindingContext().getObject();
            this.confirmDeleteApi(oApi).then(function (bDeleted) {
                if (bDeleted) {
                    this.onNavToList();
                }
            }.bind(this));
        },

        /* ---------- Methods and operations ---------- */

        onAddMethod: function () {
            this._openItemDialog("method", null);
        },

        onEditMethod: function (oEvent) {
            this._openItemDialog("method", oEvent.getSource().getBindingContext().getObject());
        },

        onDeleteMethod: function (oEvent) {
            this._deleteItem("method", oEvent.getSource().getBindingContext().getObject());
        },

        onAddOperation: function () {
            this._openItemDialog("operation", null);
        },

        onEditOperation: function (oEvent) {
            this._openItemDialog("operation", oEvent.getSource().getBindingContext().getObject());
        },

        onDeleteOperation: function (oEvent) {
            this._deleteItem("operation", oEvent.getSource().getBindingContext().getObject());
        },

        onItemRequiredChange: function () {
            this._getItemDialog().then(function (oDialog) {
                oDialog.getModel("item").setProperty("/requiredState", "None");
            });
        },

        onItemDialogSave: async function () {
            const oDialog = await this._getItemDialog();
            const oItemModel = oDialog.getModel("item");
            const oData = oItemModel.getData();
            const oType = ITEM_TYPES[oData.kind];

            if (!(oData[oType.required] || "").trim()) {
                oItemModel.setProperty("/requiredState", "Error");
                return;
            }

            const oPayload = {};
            oType.fields.forEach(function (sField) {
                oPayload[sField] = (oData[sField] || "").trim();
            });

            oDialog.setBusy(true);
            try {
                if (oData.isEdit) {
                    await api.update(oType.entitySet, oData.ID, oPayload);
                } else {
                    oPayload.internalApi_ID = this._sId;
                    await api.create(oType.entitySet, oPayload);
                }
                oDialog.close();
                MessageToast.show(this.getText("itemSaved"));
                this._refreshItems(oData.kind);
            } catch (oError) {
                MessageBox.error(oError.message);
            } finally {
                oDialog.setBusy(false);
            }
        },

        onItemDialogCancel: function () {
            this._getItemDialog().then(function (oDialog) {
                oDialog.close();
            });
        },

        _openItemDialog: function (sKind, oItem) {
            const oType = ITEM_TYPES[sKind];
            const oData = {
                kind: sKind,
                isEdit: !!oItem,
                ID: oItem && oItem.ID,
                requiredState: "None",
                dialogTitle: this.getText((oItem ? "edit_" : "add_") + sKind)
            };
            oType.fields.forEach(function (sField) {
                oData[sField] = (oItem && oItem[sField]) || oType.defaults[sField] || "";
            });

            this._getItemDialog().then(function (oDialog) {
                oDialog.getModel("item").setData(oData);
                oDialog.open();
            });
        },

        _deleteItem: function (sKind, oItem) {
            const oType = ITEM_TYPES[sKind];
            MessageBox.warning(this.getText("itemDeleteConfirm"), {
                actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.DELETE,
                onClose: async function (sAction) {
                    if (sAction !== MessageBox.Action.DELETE) {
                        return;
                    }
                    try {
                        await api.remove(oType.entitySet, oItem.ID);
                        MessageToast.show(this.getText("itemDeleted"));
                        this._refreshItems(sKind);
                    } catch (oError) {
                        MessageBox.error(oError.message);
                    }
                }.bind(this)
            });
        },

        _refreshItems: function (sKind) {
            this.byId(ITEM_TYPES[sKind].table).getBinding("items").refresh();
        },

        _getItemDialog: function () {
            if (!this._pItemDialog) {
                this._pItemDialog = this.loadFragment({ name: "com.app.view.ItemDialog" }).then(function (oDialog) {
                    oDialog.setModel(new JSONModel(), "item");
                    return oDialog;
                });
            }
            return this._pItemDialog;
        }
    });
});
