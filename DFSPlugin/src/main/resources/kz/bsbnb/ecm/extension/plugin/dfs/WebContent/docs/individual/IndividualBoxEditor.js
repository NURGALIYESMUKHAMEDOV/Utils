// Физическое лицо

define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/IndividualBoxEditor.html",
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

    console.log("инициализация редактора 'Физическое лицо' ...");

    return declare(
        "docs.individual.IndividualBoxEditor",
        [
            _WidgetBase,
            _TemplatedMixin,
            _CssStateMixin,
            _CompositeMixin,
            _ValidationMixin,
            _EditorMixin
        ],{

            templateString: template,

            // физическое лицо
            value: null,

            // индикатор фоновой загрузки данных
            loading: false,

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

                }

            },

            oneuiBaseClass: "individualBoxEditor",

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

                        this.individualNode.innerHTML = "загрузка...";

                        var params = {};

                        params.repositoryId = ecm.model.desktop.currentSolution.targetObjectStore.repositoryId ;
                        params.repositoryType = ecm.model.desktop.currentSolution.targetObjectStore.type;
                        params.op = "get" ;
                        params.id = this.value ;

                        this.loading = true ;

                        ecm.model.Request.invokePluginService("DFSPlugin", "IndividualService", {
                            requestParams: params,
                            requestCompleteCallback: dojo.hitch(this, function(response) {

                                this.value = response ;

                                if (this.value) {

                                    this.individualNode.innerHTML = this.value.name;

                                } else {

                                    this.individualNode.innerHTML = "укажите значение";

                                }

                                this.loading = false ;

                            })

                        });


                    } else {

                        this.individualNode.innerHTML = "укажите значение";

                    }

                }

            },

            _getValueAttr: function() {

                return this.value ;

            }

        }

    );

});