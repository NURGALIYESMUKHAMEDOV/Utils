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
    "dojo/text!./templates/CaseTab.html"
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

    return declare("esbd.cases.CaseTab", [
        BorderContainer, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin
    ], {

        templateString: template,

        widgetsInTemplate: true,

        repository: null,

        contentItem: null,

        postCreate: function() {

            this.inherited(arguments);

            if (this.contentItem) {

                // указан элемент для отображения

                var contentClass = this.repository.getContentClass(this.contentItem.template_name);

                var entryTemplate = new EntryTemplate({
                    repository: this.repository,
                    id: this.contentItem.entryTemplateId
                });

                entryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(entryTemplate){

                    this._createRendering(contentClass, entryTemplate);

                }),false,true);

            }

            this.toolbar.set("repository", this.repository);

            this.toolbar.createToolbar({
                items: [this.contentItem],
                parameterMap: {
                    widget: this,
                    item: this.contentItem
                }
            });

        },

        _createRendering: function(contentClass, entryTemplate) {

            if (this.propertiesPane) {

                this.propertiesPane.clearRendering();

                this.propertiesPane.destroy();

                this.propertiesPane = null ;

            }

            var propertiesPaneClass = "ecm/widget/CommonPropertiesPane";

            if (entryTemplate && entryTemplate.layoutPropertiesPaneClass) {

                propertiesPaneClass = entryTemplate.layoutPropertiesPaneClass ;

            }

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

                        var widget = this.propertiesPane._view ;

                        var self = this ;

                        var attachResize = function(widget) {

                            if ("getChildren" in widget && lang.isFunction(widget.getChildren)) {

                                var children = widget.getChildren();

                                if (children) {

                                    array.forEach(children, function(child){

                                        if (child.declaredClass == "pvr.widget.TabContainer") {

                                            console.log("[ContractTab] _createRendering, tabContainer: ", child);

                                            child.watch("selectedChildWidget", function(name, oval, nval) {

                                                console.log("[ContractTab] _createRendering, tab selected, widget: ", nval);

                                                nval.layout();

                                            });

                                            return ;

                                        } else {

                                            attachResize(child);

                                        }

                                    }, this);

                                }

                            }

                        }

                        attachResize(widget);

                        this.resize();

                    }),
                    dojo.hitch(this, function(error){

                    })
                );

            }));

        },

        /*

        _setLocalValue: function() {

            if (this.contentItem) {

                this.toolbar.createToolbar({
                    items: [this.contentItem]
                });

                this.contentClass = this.repository.getContentClass(this.contentItem.template);

                if (this.contentItem.entryTemplateId) {

                    var entryTemplate = new EntryTemplate({
                        repository: this.repository,
                        id: this.contentItem.entryTemplateId
                    });

                    entryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(entryTemplate){

                        this.entryTemplate = entryTemplate ;

                        this._createRendering();

                    }));

                }

            }

        },

        createRendering: function() {

            if (this.commonProperties) {

                this.commonProperties.clearRendering();

                this.commonProperties.destroy();

                this.commonProperties = null ;

            }

            var commonPropertiesClass = "ecm/widget/CommonPropertiesPane";

            if (this.entryTemplate && this.entryTemplate.layoutPropertiesPaneClass) {

                commonPropertiesClass = this.entryTemplate.layoutPropertiesPaneClass ;

            }

            require([
                commonPropertiesClass
            ], dojo.hitch(this, function(cls){

                this.commonProperties = new cls();

                this.propertiesContainer.set("content", this.commonProperties);

                var privEditProperties = this.contentItem.hasPrivilege("privEditProperties");

                this.commonProperties.createRendering(
                    this.contentClass,
                    this.entryTemplate,
                    this.contentItem,
                    "editProperties",
                    !privEditProperties,
                    false,
                    dojo.hitch(this, function(callback){

                    }),
                    dojo.hitch(this, function(error){

                    })
                );

            }));

        },

        _getLocalValue: function() {

        },

        */

    });

});