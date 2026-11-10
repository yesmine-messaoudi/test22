sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function (BaseController, JSONModel, Filter, FilterOperator, Sorter) {
    "use strict";

    // One read-only list page, two flavours:
    // #/apis/standard (SAP APIs) and #/apis/internal (SharePoint documents)
    const KINDS = {
        standard: {
            path: "/StandardAPI", detailKind: "standard", template: "standardItemTemplate",
            // DESCRIPTION is a large text (NCLOB) in HANA, so only the title is searched
            searchFields: ["title"],
            title: "standardApisTitle", subtitle: "standardApisSubtitle", noData: "noStandardApis"
        },
        internal: {
            path: "/InternalApis", detailKind: "internal", template: "internalItemTemplate", isInternal: true,
            searchFields: ["title", "description", "keywords"],
            title: "internalApisTitle", subtitle: "internalApisSubtitle", noData: "noInternalApis"
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
                isInternal: !!oKind.isInternal
            });

            this.byId("searchField").setValue(oQuery.search || "");
            this.byId("typeFilter").setSelectedKey("all");

            this._oTable.bindItems({
                path: oKind.path,
                template: this.byId(oKind.template),
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
            const oKind = KINDS[this._sKind];
            const aFilters = [];
            const sQuery = this.byId("searchField").getValue().trim();
            const sType = this.byId("typeFilter").getSelectedKey();

            if (sQuery) {
                aFilters.push(new Filter({
                    filters: oKind.searchFields.map(function (sPath) {
                        return new Filter({ path: sPath, operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false });
                    }),
                    and: false
                }));
            }
            if (!oKind.isInternal && sType && sType !== "all") {
                aFilters.push(new Filter({ path: "type", operator: FilterOperator.EQ, value1: sType, caseSensitive: false }));
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

        /* ---------- Navigation ---------- */

        onItemPress: function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext();
            this.getRouter().navTo("apiDetail", {
                kind: KINDS[this._sKind].detailKind,
                id: oContext.getProperty("ID")
            });
        }
    });
});
