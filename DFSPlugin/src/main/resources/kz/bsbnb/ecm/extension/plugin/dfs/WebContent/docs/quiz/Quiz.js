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
    "gridx/modules/CellWidget",
    "gridx/modules/ColumnResizer",
    "ecm/model/Request",
    "ecm/widget/TitlePane",
    "ecm/widget/ValidationTextBox",
    "ecm/widget/DatePicker",
    "ecm/widget/listView/ContentList",
    "ecm/widget/listView/gridModules/RowContextMenu",
    "ecm/model/SearchQuery",
    "ecm/widget/layout/_LaunchBarPane",
    "dojo/text!./templates/Quiz.html"
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
    CellWidget,
    ColumnResizer,
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

    return declare("docs.quiz.Quiz", [
        _LaunchBarPane
    ], {

        templateString: template,
        widgetsInTemplate: true,
        grid: null,

        startup: function() {

            if (this.grid) {

                this.grid.destroy();

            }

            var store = new Memory({
                idProperty: "id",
                data: [
                    {id: "1", index: null, subIndex: null, name: "Организация охраны", result: null, comment: null},
                    {id: "1.4", index: "4", subIndex: null, name: "Помещения банков второго уровня (включая филиалы и их дополнительные помещения) должны охранятся вооруженной охраной и оборудоваться специальным техническими средствами охраны", result: "Нет", comment: null},
                    {id: "1.9", index: "9", subIndex: null, name: "Коммисионное обследование принимаемого под охрану помещения проводится с участием представителей специализированного охранного подразделения органов внутренних дел Республики Казахстан, частной охранной организации, пункта централизованной охраны и банка, организации, которые будут использовать принимаемое под охрану помещение", result: null, comment: null},
                    {id: "2", index: null, subIndex: null, name: "Устройство помещений, предназначенных для проведения кассовых операций", result: null, comment: null},
                    {id: "2.29", index: "29", subIndex: "1", name: "Помещение где размещаются операционные кассы, должно быть изолированным, иметь отдельный вход с закрывающейся на замок дверью", result: null, comment: null}
                ]
            });

            var structure = [
                { field: 'index', name: '№ п.', width: '3em'},
                { field: 'subIndex', name: '№ п.п.', width: '3em'},
                {
                    field: 'name',

                    name: 'Предъявляемые требования',

                    width: '30em',

                    widgetsInCell: true,

                    decorator: function() {
                        return "<div data-dojo-attach-point='nameNode'></div>";
                    },

                    setCellValue: function(gridData, storeData, cellWidget) {

                        var data = cellWidget.cell.row.rawData();

                        cellWidget.nameNode.innerHTML = gridData;

                        if (!data.index) {

                            cellWidget.nameNode.style.fontWeight = "bold";

                        }

                    }

                },
                {
                    field: 'result',

                    name: 'Соответствие',

                    width: '10em',

                    widgetsInCell: true,

                    decorator: function() {
                        return "<select data-dojo-type='dijit/form/Select' data-dojo-attach-point='resultNode'><option value='Да'>Да</option><option value='Нет'>Нет</option><option value='-'>-</option></select>";
                    },

                    setCellValue: function(gridData, storeData, cellWidget) {

                        console.log("set cell value for select, widget: ", cellWidget);

                        var data = cellWidget.cell.row.rawData();

                        if (data.index) {

                            cellWidget.resultNode.set("value", gridData);

                            cellWidget.resultNode.set("style", "visibility: visible") ;

                        } else {

                            cellWidget.resultNode.set("style", "visibility: hidden") ;

                        }

                    }

                },
                { field: 'comment', name: 'Комментарий', width: '20em'}
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

        }

    });

});