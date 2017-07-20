/**
 * Компонент реализует функцию работы
 * со списком физических лиц, включая
 * функции поиска и выбора физического лица
 * из списка
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/date/locale",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "esbd/person/PersonListSearchPane",
    "ecm/widget/listView/ContentList",
    "ecm/widget/listView/gridModules/RowContextMenu",
    "ecm/model/SearchQuery",
    "esbd/Utils"
],function(
    declare,
    lang,
    locale,
    ContentPane,
    BorderContainer,
    PersonListSearchPane,
    ContentList,
    RowContextMenu,
    SearchQuery,
    Utils
) {

    return declare("esbd.person.PersonList", [
        BorderContainer
    ], {

        postCreate: function() {

            this.inherited(arguments);

            var searchPaneRegion = new ContentPane({
                region: "top",
            });

            this.searchPane = new PersonListSearchPane({
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

                if (payload.IIN) {

                    expressions.push("[ESBD_IIN] LIKE '%" + this._escape(payload.IIN) + "%'");

                }

                if (payload.lastName) {

                    expressions.push("UPPER([ESBD_LastName]) LIKE UPPER('%" + this._escape(payload.lastName) + "%')");

                }

                if (payload.firstName) {

                    expressions.push("UPPER([ESBD_FirstName]) LIKE UPPER('%" + this._escape(payload.firstName) + "%')");

                }

                if (payload.birthday) {

                    var startDate = payload.birthday;

                    var endDate = dojo.date.add(startDate, "day", 1);

                    expressions.push("[ESBD_Birthday] >= " + Utils.formatDateToQuery(startDate) + " AND [ESBD_Birthday] < " + Utils.formatDateToQuery(endDate));

                }

                var query = "SELECT [This], [DocumentTitle], [ESBD_LastName], [ESBD_FirstName], [ESBD_MiddleName], [ESBD_IIN], [ESBD_Birthday], [Id], [ClassDescription], [ReservationType], [Reservation], [IsReserved], [IsCurrentVersion] FROM [ESBD_Person] WHERE [IsCurrentVersion] = TRUE" ;

                for (var i = 0; i < expressions.length; i++) {

                    query = query + " AND " + expressions[i];

                }

                console.log("[PersonList] query: ", query);

                var searchQuery = new SearchQuery({
                    query : query,
                    resultsDisplay: {
                        sortBy: '{NAME}',
                        sortAsc: true,
                        columns: ["{NAME}", "ESBD_LastName", "ESBD_FirstName", "ESBD_MiddleName", "ESBD_IIN", "ESBD_Birthday"],
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
                            field: "ESBD_LastName",
                            name: "Фамилия"
                        },
                        {
                            width: "8em",
                            sortable: false,
                            field: "ESBD_FirstName",
                            name: "Имя"
                        },
                        {
                            width: "8em",
                            sortable: false,
                            field: "ESBD_MiddleName",
                            name: "Отчество"
                        },
                        {
                            width: "8em",
                            sortable: false,
                            field: "ESBD_IIN",
                            name: "ИИН"
                        },
                        {
                            width: "8em",
                            sortable: false,
                            field: "ESBD_Birthday",
                            name: "День рождения"
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