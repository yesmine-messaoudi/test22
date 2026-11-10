sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function (BaseController, JSONModel, Filter, FilterOperator, Sorter) {
    "use strict";

    // One list page, three flavours: #/apis/standard, #/apis/internal, #/apis/mine
    const KINDS = {
        standard: {
            path: "/StandardAPI", detailKind: "standard",
            title: "standardApisTitle", subtitle: "standardApisSubtitle", noData: "noStandardApis"
        },
        internal: {
            path: "/InternalApis", detailKind: "internal", showOwner: true,
            title: "internalApisTitle", subtitle: "internalApisSubtitle", noData: "noInternalApis"
        },
        mine: {
            path: "/InternalApis", detailKind: "internal", isMine: true,
            title: "myApisTitle", subtitle: "myApisSubtitle", noData: "noMyApis"
        }
    };

    return BaseController.extend("com.app.controller.ApiList", {
        onInit: function () {
            this._oTable = this.byId("apiTable");
            this.setModel(new JSONModel({}), "view");
            this.getRouter().getRoute("apiList").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const oArgs = oEvent.getParameter("arguments");
            const oQuery = oArgs["?query"] || {};
            this._sKind = KINDS[oArgs.kind] ? oArgs.kind : "standard";
            const oKind = KINDS[this._sKind];

            this.getModel("view").setData({
                title: this.getText(oKind.title),
                subtitle: this.getText(oKind.subtitle),
                noDataText: this.getText(oKind.noData),
                tableTitle: this.getText("tableTitleNoCount"),
                isMine: !!oKind.isMine,
                showOwner: !!oKind.showOwner
            });

            this.byId("searchField").setValue(oQuery.search || "");
            this.byId("typeFilter").setSelectedKey("all");

            this._oTable.bindItems({
                path: oKind.path,
                template: this.byId("apiItemTemplate"),
                templateShareable: true,
                parameters: { $count: true },
                sorter: new Sorter("title"),
                filters: this._getFilters(),
                events: {
                    dataReceived: this._updateCount.bind(this)
                }
            });
        },

        /* ---------- Search and filter ---------- */

        onSearch: function () {
            this._applyFilters();
        },

        onSearchLiveChange: function () {
            clearTimeout(this._iSearchTimer);
            this._iSearchTimer = setTimeout(this._applyFilters.bind(this), 300);
        },

        onTypeChange: function () {
            this._applyFilters();
        },

        _getFilters: function () {
            const aFilters = [];
            const sQuery = this.byId("searchField").getValue().trim();
            const sType = this.byId("typeFilter").getSelectedKey();

            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter({ path: "title", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                        new Filter({ path: "description", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false })
                    ],
                    and: false
                }));
            }
            if (sType && sType !== "all") {
                aFilters.push(new Filter({ path: "type", operator: FilterOperator.EQ, value1: sType, caseSensitive: false }));
            }
            if (KINDS[this._sKind].isMine) {
                aFilters.push(new Filter("createdBy", FilterOperator.EQ, this.getUserId()));
            }
            return aFilters;
        },

        _applyFilters: function () {
            const oBinding = this._oTable.getBinding("items");
            if (oBinding) {
                oBinding.filter(this._getFilters());
            }
        },

        _updateCount: function () {
            const oBinding = this._oTable.getBinding("items");
            const iCount = oBinding ? oBinding.getHeaderContext().getProperty("$count") : 0;
            this.getModel("view").setProperty("/tableTitle", this.getText("tableTitle", [iCount || 0]));
        },

        _refresh: function () {
            this._oTable.getBinding("items").refresh();
        },

        /* ---------- Actions ---------- */

        onItemPress: function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext();
            this.getRouter().navTo("apiDetail", {
                kind: KINDS[this._sKind].detailKind,
                id: oContext.getProperty("ID")
            });
        },

        onCreate: function () {
            this.openApiDialog(null).then(function (bSaved) {
                if (bSaved) {
                    this._refresh();
                }
            }.bind(this));
        },

        onEdit: function (oEvent) {
            const oApi = oEvent.getSource().getBindingContext().getObject();
            this.openApiDialog(oApi).then(function (bSaved) {
                if (bSaved) {
                    this._refresh();
                }
            }.bind(this));
        },

        onDelete: function (oEvent) {
            const oApi = oEvent.getSource().getBindingContext().getObject();
            this.confirmDeleteApi(oApi).then(function (bDeleted) {
                if (bDeleted) {
                    this._refresh();
                }
            }.bind(this));
        }
    });
});
