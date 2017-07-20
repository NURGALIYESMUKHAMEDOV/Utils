/**
 * Компонент обеспечивает поиск и выбор
 * клиента (физического лица)
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/date/locale",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "esbd/contract/insurance/InsuranceListSearchPane",
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
    InsuranceListSearchPane,
    ContentList,
    RowContextMenu,
    SearchQuery,
    Utils
) {

    return declare("esbd.contract.insurance.InsuranceList", [
        BorderContainer
    ], {

        company: null,
        filters: null,

        postCreate: function() {

            this.inherited(arguments);

            var searchPaneRegion = new ContentPane({
                region: "top",
            });

            this.searchPane = new InsuranceListSearchPane({
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

            this.watch("company", dojo.hitch(this, function(name, oldValue, value){

                var company = this.get("company");

                this._onSearch(this.filters);

            }));

        },

        _createContentList: function() {

            var contentList = new ContentList({
                multiSelect: false,
                onRowSelectionChange: dojo.hitch(this, function(selectedItems) {

                    this.onSelectionChange(selectedItems);

                })
            });

            contentList.set("onRowDblClick", dojo.hitch(this, function(item, evt){

                var selectedItems = this.contentList.getSelectedItems();

                if (selectedItems != null && selectedItems.length > 0) {

                    var selectedItem = selectedItems[0];

                    this.onSelect(selectedItem);

                }

            }));

            return contentList ;

        },

        reset: function() {

            this.searchPane.onReset();

            this.contentList.reset();

        },

        _onSearch: function(payload) {

            this.filters = payload ;

            var repository = ecm.model.desktop.repositories[0];

            var expressions = [];

            if (this.company) {

                expressions.push("[This] INSUBFOLDER " + this.company.getValue("Id") + "");

            }

            if (payload) {

                if (payload.insuranceNumber) {

                    expressions.push("[ESBD_InsuranceCertificateNumber] LIKE '%" + this._escape(payload.insuranceNumber) + "%'");

                }

                if (payload.submitDateFrom) {

                    expressions.push("[ESBD_SubmitDate] >= " + Utils.formatDateToQuery(payload.submitDateFrom) + "");

                }

                if (payload.submitDateTo) {

                    var source = payload.submitDateTo;

                    var date = dojo.date.add(source, "day", 1);

                    console.log("source: ", source, ", date: ", date);

                    expressions.push("[ESBD_SubmitDate] < " + Utils.formatDateToQuery(date) + "");

                }

            }

            var query = "SELECT [This], [DocumentTitle], [ESBD_DocumentNumber], [ESBD_InsuranceCertificateNumber], [ESBD_Branch], [ESBD_SubmitDate], [ESBD_StartDate], [ESBD_EndDate], [ESBD_Status], [Id], [ClassDescription], [ReservationType], [Reservation], [IsReserved], [IsCurrentVersion] FROM [ESBD_InsuranceContract] WHERE [IsCurrentVersion] = TRUE" ;

            for (var i = 0; i < expressions.length; i++) {

                query = query + " AND " + expressions[i];

            }

            console.log("query: ", query);

            var searchQuery = new SearchQuery({
                query : query,
                resultsDisplay: {
                    columns: ["{NAME}", "ESBD_DocumentNumber", "ESBD_InsuranceCertificateNumber", "ESBD_Branch", "ESBD_SubmitDate", "ESBD_StartDate", "ESBD_EndDate", "ESBD_Status"]
                },
                repository: repository
            });

            searchQuery.search(dojo.hitch(this, function(resultSet){

                var cells = [
                    {
                        width: "10em",
                        sortable: false,
                        field: "ESBD_DocumentNumber",
                        name: "Номер"
                    },
                    {
                        width: "10em",
                        sortable: false,
                        field: "ESBD_InsuranceCertificateNumber",
                        name: "Номер полиса"
                    },
                    {
                        width: "10em",
                        sortable: false,
                        field: "ESBD_Status",
                        name: "Статус"
                    },
                    {
                        width: "10em",
                        sortable: false,
                        field: "ESBD_Branch",
                        name: "Филиал"
                    },
                    {
                        width: "10em",
                        sortable: false,
                        field: "ESBD_SubmitDate",
                        name: "Дата заключения"
                    },
                    {
                        width: "10em",
                        sortable: false,
                        field: "ESBD_StartDate",
                        name: "Начало"
                    },
                    {
                        width: "10em",
                        sortable: false,
                        field: "ESBD_EndDate",
                        name: "Окончание"
                    }

                ];

                var columns = {
                    cells: [cells]
                };

                resultSet.setColumns(columns);

                this.contentList.setResultSet(resultSet, searchQuery);

            }));

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