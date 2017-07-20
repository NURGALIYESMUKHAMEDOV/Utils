define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dijit/MenuItem",
    "dijit/layout/ContentPane",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "ecm/model/EntryTemplate",
    "esbd/editor/LookupObjectDialog",
    "dojo/text!./templates/PropertiesBox.html"
],function(
    declare,
    lang,
    array,
    MenuItem,
    ContentPane,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    EntryTemplate,
    LookupObjectDialog,
    template
) {

    return declare("esbd.contract.PropertiesBox", [
        ContentPane, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin
    ], {

        templateString: template,
        widgetsInTemplate: true,

        // шаблоны ввода для отображения информации об объекте
        entryTemplate: null,

        // виджет для отображения свойств
        propertiesPane: null,

        postCreate: function() {

            this.inherited(arguments);

            if (!this.repository) {

                this.repository = ecm.model.desktop.repositories[0];

            }

            // проверяем, указан ли шаблон ввода документа и
            // если требуется преобразуем его в объект из строки

            if (lang.isString(this.entryTemplate)) {

                this.entryTemplate = new EntryTemplate({
                    repository: this.repository,
                    id: this.entryTemplate
                });

            }

        },

        setValue: function(value) {

            this.contentItem = value ;

            this._setLocalValue();

        },

        getValue: function() {

            this._getLocalValue();

            return this.contentItem;

        },

        _setLocalValue: function() {

            if (this.contentItem) {

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

        _createRendering: function() {

            var renderProperties = dojo.hitch(this, function(contentClass, entryTemplate, contentItem){

                var propertiesPaneClass = "ecm/widget/CommonPropertiesPane";

                if (entryTemplate && entryTemplate.layoutPropertiesPaneClass) {

                    propertiesPaneClass = entryTemplate.layoutPropertiesPaneClass ;

                }

                require([
                    propertiesPaneClass
                ], dojo.hitch(this, function(cls){

                    this.propertiesPane = new cls();

                    this.containerPane.set("content", this.propertiesPane);

                    var privEditProperties = contentItem.hasPrivilege("privEditProperties");

                    this.propertiesPane.createRendering(
                        contentClass,
                        entryTemplate,
                        contentItem,
                        "editProperties",
                        !privEditProperties,
                        false,
                        dojo.hitch(this, function(callback){

                        }),
                        dojo.hitch(this, function(error){

                        })
                    );

                }));

            });

            // удаляем информацию из основного блока

            if (this.propertiesPane) {

                this.propertiesPane.clearRendering();

                this.propertiesPane.destroy();

                this.propertiesPane = null ;

            }

            // получаем информацию о классе документа

            if (this.contentItem) {

                var contentClass = this.repository.getContentClass(this.contentItem.template);

                if (this.entryTemplate.isRetrieved) {

                    renderProperties(contentClass, this.entryTemplate, this.contentItem);

                } else {

                    this.entryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(entryTemplate){

                        this.entryTemplate = entryTemplate ;

                        renderProperties(contentClass, this.entryTemplate, this.contentItem);

                    }));

                }

            }

        },

        _getLocalValue: function() {

        },

    });

});