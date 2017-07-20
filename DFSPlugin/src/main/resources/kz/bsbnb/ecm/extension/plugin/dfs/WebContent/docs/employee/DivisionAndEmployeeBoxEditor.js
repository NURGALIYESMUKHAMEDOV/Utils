define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/DivisionAndEmployeeBoxEditor.html",
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

    console.log("инициализация редактора 'Структурное подразделение / Сотрудник' ...");

    return declare(
        "docs.employee.DivisionAndEmployeeBoxEditor",
        [
            _WidgetBase,
            _TemplatedMixin,
            _CssStateMixin,
            _CompositeMixin,
            _ValidationMixin,
            _EditorMixin
        ],{

            templateString: template,

            // сотрудник и организационная единица, в которой данный сотрудник представлен
            value: null,

            // индикатор фоновой загрузки данных
            loading: false,

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

            _onChoose: function(evt) {

                if (!this.readOnly) {

                    require(["docs/employee/ChooseDivisionAndEmployeeDialog"], dojo.hitch(this, function(ChooseDivisionAndEmployeeDialog){

                        if (!this.dialog) {

                            this.dialog = new ChooseDivisionAndEmployeeDialog();

                        }

                        this.dialog.show(dojo.hitch(this, function(value) {

                            this.dialog.hide();

                            this.value = value ;

                            var v = this.value.divisionId + "," + this.value.employeeId;

                            this.property.controller.set("value", v);

                            this.divisionAndEmployeeNode.innerHTML = this.value.divisionName + " ( " + this.value.employeeName + " ) ";

                        }));

                    }));

                }

            },

            oneuiBaseClass: "divisionAndEmployeeBoxEditor",

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

                        this.divisionAndEmployeeNode.innerHTML = "загрузка...";

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

                                    this.divisionAndEmployeeNode.innerHTML = this.value.divisionName + " ( " + this.value.employeeName + " ) ";

                                } else {

                                    this.divisionAndEmployeeNode.innerHTML = "укажите значение";

                                }

                                this.loading = false ;

                            })

                        });


                    }

                }

            },

            _getValueAttr: function() {

                return this.value ;

            }

        }

    );

});