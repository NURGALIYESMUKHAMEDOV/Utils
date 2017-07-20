define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/store/Memory",
    "gridx/core/model/cache/Sync",
    "gridx/Grid",
    "gridx/modules/select/Row",
    "gridx/modules/CellWidget",
    "dojo/text!./templates/ResolutionsBoxEditor.html",
    "idx/form/_CssStateMixin",
    "idx/form/_CompositeMixin",
    "idx/form/_ValidationMixin",
    "pvr/widget/editors/mixins/_EditorMixin"
], function(
    declare,
    array,
    _WidgetBase,
    _TemplatedMixin,
    Memory,
    Cache,
    Grid,
    SelectRow,
    CellWidget,
    template,
    _CssStateMixin,
    _CompositeMixin,
    _ValidationMixin,
    _EditorMixin
) {

    console.log("инициализация редактора 'Резолюции' ...");

    return declare(
        "docs.resolution.ResolutionsBoxEditor",
        [
            _WidgetBase,
            _TemplatedMixin,
            _CssStateMixin,
            _CompositeMixin,
            _ValidationMixin,
            _EditorMixin
        ],{

            templateString: template,

            // идентификатор входящего документа, относительно которого выбираются резолюции
            value: null,

            // индикатор загрузки данных
            loading: false,

            oneuiBaseClass: "resolutionsBoxEditor",

            postCreate: function() {

                this._event = {
                    "input" : "onChange",
                    "blur" : "_onBlur",
                    "focus" : "_onFocus"
                }

                if (!this.grid) {

                    this._createGrid();

                }

                this.inherited(arguments);

            },

            _createGrid: function() {

                var store = new Memory({
                    idProperty: "id",
                    data: []
                });

                var structure = [
                    {
                        field: 'text',
                        name: 'Резолюция',
                        width: '20em',
                        widgetsInCell: true,

                        decorator: function() {

                            return "<div class='ref' data-dojo-attach-point='resolutionText'></div>";

                        },

                        setCellValue: function(gridData, storeData, cellWidget) {

                            cellWidget.resolutionText.innerHTML = gridData ;

                            var rowIndex = cellWidget.cell.row.index();

                            var object = cellWidget.cell.row.rawData();

                            cellWidget.resolutionText.onclick = dojo.hitch(this, function(evt) {

                                var solution = ecm.model.desktop.currentSolution ;

                                var role = ecm.model.desktop.currentRole ;

                                solution.retrieveCase(object.id, dojo.hitch(this, function(callback){

                                    var caseEditable = callback.createEditable();

                                    var caseType = callback.caseType ;

                                    caseType.retrievePage("CasePage", role, dojo.hitch(this, function(page){

                                        var listener = icm.container.ICMSolutionSelectorListener.getInstance();

                                        var pagesCollection = listener._currentPagesCollection ;

                                        var payload = {
                                            caseEditable: caseEditable,
                                            coordination: new icm.util.Coordination()
                                        }

                                        pagesCollection.handleICM_OpenPageEvent({
                                            pageClassName: page.pageClass,
                                            pageType: "CASE",
                                            isLazy: false,
                                            subject: caseEditable,
                                            pageContext: {
                                                solution: ecm.model.desktop.currentSolution,
                                                role: ecm.model.desktop.currentRole
                                            },
                                            crossPageEventName: "icm.SendCaseInfo",
                                            crossPageEventPayload: payload
                                        });

                                    }));

                                }));

                            });

                        }
                    },{
                        field: 'performer',
                        name: 'Отв. исполнитель',
                        width: '15em'
                    },{
                        field: 'deadline',
                        name: 'Срок',
                        width: '10em'
                    },{
                        field: 'status',
                        name: 'Статус',
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

                this.grid.placeAt(this.resolutionsNode);

                this.grid.startup();

                this.grid.resize();

            },

            _setValueAttr: function(_val) {

                try {

                    if (ecm) {}

                } catch (e) {

                    this.value = _val ;

                    return ;

                }

                if (!this.loading && _val) {

                    if (!this.grid) {

                        this._createGrid();

                    }

                    var grid = this.grid ;

                    var params = {};

                    params.repositoryId = ecm.model.desktop.currentSolution.targetObjectStore.repositoryId ;
                    params.repositoryType = ecm.model.desktop.currentSolution.targetObjectStore.type;
                    params.op = "list" ;
                    params.id = _val ;

                    var self = this ;

                    this.loading = true ;

                    this.value = _val ;

                    ecm.model.Request.invokePluginService("DFSPlugin", "ResolutionService", {
                        requestParams: params,
                        requestCompleteCallback: dojo.hitch(this, function(response) {

                            grid.model.clearCache();

                            grid.model.store.setData(response.data);

                            grid.body.refresh();

                            this.resize();

                            grid.resize();

                            this.loading = false ;

                        })

                    });

                }

            },

            _getValueAttr: function() {

                return this.value ;

            }

        }

    );

});