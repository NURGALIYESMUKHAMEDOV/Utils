define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/DivisionBoxEditor.html",
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

    console.log("инициализация редактора 'Структурное подразделение' ...");

    return declare(
        "docs.division.DivisionBoxEditor",
        [
            _WidgetBase,
            _TemplatedMixin,
            _CssStateMixin,
            _CompositeMixin,
            _ValidationMixin,
            _EditorMixin
        ],{

            templateString: template,

            // структурное подразделение
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

                    require(["docs/division/ChooseDivisionDialog"], dojo.hitch(this, function(ChooseDivisionDialog){

                        if (!this.dialog) {

                            var stackedVidOrg = dijit.byId('code');
                            if (stackedVidOrg) {
                                stackedVidOrg.destroyRecursive(true);
                            }

                            var stackedVidOrg = dijit.byId('name');
                            if (stackedVidOrg) {
                                stackedVidOrg.destroyRecursive(true);
                            }

                            this.dialog = new ChooseDivisionDialog();

                        }

                        this.dialog.show(dojo.hitch(this, function(value) {

                            this.dialog.hide();

                            this.value = value ;

                            this.property.controller.set("value", value.id);

                            this.divisionNode.innerHTML = this.value.name;

                        }));

                    }));

                }

            },

            oneuiBaseClass: "divisionBoxEditor",

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

                        this.divisionNode.innerHTML = "загрузка...";

                        var params = {};

                        params.repositoryId = this._getRepository().repositoryId ;
                        params.repositoryType = this._getRepository().type;
                        params.op = "get" ;
                        params.id = this.value ;

                        this.loading = true ;

                        ecm.model.Request.invokePluginService("DFSPlugin", "DivisionService", {
                            requestParams: params,
                            requestCompleteCallback: dojo.hitch(this, function(response) {

                                this.value = response ;

                                if (this.value) {

                                    this.divisionNode.innerHTML = this.value.name;

                                } else {

                                    this.divisionNode.innerHTML = "укажите значение";

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