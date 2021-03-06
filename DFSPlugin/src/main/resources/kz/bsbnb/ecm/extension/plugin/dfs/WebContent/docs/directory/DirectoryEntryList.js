define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dijit/form/Button",
    "dojo/store/Memory",
    "gridx/core/model/cache/Sync",
    "gridx/Grid",
    "gridx/modules/select/Row",
    "ecm/model/Request",
    "ecm/widget/TitlePane",
    "ecm/widget/ValidationTextBox",
    "ecm/widget/DatePicker",
    "ecm/widget/listView/ContentList",
    "ecm/widget/listView/gridModules/RowContextMenu",
    "ecm/model/SearchQuery",
    "ecm/widget/layout/_LaunchBarPane",
    "dojo/text!./templates/DirectoryEntryList.html"
],function(
    declare,
    lang,
    domConstruct,
    BorderContainer,
    ContentPane,
    Button,
    Memory,
    Cache,
    Grid,
    SelectRow,
    Request,
    TitlePane,
    ValidationTextBox,
    DatePicker,
    ContentList,
    RowContextMenu,
    SearchQuery,
    _LaunchBarPane,
    template
) {

    return declare("docs.directory.DirectoryEntryList", [
        _LaunchBarPane
    ], {

        templateString: template,

        widgetsInTemplate: true,

        // таблица
        grid: null,

        startup: function() {

            if (this.grid) {

                this.grid.destroy();

            }

            this._createGrid();

            this.retrieveData({});

        },

        _createGrid: function() {

            var store = new Memory({
                idProperty: "code",
                data: []
            });

            var structure = [
                { field: 'code', name: 'Индекс', width: '10em'},
                { field: 'name', name: 'Заголовок', width: '20em'},
                { field: 'retentionPeriod', name: 'Срок хранения', width: '10em'},
                { field: 'retentionClause', name: 'Статья хранения', width: '10em'}
            ];

            this.grid = new Grid({
                cacheClass: Cache,
                store: store,
                structure: structure,
                modules: [
                    SelectRow
                ],
                selectRowTriggerOnCell: true
            });

            this.grid.connect(this.grid.select.row, "onSelected", dojo.hitch(this, function(evt) {

                dojo.hitch(this, this.onSelect(evt.rawData()));

            }));

            this.grid.placeAt(this.gridNode);

            this.grid.startup();

        },

        retrieveData: function(filters) {

            var grid = this.grid ;

            var params = {};

            params.repositoryId = ecm.model.desktop.currentSolution.targetObjectStore.repositoryId ;
            params.repositoryType = ecm.model.desktop.currentSolution.targetObjectStore.type;
            params.op = "list";

            if (this.filters) {
                params.code = this.filters.code ;
                params.name = this.filters.name ;
            }

            Request.invokePluginService("DFSPlugin", "DirectoryService", {
                requestParams: params,
                requestCompleteCallback: function(response) {

                    var store = new Memory({
                        data: {
                            items: response.data
                        }
                    });

                    grid.model.clearCache();

                    grid.model.store.setData(response.data);

                    grid.body.refresh();

                }

            });

        },

        onSelect: function(data) {

        }

    });

});