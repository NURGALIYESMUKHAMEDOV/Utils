/**
 * Компонент реализует функцию работы
 * со транспортных средств, включая
 * функции поиска и выбора ТС
 * из списка
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/layout/_LayoutWidget",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "esbd/vehicle/VehicleListSearchPane",
    "ecm/widget/listView/ContentList",
    "ecm/widget/listView/gridModules/RowContextMenu",
    "ecm/model/SearchQuery",
    "esbd/Utils"
],function(
    declare,
    lang,
    _LayoutWidget,
    ContentPane,
    BorderContainer,
    VehicleListSearchPane,
    ContentList,
    RowContextMenu,
    SearchQuery,
    Utils
) {

    return declare("esbd.vehicle.VehicleList", [
        BorderContainer
    ], {

        postCreate: function() {

            this.inherited(arguments);

            var searchPaneRegion = new ContentPane({
                region: "top",
            });

            this.searchPane = new VehicleListSearchPane({
                onSearch: dojo.hitch(this, function(payload) {
                    this._onSearch(payload);
                })
            });

            searchPaneRegion.addChild(this.searchPane);

            var searchResults = new ContentPane({
                region: "center"
            });

            this.contentList = this._createContentList();

            searchResults.addChild(this.contentList);

            this.addChild(searchPaneRegion);

            this.addChild(searchResults);

        },

        _createContentList: function() {

            var contentList = new ContentList({
                multiSelect: false,
                onRowSelectionChange: dojo.hitch(this, function(selectedItems) {

                    this.onSelectionChange(selectedItems);

                })
            });

            contentList.onRowDblClick = dojo.hitch(this, function(item, evt){

                var selectedItems = this.contentList.getSelectedItems();

                if (selectedItems != null && selectedItems.length > 0) {

                    var selectedItem = selectedItems[0];

                    this.onSelect(selectedItem);

                }

            });

            return contentList ;

        },

        _onSearch: function(payload) {

            var repository = ecm.model.desktop.repositories[0];

            if (repository.connected) {

                var expressions = [];

                if (payload.VIN) {

                    expressions.push("[ESBD_VIN] LIKE '%" + Utils.escape(payload.VIN) + "%'");

                }

                var query = "SELECT [This], [DocumentTitle], [ESBD_VehicleBrand], [ESBD_VehicleModel], [ESBD_VehicleIssueYear], [ESBD_VehicleType], [ESBD_VIN], [ESBD_VehicleEngineNumber], [ESBD_VehicleEngineCapacity], [ESBD_VehicleEnginePower], [ESBD_VehicleColor], [Id], [ClassDescription], [ReservationType], [Reservation], [IsReserved], [IsCurrentVersion] FROM [ESBD_Vehicle] WHERE [IsCurrentVersion] = TRUE" ;

                for (var i = 0; i < expressions.length; i++) {

                    query = query + " AND " + expressions[i];

                }

                console.log("[VehicleList] query: ", query);

                var searchQuery = new SearchQuery({
                    query : query,
                    resultsDisplay: {
                        sortBy: '{NAME}',
                        sortAsc: true,
                        columns: ["{NAME}", "ESBD_VehicleBrand", "ESBD_VehicleModel", "ESBD_VehicleIssueYear", "ESBD_VehicleType", "ESBD_VIN", "ESBD_VehicleEngineNumber", "ESBD_VehicleEngineCapacity", "ESBD_VehicleEnginePower", "ESBD_VehicleColor"],
                        honorNameProperty: true,
                        showContentSummary: false,
                        saved: false
                    },
                    retrieveLatestVersion: false,
                    retrieveAllVersions: false,
                    repository: repository
                });

                searchQuery.search(lang.hitch(this, function(resultSet){

                    var cells = [
                        {
                            width: "10em",
                            sortable: false,
                            field: "ESBD_VehicleBrand",
                            name: "Марка"
                        },
                        {
                            width: "10em",
                            sortable: false,
                            field: "ESBD_VehicleModel",
                            name: "Модель"
                        },
                        {
                            width: "7em",
                            sortable: false,
                            field: "ESBD_VehicleIssueYear",
                            name: "Год выпуска"
                        },
                        {
                            width: "14em",
                            sortable: false,
                            field: "ESBD_VIN",
                            name: "VIN"
                        },
                        {
                            width: "14em",
                            sortable: false,
                            field: "ESBD_VehicleEngineNumber",
                            name: "Номер двигателя"
                        },
                        {
                            width: "10em",
                            sortable: false,
                            field: "ESBD_VehicleEngineCapacity",
                            name: "Объем"
                        },
                        {
                            width: "10em",
                            sortable: false,
                            field: "ESBD_VehicleEnginePower",
                            name: "Мощность"
                        },
                        {
                            width: "10em",
                            sortable: false,
                            field: "ESBD_VehicleColor",
                            name: "Цвет"
                        }
                    ];

                    var columns = {
                        cells: [cells]
                    };

                    resultSet.setColumns(columns);

                    this.contentList.setResultSet(resultSet);

                }));

            }

        },

        getSelectedItems: function() {

            return this.contentList.getSelectedItems();

        },

        onSelectionChange: function(selectedItems) {
        },

        onSelect: function(item) {
        }

    });

});