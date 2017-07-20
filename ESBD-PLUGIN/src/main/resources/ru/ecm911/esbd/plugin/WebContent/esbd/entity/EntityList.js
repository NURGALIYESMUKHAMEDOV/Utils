/**
 * Компонент реализует функцию работы
 * со списком юридических лиц, включая
 * функции поиска и выбора юридического лица
 * из списка
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/layout/_LayoutWidget",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dijit/form/Button",
    "ecm/widget/TitlePane",
    "ecm/widget/ValidationTextBox",
    "ecm/widget/DatePicker",
    "esbd/entity/EntityListSearchPane",
    "ecm/widget/listView/ContentList",
    "ecm/widget/listView/gridModules/RowContextMenu",
    "ecm/model/SearchQuery"
],function(
    declare,
    lang,
    _LayoutWidget,
    ContentPane,
    BorderContainer,
    Button,
    TitlePane,
    ValidationTextBox,
    DatePicker,
    EntityListSearchPane,
    ContentList,
    RowContextMenu,
    SearchQuery
) {

    return declare("esbd.entity.EntityList", [
        BorderContainer
    ], {

        postCreate: function() {

            this.inherited(arguments);

            var searchPaneRegion = new ContentPane({
                region: "top",
            });

            this.searchPane = new EntityListSearchPane({
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

        reset: function() {

            this.searchPane.onReset();

            this.contentList.reset();

        },

        _onSearch: function(payload) {

            var repository = ecm.model.desktop.repositories[0];

            if (repository.connected) {

                var expressions = [];

                if (payload.BIN) {

                    expressions.push("[ESBD_BIN] LIKE '%" + this._escape(payload.BIN) + "%'");

                }

                if (payload.name) {

                    expressions.push("[ESBD_Name] LIKE '%" + this._escape(payload.name) + "%'");

                }

                var query = "SELECT [This], [DocumentTitle], [ESBD_Name], [ESBD_BIN], [ESBD_Head], [ESBD_Industry], [ESBD_BusinessType], [Id], [ClassDescription], [ReservationType], [Reservation], [IsReserved], [IsCurrentVersion] FROM [ESBD_Entity] WHERE [IsCurrentVersion] = TRUE" ;

                for (var i = 0; i < expressions.length; i++) {

                    query = query + " AND " + expressions[i];

                }

                var searchQuery = new SearchQuery({
                    query : query,
                    resultsDisplay: {
                        sortBy: "{NAME}",
                        sortAsc: true,
                        columns: ["{NAME}", "ESBD_Name", "ESBD_BIN", "ESBD_Head", "ESBD_Industry", "ESBD_BusinessType"],
                        honorNameProperty: true,
                        showContentSummary: false,
                        saved: false
                    },
                    retrieveLatestVersion: false,
                    retrieveAllVersions: false,
                    repository: repository
                });

                searchQuery.search(dojo.hitch(this, function(resultSet){

                    var cells = [
                        {
                            width: "16em",
                            sortable: false,
                            field: "ESBD_Name",
                            name: "Наименование"
                        },
                        {
                            width: "8em",
                            sortable: false,
                            field: "ESBD_BIN",
                            name: "БИН"
                        },
                        {
                            width: "16em",
                            sortable: false,
                            field: "ESBD_Head",
                            name: "Руководитель"
                        },
                        {
                            width: "12em",
                            sortable: false,
                            field: "ESBD_Industry",
                            name: "Сектор экономики"
                        }
                    ];

                    var columns = {
                        cells: [cells]
                    };

                    resultSet.setColumns(columns);

                    this.contentList.setResultSet(resultSet);

                }), "ESBD_Name", true, null, dojo.hitch(this, function(response){



                }));

            }

        },

        _replaceAll: function(string, find, replace) {

            return string.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);

        },

        _escape: function(string) {

            var result = this._replaceAll(string, "\\", "\\\\");

            result = this._replaceAll(result, "\"", "\\\"");

            result = this._replaceAll(result, "%", "\\%");

            result = this._replaceAll(result, "_", "\\_");

            return result ;

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