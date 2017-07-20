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
    "dojo/text!./templates/InsuredClientListBox.html"
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

    return declare("esbd.contract.InsuredClientListBox", [
        BorderContainer, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin
    ], {

        templateString: template,
        widgetsInTemplate: true,

        // классы документов для выбора информационного объекта в виде массива
        // [ "ClassA", "ClassB" ]
        contentClasses: null,

        // шаблоны ввода для отображения информации об объекте, в виде
        // {
        //   "ClassA" : "{9FF15FCB-98AA-4DA9-9DBA-1102F2EBE10E}",
        //   "ClassB" : "{3222B8AF-2B19-42F6-AFBE-63132E73DA95}"
        // }
        //
        entryTemplates: null,

        // путь к папке с шаблонами поиска для соответствующих классов документов, в виде
        // {
        //   "ClassA" : "/Конфигурация/Поиск/ClassA",
        //   "ClassB" : "/Конфигурация/Поиск/ClassB"
        // }
        //
        searchTemplatePaths: null,

        // виджеты для отображения свойств
        itemNodes: [],

        postCreate: function() {

            this.inherited(arguments);

            if (!this.repository) {

                this.repository = ecm.model.desktop.repositories[0];

            }

            // проверяем, указаны ли классы документов и
            // если требуется преобразуем их в объекты из строки

            if (this.contentClasses && lang.isArray(this.contentClasses)) {

                this.contentClasses = array.map(this.contentClasses, function(contentClass){

                    if (lang.isString(contentClass)) {

                        return this.repository.getContentClass(contentClass);

                    } else {

                        return contentClass ;

                    }

                }, this);

            }

            // получаем информацию о наименовании классов

            this.repository.retrieveContentClassList(dojo.hitch(this, function(contentClasses){

                this.contentClasses = contentClasses ;

                this._createRendering();

            }), array.map(this.contentClasses, function(contentClass){

                return contentClass.id ;

            }), this);

            // проверяем, указаны ли шаблоны ввода документов и
            // если требуется преобразуем их в объекты из строки

            if (this.entryTemplates) {

                array.forEach(this.contentClasses, function(contentClass){

                    if (this.entryTemplates[contentClass.id]) {

                        var entryTemplate = this.entryTemplates[contentClass.id];

                        if (lang.isString(entryTemplate)) {

                            entryTemplate = new EntryTemplate({
                                repository: this.repository,
                                id: this.entryTemplates[contentClass.id]
                            });

                            this.entryTemplates[contentClass.id] = entryTemplate ;

                        }

                    }

                }, this);

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

            // удаляем предыдущие элементы выпадающего меню

            var children = this.dropDownMenu.getChildren();

            if (children) {

                array.forEach(children, function(child){

                    this.dropDownMenu.removeChild(child);

                    child.destroy();

                }, this);

            }

            // обновляем выпадающее меню с перечнем классов

            array.forEach(this.contentClasses, function(contentClass){

                var menuItem = new MenuItem({
                    label: contentClass.name,
                    onClick: dojo.hitch(this, function(){
                        this.onLookup(contentClass);
                    })
                })

                this.dropDownMenu.addChild(menuItem);

            }, this);

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
        onLookup: function(contentClass) {

		    var dialog = new LookupObjectDialog({

		        searchTemplatesPath: this.searchTemplatePaths[contentClass.id],

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
                    title: "Застрахованное лицо",
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

            // получаем информацию о классе документа

            var contentClasses = array.filter(this.contentClasses, function(contentClass){

                return contentClass.id == contentItem.template ;

            }, this);

            array.forEach(contentClasses, function(contentClass){

                // проверяем, загружен ли шаблон ввода

                var entryTemplate = this.entryTemplates[contentClass.id];

                if (entryTemplate) {

                    if (entryTemplate.isRetrieved) {

                        renderProperties(contentClass, entryTemplate, contentItem);

                    } else {

                        entryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(entryTemplate){

                            this.entryTemplates[contentClass.id] = entryTemplate ;

                            renderProperties(contentClass, entryTemplate, contentItem);

                        }));

                    }

                }

            }, this);

        },

        _getLocalValue: function() {

        },

    });

});