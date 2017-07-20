define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/store/Memory",
    "gridx/core/model/cache/Sync",
    "gridx/Grid",
    "gridx/modules/select/Row",
    "dojo/text!./templates/DocumentsBoxEditor.html",
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
    template,
    _CssStateMixin,
    _CompositeMixin,
    _ValidationMixin,
    _EditorMixin
) {

    console.log("инициализация редактора 'Документы' ...");

    return declare(
        "docs.document.DocumentsBoxEditor",
        [
            _WidgetBase,
            _TemplatedMixin,
            _CssStateMixin,
            _CompositeMixin,
            _ValidationMixin,
            _EditorMixin
        ],{

            templateString: template,

            // документы
            value: [],

            // типы документов, которые должны быть предоставлены
            documentTypes: null,

            // добавляет сотрудника в список
            _onAdd: function(evt) {

                if (!this.readOnly) {

                    /*

                    var property = this.property ;

                    var handler = dojo.hitch(this, function(division) {

                        require(["docs/employee/ChooseEmployeeDialog"], dojo.hitch(this, function(ChooseEmployeeDialog){

                            if (!this.dialog) {

                                this.dialog = new ChooseEmployeeDialog();

                            }

                            this.dialog.show(division, dojo.hitch(this, function(value) {

                                this.dialog.hide();

                                var data = this.value;

                                if (data.indexOf(value.id) > -1) {

                                    console.log("Такой сотрудник уже в списке");

                                    return ;

                                }

                                var newData = data.slice();

                                newData.push(value.id);

                                this.grid.store.add(value);

                                this.property.controller.set("value", newData);

                            }));

                        }));

                    });

                    if (this.divisionPropertyName) {

                        var propertyControllers = property.controller.collection.propertyControllers ;

                        var propertyController = propertyControllers[this.divisionPropertyName];

                        var divisionId = propertyController.get("value");

                        if (divisionId && (!this.division || this.division.id != divisionId)) {

                            var params = {};

                            params.repositoryId = ecm.model.desktop.currentSolution.targetObjectStore.repositoryId ;
                            params.repositoryType = ecm.model.desktop.currentSolution.targetObjectStore.type;
                            params.op = "get" ;
                            params.id = divisionId ;

                            ecm.model.Request.invokePluginService("DFSPlugin", "DivisionService", {
                                requestParams: params,
                                requestCompleteCallback: dojo.hitch(this, function(response) {

                                    this.division = response ;

                                    handler(this.division);

                                })

                            });

                        }

                    } else {

                        handler();

                    }

                    */

                }

            },

            oneuiBaseClass: "documentsBoxEditor",

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
                    data: [{
                        id: "aa",
                        type: "Заявление",
                        document: "загрузить"
                    }, {
                        id: "bb",
                        type: "Справка с места работы",
                        document: "загрузить"
                    }]
                });

                var structure = [
                    { field: 'type', name: 'Тип', width: '20em'},
                    { field: 'document', name: 'Документ', width: '20em'}
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

                this.grid.placeAt(this.documentsNode);

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

                if (!this.grid) {

                    this._createGrid();

                }


                var store = this.grid.store ;

                /*

                for (var i = 0; i < _val.length; i++) {

                    if (!store.get(_val[i])) {

                        // элемент не существует

                        var employee = {
                            id: _val[i],
                            code: null,
                            name: "...",
                            division: null
                        }

                        store.add(employee);

                        var params = {};

                        params.repositoryId = ecm.model.desktop.currentSolution.targetObjectStore.repositoryId ;
                        params.repositoryType = ecm.model.desktop.currentSolution.targetObjectStore.type;
                        params.op = "get" ;
                        params.id = employee.id ;

                        ecm.model.Request.invokePluginService("DFSPlugin", "EmployeeService", {
                            requestParams: params,
                            requestCompleteCallback: dojo.hitch(this, function(response) {

                                var obj = store.get(response.id);

                                obj.code = response.code ;
                                obj.name = response.name ;
                                obj.division = response.division ;

                                store.put(obj);

                                // this.grid.body.refresh();

                            })

                        });

                    }

                }
                */

                this.value = _val ;

            },

            _getValueAttr: function() {

                return this.value ;

            }

        }

    );

});