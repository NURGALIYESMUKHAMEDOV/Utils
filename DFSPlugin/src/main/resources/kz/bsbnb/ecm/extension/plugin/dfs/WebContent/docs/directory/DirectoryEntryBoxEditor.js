define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/store/Memory",
    "gridx/core/model/cache/Sync",
    "gridx/Grid",
    "gridx/modules/select/Row",
    "dojo/text!./templates/DirectoryEntryBoxEditor.html",
    "idx/form/_CssStateMixin",
    "idx/form/_CompositeMixin",
    "idx/form/_ValidationMixin",
    "pvr/widget/editors/mixins/_EditorMixin"
], function (declare,
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
             _EditorMixin) {

    console.log("инициализация редактора 'Индекс дела' ...");

    return declare(
        "docs.directory.DirectoryEntryBoxEditor",
        [
            _WidgetBase,
            _TemplatedMixin,
            _CssStateMixin,
            _CompositeMixin,
            _ValidationMixin,
            _EditorMixin
        ], {

            templateString: template,
            dialog: null,
            value: null,
            loading: false,

            _onSelectDirectoryEntry: function (evt) {

                if (!this.readOnly) {

                    require(["docs/directory/ChooseDirectoryEntryDialog"], dojo.hitch(this, function (ChooseDirectoryEntryDialog) {

                        var stackedVidOrg = dijit.byId('directoryEntryCode');
                        if (stackedVidOrg) {
                            stackedVidOrg.destroyRecursive(true);
                        }
                        var stackedVidOrg = dijit.byId('directoryEntryName');
                        if (stackedVidOrg) {
                            stackedVidOrg.destroyRecursive(true);
                        }


                        if (!this.dialog) {

                            this.dialog = new ChooseDirectoryEntryDialog();

                        }

                        this.dialog.show(dojo.hitch(this, function (value) {

                            this.value = value;

                            this.property.controller.set("value", value.id);

                            this.directoryEntryNode.innerHTML = value.code + " / " + value.name;

                            this.dialog.hide();

                        }));

                    }));

                }

            },

            oneuiBaseClass: "directoryEntryBoxEditor",

            postCreate: function () {

                this._event = {
                    "input": "onChange",
                    "blur": "_onBlur",
                    "focus": "_onFocus"
                }

                this.inherited(arguments);

            },

            _setValueAttr: function (_val) {

                if (!this.loading) {

                    this.value = _val;

                    if (this.value) {

                        this.directoryEntryNode.innerHTML = "загрузка...";

                        var params = {};

                        params.repositoryId = ecm.model.desktop.currentSolution.targetObjectStore.repositoryId;
                        params.repositoryType = ecm.model.desktop.currentSolution.targetObjectStore.type;
                        params.op = "get";
                        params.id = this.value;

                        this.loading = true;

                        ecm.model.Request.invokePluginService("DFSPlugin", "DirectoryService", {
                            requestParams: params,
                            requestCompleteCallback: dojo.hitch(this, function (response) {

                                this.value = response;

                                if (this.value && this.value.code && this.value.name) {

                                    this.directoryEntryNode.innerHTML = this.value.code + " / " + this.value.name;

                                } else {

                                    this.directoryEntryNode.innerHTML = "укажите значение";

                                }

                                this.loading = false;

                            })

                        });

                    } else {

                        this.directoryEntryNode.innerHTML = "укажите значение";

                    }

                }

            },

            _getValueAttr: function () {

                return this.value;

            }

        }
    );

});