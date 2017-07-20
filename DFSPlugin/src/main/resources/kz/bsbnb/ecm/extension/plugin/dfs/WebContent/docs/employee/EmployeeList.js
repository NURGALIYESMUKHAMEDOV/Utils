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
    "dojo/text!./templates/EmployeeList.html"
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

    return declare("docs.employee.EmployeeList", [
        _LaunchBarPane
    ], {

        templateString: template,
        widgetsInTemplate: true,
        grid: null,
        filters: null,

        repository: null,

        _getRepository: function(){

            if(ecm.model.desktop && ecm.model.desktop.currentSolution)
                this.repository = ecm.model.desktop.currentSolution.targetObjectStore;
            else if(this.property && this.property.controller)
                this.repository = this.property.controller.model.repository;
            else
                this.repository = ecm.model.desktop.repositories[0];

            return this.repository;

        },

        startup: function() {

            if (this.grid) {

                this.grid.destroy();

            }

            this._createGrid();

        },

        _createGrid: function() {

            var store = new Memory({
                idProperty: "id",
                data: []
            });

            var structure = [
                { field: 'code', name: '#', width: '3em'},
                { field: 'name', name: 'Сотрудник', width: '20em'},
                { field: 'position', name: 'Должность', width: '20em'},
                { field: 'division', name: 'Стр подразделение', width: '20em'},
            ];

            this.grid = new Grid({
                cacheClass: Cache,
                store: store,
                structure: structure,
                autoHeight: true,
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

            params.repositoryId = this._getRepository().repositoryId ;
            params.repositoryType = this._getRepository().type;
            params.op = "list" ;

            if (filters) {

                params.code = filters.code ;
                params.name = filters.name ;
                params.position = filters.position ;
                params.divisionId = filters.divisionId ;
                params.division = filters.division ;

            }

            Request.invokePluginService("DFSPlugin", "EmployeeService", {
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

                    grid.resize();

                }

            });

        },

        onSelect: function(data) {

        }

    });

});