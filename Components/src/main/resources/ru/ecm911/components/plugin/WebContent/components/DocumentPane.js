define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/dom-style",
    "dojo/date/locale",
    "dijit/layout/ContentPane",
    "dijit/layout/TabContainer",
    "dijit/layout/BorderContainer",
    "ecm/model/EntryTemplate",
    "ecm/model/Request",
    "ecm/model/ResultSet",
    "ecm/model/Comment",
    "ecm/widget/ItemCommentsPane",
    "ecm/widget/ItemNotelogsPane",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/DocumentPane.html"
],function(
    declare,
    lang,
    array,
    domStyle,
    locale,
    ContentPane,
    TabContainer,
    BorderContainer,
    EntryTemplate,
    Request,
    ResultSet,
    Comment,
    ItemCommentsPane,
    ItemNotelogsPane,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template
) {

    return declare("components.DocumentPane", [
        BorderContainer, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin
    ], {

        templateString: template,

        widgetsInTemplate: true,

        repository: null,

        params: null,

        contentItem: null,

        postCreate: function() {

            this.inherited(arguments);

            this.toolbar.set("repository", this.repository);

            if (this.params && this.params.toolbarDef) {

                this.toolbar.set("toolbarName", this.params.toolbarDef);

            }

        },

        _setContentItemAttr: function(contentItem) {

            this.contentItem = contentItem ;

            this._createRendering();

            var contentList = {
                getSelectedItems: dojo.hitch(this, function() {
                    return [this.contentItem]
                })
            };

            this.toolbar.createToolbar({
                items: [this.contentItem],
                contentList: contentList,
                parameterMap: {
                    widget: this
                }
            });

        },

        _createRendering: function() {

            if (this.propertiesPane) {

                this.propertiesPane.clearRendering();

                this.propertiesPane.destroy();

                this.propertiesPane = null ;

            }

            // если документ не указан, пропускаем
            if (!this.contentItem) {

                return ;

            }

            // находим соответствующую конфигурацию

            var configs = array.filter(this.params.classes, function(element){

                if (element.entryTemplate && typeof element.entryTemplate === "string") {

                    element.entryTemplate = new EntryTemplate({
                        repository: this.contentItem.repository,
                        id: element.entryTemplate
                    });

                }

                return element.contentClass == this.contentItem.template ;

            }, this);

            var config = configs[0] || {};

            var entryTemplate = config.entryTemplate ;

            if (!entryTemplate && this.contentItem.entryTemplateId) {

                entryTemplate = new EntryTemplate({
                    repository: repository,
                    id: this.contentItem.entryTemplateId
                });

            }

            var _renderProperties = dojo.hitch(this, function(entryTemplate){

                var propertiesPaneClass = "ecm/widget/CommonPropertiesPane";

                if (entryTemplate && entryTemplate.layoutPropertiesPaneClass) {

                    propertiesPaneClass = entryTemplate.layoutPropertiesPaneClass ;

                }

                var repository = this.contentItem.repository ;

                var contentClass = repository.getContentClass(this.contentItem.template);

                require([
                    propertiesPaneClass
                ], dojo.hitch(this, function(cls){

                    this.propertiesPane = new cls();

                    this.contentPane.set("content", this.propertiesPane);

                    var privEditProperties = this.contentItem.hasPrivilege("privEditProperties");

                    this.propertiesPane.createRendering(
                        contentClass,
                        entryTemplate,
                        this.contentItem,
                        "editProperties",
                        !privEditProperties,
                        false,
                        dojo.hitch(this, function(callback){

                            this.resize();

                        }),
                        dojo.hitch(this, function(error){

                        })
                    );

                }));

            });

            if (entryTemplate) {

                if (entryTemplate.isRetrieved) {

                    _renderProperties(entryTemplate);

                } else {

                    entryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(entryTemplate){

                        _renderProperties(entryTemplate);

                    }),false,true);

                }

            } else {

                _renderProperties();

            }


        },

        getPropertiesJSON: function(includeReadonly, includeHidden, excludeEmptyValues) {

            if (this.propertiesPane) {

                return this.propertiesPane.getPropertiesJSON(includeReadonly, includeHidden, excludeEmptyValues);

            } else {

                return null;

            }

        }

    });

});