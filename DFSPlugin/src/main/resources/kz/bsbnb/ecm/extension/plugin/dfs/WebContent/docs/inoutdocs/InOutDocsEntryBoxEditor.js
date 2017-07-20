define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/store/Memory",
    "gridx/core/model/cache/Sync",
    "gridx/Grid",
    "gridx/modules/select/Row",
    "dojo/text!./templates/InOutDocsEntryBoxEditor.html",
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
    template,
    _CssStateMixin,
    _CompositeMixin,
    _ValidationMixin,
    _EditorMixin
) {

    console.log("инициализация редактора 'Привезка Входящих и Исходящих документов' ...");

    return declare(
        "docs.inoutdocs.InOutDocsEntryBoxEditor",
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
            value: null,
            loading: false,

            _onSelectInOutDocsEntry: function(evt) {

                if (!this.readOnly) {

                    console.log("1**");

                    require(["docs/inoutdocs/ChooseInOutDocsEntryDialog"], dojo.hitch(this, function(ChooseInOutDocsEntryDialog){

                        if (!this.dialog) {

                            var stackedVidOrg = dijit.byId('InOutDocsEntryCode');
                            if (stackedVidOrg) {
                                stackedVidOrg.destroyRecursive(true);
                            }

                            var stackedVidOrg = dijit.byId('InOutDocsEntryName');
                            if (stackedVidOrg) {
                                stackedVidOrg.destroyRecursive(true);
                            }

                            this.dialog = new ChooseInOutDocsEntryDialog();
                            console.log("2**");
                        }
                        console.log("3**");
                        this.dialog.show(dojo.hitch(this, function(value){

                            this.value = value ;

                            //this.property.controller.set("value", value.id);
                            //
                            //this.directoryEntryNode.innerHTML = value.code + " / " + value.name;

                            this.property.controller.set("value", value.id);

                            this.InOutDocsyEntryNode.innerHTML = value.CaseTitle;


                            this.dialog.hide();

                        }));

                    }));

                }

            },

            oneuiBaseClass: "InOutDocsEntryBoxEditor",

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

                        this.InOutDocsyEntryNode.innerHTML = "загрузка...";

                        var params = {};

                        params.repositoryId = ecm.model.desktop.currentSolution.targetObjectStore.repositoryId ;
                        params.repositoryType = ecm.model.desktop.currentSolution.targetObjectStore.type;
                        params.op = "get" ;
                        params.id = this.value ;

                        this.loading = true ;

                        ecm.model.Request.invokePluginService("DFSPlugin", "InOutDocsService", {
                            requestParams: params,
                            requestCompleteCallback: dojo.hitch(this, function(response) {

                                this.value = response ;

                              //  if (this.value && this.value.code && this.value.name) {

                                  if (this.value && this.value.CaseTitle) {

                                  //  this.directoryEntryNode.innerHTML = this.value.code + " / " + this.value.name;
                                      this.InOutDocsyEntryNode.innerHTML = this.value.CaseTitle;

                                } else {

                                    this.InOutDocsyEntryNode.innerHTML = "укажите значение";

                                }

                                this.loading = false ;

                            })

                        });

                    } else {

                        this.InOutDocsyEntryNode.innerHTML = "укажите значение";

                    }

                }

            },

            _getValueAttr: function() {

                return this.value ;

            }

        }

    );

});