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
    "ecm/widget/listView/ContentList",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/ContractTab.html"
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
    ContentList,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template
) {

    return declare("esbd.contract.ContractTab", [
        BorderContainer, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin
    ], {

        templateString: template,

        widgetsInTemplate: true,

        repository: null,

        contentItem: null,

        contentClass: null,

        entryTemplate: null,

        propertiesPane: null,

        postCreate: function() {

            this.inherited(arguments);

            this.watch("contentItem", dojo.hitch(this, function(){

                this.onAfterSetContentItem();

            }));

            this.toolbar.set("repository", this.repository);

            if (this.contentItem) {

                this.onAfterSetContentItem();

            }

        },

        onAfterSetContentItem: function() {

            console.log("[ContractTab] onAfterSetContentItem, this: ", this);

            if (this.contentItem) {

                // указан элемент для отображения

                this.contentClass = this.repository.getContentClass(this.contentItem.template);

                if (!this.entryTemplate) {

                    this.entryTemplate = new EntryTemplate({
                        repository: this.repository,
                        id: this.contentItem.entryTemplateId
                    });

                    this.entryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(entryTemplate){

                        this.entryTemplate = entryTemplate ;

                        this._createRendering();

                    }),false,true);

                } else {

                    this._createRendering();

                }

            } else {

                this.contentClass = null;

                this.entryTemplate = null;

                this._clearRendering();

            }

        },

        _clearRendering: function() {

            if (this.propertiesPane) {

                this.propertiesPane.clearRendering();

                this.propertiesPane.destroy();

                this.propertiesPane = null;

            }

        },

        _createRendering: function() {

            this._clearRendering();

            if (this.contentItem) {

                // создаем панель инструментов

                var contentList = new ContentList();

                var resultSet = new ResultSet({
                    items: [this.contentItem]
                });

                contentList.setResultSet(resultSet);

                contentList.grid.row(0).select();

                this.toolbar.createToolbar({
                    resultSet: resultSet,
                    contentList: contentList,
                    parameterMap: {
                        widget: this
                    }
                });

                // отображаем документ

                var propertiesPaneClass = "ecm/widget/CommonPropertiesPane";

                if (this.entryTemplate && this.entryTemplate.layoutPropertiesPaneClass) {

                    propertiesPaneClass = this.entryTemplate.layoutPropertiesPaneClass ;

                }

                require([
                    propertiesPaneClass
                ], dojo.hitch(this, function(cls){

                    this.propertiesPane = new cls();

                    this.contentPane.set("content", this.propertiesPane);

                    var privEditProperties = this.contentItem.hasPrivilege("privEditProperties");

                    this.propertiesPane.createRendering(
                        this.contentClass,
                        this.entryTemplate,
                        this.contentItem,
                        "editProperties",
                        !privEditProperties,
                        false,
                        dojo.hitch(this, function(callback){

                            var widget = this.propertiesPane._view ;

                            var self = this ;
/*
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
*/
                            this.resize();

                        }),
                        dojo.hitch(this, function(error){

                        })

                    );

                }));

            }

        }

    });

});