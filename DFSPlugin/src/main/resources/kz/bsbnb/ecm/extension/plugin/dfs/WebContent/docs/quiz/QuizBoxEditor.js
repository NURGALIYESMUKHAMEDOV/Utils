define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/store/Memory",
    "gridx/core/model/cache/Sync",
    "gridx/Grid",
    "gridx/modules/select/Row",
    "gridx/modules/CellWidget",
    "gridx/modules/ColumnResizer",
    "dijit/form/Select",
    "dojo/text!./templates/QuizBoxEditor.html",
    "idx/form/_CssStateMixin",
    "idx/form/_CompositeMixin",
    "idx/form/_ValidationMixin",
    "pvr/widget/editors/mixins/_EditorMixin"
], function(
    declare,
    _WidgetBase,
    _TemplatedMixin,
    Memory,
    Cache,
    Grid,
    SelectRow,
    CellWidget,
    ColumnResizer,
    Select,
    template,
    _CssStateMixin,
    _CompositeMixin,
    _ValidationMixin,
    _EditorMixin
) {

    return declare(
        "docs.quiz.QuizBoxEditor",
        [
            _WidgetBase,
            _TemplatedMixin,
            _CssStateMixin,
            _CompositeMixin,
            _ValidationMixin,
            _EditorMixin
        ],{

            templateString: template,
            dialog: null,
            grid: null,

            _onQuiz: function(evt) {

                console.log("_onQuiz, evt: ", evt);

                require(["docs/quiz/QuizDialog"], dojo.hitch(this, function(QuizDialog){

                    if (!this.dialog) {

                        this.dialog = new QuizDialog();

                    }

                    this.dialog.show();

                }));

            },

            oneuiBaseClass: "quizBoxEditor",

            postCreate: function() {

                this._event = {
                    "input" : "onChange",
                    "blur" : "_onBlur",
                    "focus" : "_onFocus"
                }

                if (this.grid) {

                    this.grid.destroy();

                }

                // инициализируем хранилище
                var store = new Memory({
                    idProperty: "id",
                    data: []
                });

                var self = this;

                // инициализируем структуру
                var structure = [
                    {
                        field: 'index',
                        name: '№ п.',
                        width: '3em'
                    },{
                        field: 'subIndex',
                        name: '№ п.п.',
                        width: '3em'
                    },{
                        field: 'name',
                        name: 'Предъявляемые требования',
                        width: '30em',
                        widgetsInCell: true,
                        decorator: function() {
                            return "<div data-dojo-attach-point='nameNode' style='width: 100%;'></div>";
                        },
                        setCellValue: function(gridData, storeData, cellWidget) {

                            var data = cellWidget.cell.row.rawData();

                            cellWidget.nameNode.innerHTML = gridData;

                            if (!data.index) {

                                cellWidget.nameNode.style.fontWeight = "bold";

                            } else {

                                cellWidget.nameNode.style.fontWeight = "normal";

                            }

                        }
                    },{
                        field: 'result',
                        name: 'Соответствие',
                        width: '10em',
                        widgetsInCell: true,
                        decorator: function() {
                            return "<select data-dojo-type='dijit/form/FilteringSelect' data-dojo-attach-point='resultNode'><option value='Да'>Да</option><option value='Нет'>Нет</option><option value='-'>-</option></select>";
                        },
                        setCellValue: function(gridData, storeData, cellWidget) {

                            var data = cellWidget.cell.row.rawData();

                            var rowIndex = cellWidget.cell.row.rowIndex;

                            if (data.index) {

                                cellWidget.resultNode.attr("value", gridData);

                                cellWidget.resultNode.set("style", "visibility: visible; width: 100% !important") ;

                            } else {

                                cellWidget.resultNode.attr("value", "-");

                                cellWidget.resultNode.set("style", "visibility: hidden; width: 100% !important") ;

                            }

                        },
                        getCellWidgetConnects: function(cellWidget, cell) {

                            return [
                                [cellWidget.resultNode, "onChange", function(evt){

                                    console.log("change value to - ", cellWidget.resultNode.value + ", index - ", cellWidget.cell.row.index());

                                    var data = cellWidget.cell.row.rawData();

                                    // console.log("cellWidget: ", cellWidget);

                                    data.result = cellWidget.resultNode.value ;

                                    // console.log("grid: ", self.grid);

                                    var result = dojo.toJson(self.grid.store.data);

                                    // console.log("result: ", result);

                                    self.property.controller.set("value", result);

                                }]
                            ];

                        }

                    },{
                        field: 'comment',
                        name: 'Комментарий',
                        width: '20em'
                    }
                ];

                this.grid = new Grid({
                    cacheClass: Cache,
                    store: store,
                    structure: structure,
                    modules: [
                        SelectRow,
                        CellWidget,
                        ColumnResizer
                    ],
                    selectRowTriggerOnCell: true
                });

                this.grid.placeAt(this.quizNode);

                this.grid.startup();

                this.grid.resize();

                this.inherited(arguments);

            },

            _setValueAttr: function(_val) {

                if (_val) {

                    console.log("set value attr (length): ", _val.length, ", property", this.property);

                } else {

                    console.log("set value attr null");

                }

                if (_val) {

                    var items = (new Function('return ' + _val))();

                    var store = new Memory({
                        data: {
                            items: items
                        }
                    });

                    this.grid.model.clearCache();

                    this.grid.model.store.setData(items);

                    this.grid.body.refresh();

                } else {

                    var store = new Memory({
                        data: {
                            items: []
                        }
                    });

                    this.grid.model.clearCache();

                    this.grid.model.store.setData([]);

                    this.grid.body.refresh();

                }

            },

            _getValueAttr: function() {

                console.log("get value attr, data: ", this.grid.store.data);

                var result = dojo.toJson(this.grid.store.data);

                return result ;

            }

        }

    );

});