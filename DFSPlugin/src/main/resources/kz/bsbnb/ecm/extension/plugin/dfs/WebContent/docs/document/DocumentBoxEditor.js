define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/DocumentBoxEditor.html",
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

    console.log("инициализация редактора 'Документ' ...");

    return declare(
        "docs.document.DocumentBoxEditor",
        [
            _WidgetBase,
            _TemplatedMixin,
            _CssStateMixin,
            _CompositeMixin,
            _ValidationMixin,
            _EditorMixin
        ],{

            templateString: template,

            // документ
            value: null,

            // шаблон ввода
            entryTemplateId: null,

            // индикатор фоновой загрузки данных
            loading: false,

            repository: null,

            _getRepository: function(){

                if(ecm.model.desktop.currentSolution)
                    this.repository = ecm.model.desktop.currentSolution.targetObjectStore;
                else if(this.property.controller)
                    this.repository = this.property.controller.model.repository;
                else
                    this.repository = ecm.model.desktop.repositories[0];

                return this.repository;

            },

            _onChoose: function(evt) {

                if (!this.readOnly) {

                    var repository = this._getRepository();

                    console.log("repository: ", repository);

                    // var entryTemplateId = "{207DCF4D-0000-C314-8413-EC48F8C89B64}" ;

                    repository.retrieveItem(this.entryTemplateId, dojo.hitch(this, function(item) {

                        if (item && item.mimetype) {

                            switch (item.mimetype) {

                                case "application/x-filenet-documententrytemplate":
                                case "application/x-filenet-folderentrytemplate":
                                case "application/x-filenet-entrytemplate":
                                case "application/x-filenet-customobjectentrytemplate":
                                case "application/x-filenet-declarerecordentrytemplate":
                                case "application/x-icn-documententrytemplate":

                                var entryTemplate = repository.getEntryTemplateById(item.id, item.name, item.objectStore);

                                var handler = dojo.hitch(this, function(entryTemplate) {

                                    var myDialog = new ecm.widget.dialog.AddContentItemDialog();

                                    if (entryTemplate) {

                                        myDialog.show(repository, null, true, false, dojo.hitch(this, function(newItem) {

                                            this.value = newItem ;

                                            var tokens = newItem.id.split(",");

                                            this.property.controller.set("value", tokens[2]);

                                            this.documentNode.innerHTML = newItem.name ;

                                            this.emptyNode.style.display = "none" ;

                                            this.loadingNode.style.display = "none" ;

                                            this.documentNode.style.display = "block" ;


                                        }), null, true, entryTemplate);

                                    }

                                });

                                if (!entryTemplate.isRetrieved) {

                                    entryTemplate.retrieveEntryTemplate(handler, false, false);

                                } else {

                                    handler(entryTemplate);

                                }

                                break;

                            }

                        }

                    }));//, "EntryTemplate", "current", this.entryTemplateId

                }

            },

            _onOpen: function(evt) {

                console.log("open document!!, value: ", this.value);

                // var contentViewer = new ecm.widget.dialog.ContentViewerWindow();

                ecm.widget.dialog.contentViewerWindow.open(this.value);

            },

            oneuiBaseClass: "documentBoxEditor",

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

                        this.loading = true ;

                        this.emptyNode.style.display = "none" ;

                        this.loadingNode.style.display = "block" ;

                        this.documentNode.style.display = "none" ;

                        var repository = this._getRepository();

                        repository.retrieveItem(this.value, dojo.hitch(this, function(item) {

                            console.log("retrieve item: ", item);

                            this.value = item ;

                            this.loading = false ;

                            this.documentNode.innerHTML = item.name ;

                            this.emptyNode.style.display = "none" ;

                            this.loadingNode.style.display = "none" ;

                            this.documentNode.style.display = "block" ;

                        }));

                    } else {

                        this.emptyNode.style.display = "block" ;

                        this.loadingNode.style.display = "none" ;

                        this.documentNode.style.display = "none" ;

                    }

                } else {

                    this.emptyNode.style.display = "none" ;

                    this.loadingNode.style.display = "block" ;

                    this.documentNode.style.display = "none" ;

                }

            },

            _getValueAttr: function() {

                return this.value ;

            }

        }

    );

});