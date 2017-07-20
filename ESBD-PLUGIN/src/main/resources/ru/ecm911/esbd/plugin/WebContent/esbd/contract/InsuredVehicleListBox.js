define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dijit/MenuItem",
    "dijit/layout/BorderContainer",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "ecm/model/EntryTemplate",
    "ecm/widget/TitlePane",
    "esbd/editor/LookupObjectDialog",
    "dojo/text!./templates/InsuredVehicleListBox.html"
],function(
    declare,
    lang,
    array,
    MenuItem,
    BorderContainer,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    EntryTemplate,
    TitlePane,
    LookupObjectDialog,
    template
) {

    return declare("esbd.contract.InsuredVehicleListBox", [
        BorderContainer, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin
    ], {

        templateString: template,
        widgetsInTemplate: true,

        // классы документов для выбора информационного объекта
        contentClass: null,

        // шаблон ввода для отображения информации об объекте
        entryTemplate: null,

        // путь к папке с шаблонами поиска для соответствующих документов
        searchTemplatePath: null,

        // виджет для отображения свойств
        propertiesPane: null,

        postCreate: function() {

            this.inherited(arguments);

            if (!this.repository) {

                this.repository = ecm.model.desktop.repositories[0];

            }

            // проверяем, указаны ли классы документов и
            // если требуется преобразуем их в объекты из строки

            if (lang.isString(this.contentClass)) {

                this.contentClass = this.repository.getContentClass(this.contentClass);

            }

            // проверяем, указаны ли шаблоны ввода документов и
            // если требуется преобразуем их в объекты из строки

            if (lang.isString(this.entryTemplate)) {

                this.entryTemplate = new EntryTemplate({
                    repository: this.repository,
                    id: this.entryTemplate
                });

            }

            this._createRendering();

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

            // удаляем информацию из основного блока

            if (this.itemNodes) {

                array.forEach(this.itemNodes, function(itemNode){

                    if (itemNode.clearRendering) {

                        itemNode.clearRendering();

                    }

                    itemNode.destroyRecursive();

                }, this);

                this.itemNodes = [] ;

            }

        },

        // вызывается при выборе типа документа
        onLookup: function() {

		    var dialog = new LookupObjectDialog({

		        searchTemplatesPath: this.searchTemplatePath,

		        onSelect: dojo.hitch(this, function(contentItem){

                    this.onSelect(contentItem);

		            dialog.hide();

		        })

		    });

		    dialog.show();

        },

        // вызывается при выборе типа документа
        onSelect: function(contentItem) {

            var renderProperties = dojo.hitch(this, function(contentClass, entryTemplate, contentItem){

                var propertiesPaneClass = "ecm/widget/CommonPropertiesPane";

                if (entryTemplate && entryTemplate.layoutPropertiesPaneClass) {

                    propertiesPaneClass = entryTemplate.layoutPropertiesPaneClass ;

                }

                var titlePane = new TitlePane({
                    title: "Застрахованное транспортное средство",
                    closable: true,
                    onClose: dojo.hitch(this, function(){
                        console.log("закрытие")
                    })
                });

                require([
                    propertiesPaneClass
                ], dojo.hitch(this, function(cls){

                    var propertiesPane = new cls();

                    titlePane.addChild(propertiesPane);

                    var privEditProperties = contentItem.hasPrivilege("privEditProperties");

                    propertiesPane.createRendering(
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

                    this.containerPane.addChild(titlePane);

                }));

            });

            if (this.entryTemplate.isRetrieved) {

                renderProperties(this.contentClass, this.entryTemplate, contentItem);

            } else {

                this.entryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(entryTemplate){

                    this.entryTemplate = entryTemplate ;

                    renderProperties(this.contentClass, this.entryTemplate, contentItem);

                }));

            }

        },

        _getLocalValue: function() {

        },

    });

});