/**
 * Компонент реализует функцию работы
 * со списком страховых компаний, включая
 * функции поиска и выбора компании
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
    "esbd/company/CompanyListSearchPane",
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
    CompanyListSearchPane,
    ContentList,
    RowContextMenu,
    SearchQuery
) {

    return declare("esbd.company.CompanyList", [
        BorderContainer
    ], {

        postCreate: function() {

            this.inherited(arguments);

            var searchPaneRegion = new ContentPane({
                region: "top",
            });

            var searchPane = new CompanyListSearchPane({
                onSearch: dojo.hitch(this, function(payload) {
                    this._onSearch(payload);
                })
            });

            searchPaneRegion.addChild(searchPane);

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

            this.searchForm.onReset();

            this.contentList.reset();

        },

        _onSearch: function(payload) {

            var repository = ecm.model.desktop.repositories[0];

            if (repository.connected) {

                var expressions = [];

                if (payload.name) {

                    expressions.push("[ESBD_CompanyName] LIKE '%" + this._escape(payload.name) + "%'");

                }

                var query = "SELECT [This], [DocumentTitle], [ESBD_CompanyName], [ESBD_CompanyCode], [Id], [ClassDescription], [ReservationType], [Reservation], [IsReserved], [IsCurrentVersion] FROM [ESBD_Company] WHERE [IsCurrentVersion] = TRUE" ;

                for (var i = 0; i < expressions.length; i++) {

                    query = query + " AND " + expressions[i];

                }

                var searchQuery = new SearchQuery({
                    query : query,
                    resultsDisplay: {
                        columns: ["ESBD_CompanyName", "ESBD_CompanyCode"]
                    },
                    repository: repository
                });

                searchQuery.search(dojo.hitch(this, function(resultSet){

                    var cells = [
                        {
                            width: "40em",
                            sortable: false,
                            field: "ESBD_CompanyName",
                            name: "Наименование"
                        },
                        {
                            width: "8em",
                            sortable: false,
                            field: "ESBD_CompanyCode",
                            name: "Код"
                        }
                    ];

                    var columns = {
                        cells: [cells]
                    };

                    resultSet.setColumns(columns);

                    this.contentList.setResultSet(resultSet);

                }), "{NAME}", true, null, dojo.hitch(this, function(response){



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