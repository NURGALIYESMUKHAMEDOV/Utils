define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/EmployeeBoxEditor.html",
    "idx/form/_CssStateMixin",
    "idx/form/_CompositeMixin",
    "idx/form/_ValidationMixin",
    "pvr/widget/editors/mixins/_EditorMixin"
], function(
    declare,
    array,
    _WidgetBase,
    _TemplatedMixin,
    template,
    _CssStateMixin,
    _CompositeMixin,
    _ValidationMixin,
    _EditorMixin
) {

    console.log("инициализация редактора 'Сотрудник' ...");

    return declare(
        "docs.employee.EmployeeBoxEditor",
        [
            _WidgetBase,
            _TemplatedMixin,
            _CssStateMixin,
            _CompositeMixin,
            _ValidationMixin,
            _EditorMixin
        ],{

            templateString: template,

            // сотрудник
            value: null,

            // индикатор фоновой загрузки данных
            loading: false,

            // наименование свойства, указывающего на структурное подразделение
            divisionPropertyName: null,

            // структурное подразделение
            division: null,

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

            // открывает диалог выбора сотрудника
            _onChoose: function(evt) {

                if (!this.readOnly) {

                    var property = this.property ;

                    var handler = dojo.hitch(this, function(division) {

                        require(["docs/employee/ChooseEmployeeDialog"], dojo.hitch(this, function(ChooseEmployeeDialog){

                            if (!this.dialog) {

                                this.dialog = new ChooseEmployeeDialog();

                            }

                            this.dialog.show(division, dojo.hitch(this, function(value) {

                                this.dialog.hide();

                                this.value = value ;

                                this.property.controller.set("value", this.value.id);

                                this.employeeNode.innerHTML = this.value.name;

                            }));

                        }));

                    });

                    if (this.divisionPropertyName) {

                        var propertyControllers = property.controller.collection.propertyControllers ;

                        var propertyController = propertyControllers[this.divisionPropertyName];

                        var divisionId = propertyController.get("value");

                        if (divisionId && (!this.division || this.division.id != divisionId)) {

                            var params = {};

                            params.repositoryId = this._getRepository().repositoryId ;
                            params.repositoryType = this._getRepository().type;
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

                }

            },

            oneuiBaseClass: "employeeBoxEditor",

            postCreate: function() {

                this._event = {
                    "input" : "onChange",
                    "blur" : "_onBlur",
                    "focus" : "_onFocus"
                }

                this.inherited(arguments);

            },

            _setValueAttr: function(_val) {

                if (!this.loading) {

                    this.value = _val ;

                    if (this.value) {

                        this.employeeNode.innerHTML = "загрузка...";

                        var params = {};

                        params.repositoryId = this._getRepository().repositoryId ;
                        params.repositoryType = this._getRepository().type;
                        params.op = "get" ;
                        params.id = this.value ;

                        this.loading = true ;

                        ecm.model.Request.invokePluginService("DFSPlugin", "EmployeeService", {
                            requestParams: params,
                            requestCompleteCallback: dojo.hitch(this, function(response) {

                                this.value = response ;

                                if (this.value) {

                                    this.employeeNode.innerHTML = this.value.name;

                                } else {

                                    this.employeeNode.innerHTML = "укажите значение";

                                }

                                this.loading = false ;

                            })

                        });


                    } else {

                        this.employeeNode.innerHTML = "укажите значение";

                    }

                }

            },

            _getValueAttr: function() {

                return this.value ;

            }

        }

    );

});