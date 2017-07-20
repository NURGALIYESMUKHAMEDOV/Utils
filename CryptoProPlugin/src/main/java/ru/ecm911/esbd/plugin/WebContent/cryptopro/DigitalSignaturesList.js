define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/store/Memory",
    "gridx/core/model/cache/Sync",
    "gridx/Grid",
    "gridx/modules/select/Row",
    "gridx/modules/CellWidget",
    "ecm/model/Request",
    "ecm/widget/listView/gridModules/RowContextMenu",
    "cryptopro/Utils",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/DigitalSignaturesList.html"
],function(
    declare,
    lang,
    Memory,
    Cache,
    Grid,
    SelectRow,
    CellWidget,
    Request,
    RowContextMenu,
    Utils,
    _Widget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template
) {

    return declare("cryptopro.DigitalSignaturesList", [
		_Widget,
		_TemplatedMixin,
		_WidgetsInTemplateMixin
    ], {

        templateString: template,
        widgetsInTemplate: true,
        grid: null,
        item: null,

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

            var self = this ;

            var structure = [
                { field: 'status', name: '#', width: '3em'},
                {
                    field: 'signer',
                    name: 'Сертификат',
                    width: '20em',
                    widgetsInCell: true,

                    decorator: function() {
                        return "<div data-dojo-attach-point='dn' class='DSigCertificate'></div>"
                    },

                    setCellValue: function(gridData, storeData, cellWidget) {

                        var result = /CN=(.*?),{1}?/g.exec(gridData);

                        cellWidget.dn.innerHTML = result && result[1] ? result[1] : "";

                    },

                    getCellWidgetConnects: function(cellWidget, cell){

                        return [
                            [cellWidget.dn, 'onclick', function(e){

                                var data = cell.row.rawData();

                                var url = Request.getServiceRequestUrl("plugin", "", {
                                    plugin: "CryptoProPlugin",
                                    action: "GetSignatureService",
                                    repositoryId: self.item.repository.id,
                                    repositoryType: self.item.repository.type,
                                    id: data.id
                                });

                                url = Request.appendSecurityToken(url);

                                console.log("url : ", url);

                                window.open(url, "_blank");

                            }]
                        ];

                    }

                },{
                    field: 'issuer',
                    name: 'Выпущен',
                    width: '20em',
                    widgetsInCell: true,

                    decorator: function() {
                        return "<div data-dojo-attach-point='dn'></div>"
                    },

                    setCellValue: function(gridData, storeData, cellWidget) {

                        cellWidget.dn.innerHTML = Utils.extractNameFromDn(gridData);

                    }

                },{
                    field: 'validFrom',
                    name: 'Действителен с',
                    width: '10em'
                },{
                    field: 'validTo',
                    name: 'Действителен до',
                    width: '10em'
                },{
                    field: 'date',
                    name: 'Дата подписания',
                    width: '10em'
                }
            ];

            this.grid = new Grid({
                cacheClass: Cache,
                store: store,
                structure: structure,
                autoHeight: true,
                modules: [
                    SelectRow,
                    CellWidget
                ],
                selectRowTriggerOnCell: true
            });

            this.grid.connect(this.grid.select.row, "onSelected", dojo.hitch(this, function(evt) {

                dojo.hitch(this, this.onSelect(evt.rawData()));

            }));

            this.grid.placeAt(this.gridNode);

            this.grid.startup();

            this.grid.resize();

        },

        retrieveData: function() {

            var grid = this.grid ;

            var params = {};

            params.repositoryId = this.item.repository.id ;
            params.repositoryType = this.item.repository.type;
            params.id = this.item.docid ;

            Request.invokePluginService("CryptoProPlugin", "ListDigitalSignaturesService", {
                requestParams: params,
                requestCompleteCallback: function(response) {

                    console.log(response);

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

        setItem: function(item) {

            this.item = item ;

            this.retrieveData();

        },

        onSelect: function(data) {

        }

    });

});