define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
	"dojo/dom-style",
    "dojo/json",
    "dojo/_base/array",
    "dijit/layout/ContentPane",
    "dijit/layout/TabContainer",
    "ecm/widget/layout/_LaunchBarPane",
    "ecm/widget/listView/ContentList",
    "esbd/Configuration",
    "dojo/text!./templates/ESBDACFeature.html"
],function(
    declare,
    lang,
    connect,
    domStyle,
    json,
    array,
    ContentPane,
    TabContainer,
    _LaunchBarPane,
    ContentList,
    Configuration,
    template
) {

    return declare("esbd.ESBDACFeature", [
        _LaunchBarPane
    ], {

        templateString: template,

        widgetsInTemplate: true,

        // репозиторий приложения (данные должны быть получены из конфигурации плагина)
        repository: null,

        // конфигурация приложения
        configuration: null,

        // список открытых вкладок по идентификатором
        // элементов, отображаемых в них
        tabs: [],

        postCreate: function() {

            this.configuration = new Configuration(this.feature.pluginConfiguration);

            this.repository = this.configuration.repository ;

            lang.setObject("ESBD_AddDocumentAction", dojo.hitch(this, this._addDocumentAction));

        },

        loadContent: function() {

            var tabs = this.tabContainer.getChildren();

            for (var i = 0; i < tabs.length; i++) {

                var tab = tabs[i];

                this.tabContainer.removeChild(tab);

                tab.destroyRecursive();

            }

            this.tabContainer.addChild(this._createCoefficientsTab());

        },

        _createInformationTab: function() {

            console.log("[ESBDACFeature] _createInformationTab");

            var contentPane = new ContentPane({

                title: "Информация",

                content: "Тестирование"

            });

            return contentPane ;

        },

        _createCoefficientsTab: function() {

            var coefficientsTab = new TabContainer({

                title: "Коэффициенты",

            });

            domStyle.set(coefficientsTab.domNode, "padding", "10px");

            this._createTab(coefficientsTab, {

                title: "МРП",

                searchTemplatesPath: "/Конфигурация/Поиск/Коэффициенты/МРП",

                toolbarDef: "ESBD_DocumentListMenuType",

                entryTemplate: this.configuration.getEntryTemplate("ESBD_BaseRate", "add")

            });

            this._createTab(coefficientsTab, {

                title: "Бонус-Малус",

                searchTemplatesPath: "/Конфигурация/Поиск/Коэффициенты/Бонус-Малус",

                toolbarDef: "ESBD_DocumentListMenuType",

                entryTemplate: this.configuration.getEntryTemplate("ESBD_BonusMalusRate", "add")

            });

            this._createTab(coefficientsTab, {

                title: "Возраст и стаж водителя",

                searchTemplatesPath: "/Конфигурация/Поиск/Коэффициенты/Возраст и стаж водителя",

                toolbarDef: "ESBD_DocumentListMenuType",

                entryTemplate: this.configuration.getEntryTemplate("ESBD_AgeAndDrivingExperienceRate", "add")

            });

            this._createTab(coefficientsTab, {

                title: "Срок эксплуатации транспортного средства",

                searchTemplatesPath: "/Конфигурация/Поиск/Коэффициенты/Cрок эксплуатации транспортного средства",

                toolbarDef: "ESBD_DocumentListMenuType",

                entryTemplate: this.configuration.getEntryTemplate("ESBD_VehicleAgeRate", "add")

            });

            this._createTab(coefficientsTab, {

                title: "Территория регистрации транспортного средства",

                searchTemplatesPath: "/Конфигурация/Поиск/Коэффициенты/Территория регистрации транспортного средства",

                toolbarDef: "ESBD_DocumentListMenuType",

                entryTemplate: this.configuration.getEntryTemplate("ESBD_VehicleRegistrationRegionRate", "add")

            });

            this._createTab(coefficientsTab, {

                title: "Тип транспортного средства",

                searchTemplatesPath: "/Конфигурация/Поиск/Коэффициенты/Тип транспортного средства",

                toolbarDef: "ESBD_DocumentListMenuType",

                entryTemplate: this.configuration.getEntryTemplate("ESBD_VehicleTypeRate", "add")

            });

            return coefficientsTab ;

        },

        _createTab: function(tabContainer, params) {

            require([
                "components/DocumentList"
            ], dojo.hitch(this, function(
                DocumentList
            ){

                var documentList = new DocumentList({

                    title: params.title,

                    repository: this.repository,

                    searchTemplatesPath: params.searchTemplatesPath,

                    toolbarDef: params.toolbarDef,

                    entryTemplate: params.entryTemplate

                });

                tabContainer.addChild(documentList);

            }));

        },

        _addDocumentAction: function(repository, items, callback, teamspace, resultSet, parameterMap) {

            console.log("[ESBDACFeature] _addDocumentAction, arguments: ", arguments);

            var widget = parameterMap.widget ;

            var entryTemplate = widget.entryTemplate ;

            require([
                "components/AddDocumentDialog"
            ], dojo.hitch(this, function(
                AddDocumentDialog
            ){

                var dialog = new AddDocumentDialog();

                dialog.show({

                    entryTemplate: entryTemplate,

                    callback: dojo.hitch(this, function(contentItem){

                        console.log("contentItem: ", contentItem);

                    })

                });

            }));

        }

    });

});