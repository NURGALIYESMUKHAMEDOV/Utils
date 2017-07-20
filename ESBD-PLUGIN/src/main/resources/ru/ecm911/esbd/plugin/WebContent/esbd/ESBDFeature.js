define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/json",
    "dojo/_base/array",
    "dijit/MenuItem",
    "dijit/layout/ContentPane",
    "ecm/model/SearchQuery",
    "ecm/model/Request",
    "ecm/model/ResultSet",
    "ecm/model/EntryTemplate",
    "ecm/widget/layout/_LaunchBarPane",
    "ecm/widget/dialog/MessageDialog",
    "ecm/widget/listView/ContentList",
    "esbd/contract/insurance/InsuranceTab",
    "esbd/cases/CaseList",
    "esbd/cases/AddCaseDialog",
    "esbd/contract/ContractList",
    "esbd/contract/ContractTab",
    "esbd/cases/CaseTab",
    "esbd/contract/AddContractDialog",
    "esbd/action/ActionDialog",
    "components/Configuration",
    "dojo/text!./templates/ESBDFeature.html"
],function(
    declare,
    lang,
    connect,
    json,
    array,
    MenuItem,
    ContentPane,
    SearchQuery,
    Request,
    ResultSet,
    EntryTemplate,
    _LaunchBarPane,
    MessageDialog,
    ContentList,
    InsuranceTab,
    CaseList,
    AddCaseDialog,
    ContractList,
    ContractTab,
    CaseTab,
    AddContractDialog,
    ActionDialog,
    Configuration,
    template
) {

    return declare("esbd.ESBDFeature", [
        _LaunchBarPane
    ], {

        templateString: template,

        widgetsInTemplate: true,

        // репозиторий приложения (данные должны быть получены из конфигурации плагина)
        repository: null,

        // конфигурационные данные приложения (должны быть получены из плагина)
        configuration: null,

        // список страховых компаний, доступных пользователю
        // массив объектов ecm.model.ContentItem
        companies: [],

        // текущая выбранная компания, ecm.model.ContentItem
        selectedCompany: null,

        // список открытых вкладок по идентификатором
        // элементов, отображаемых в них
        tabs: [],

        postCreate: function() {

            this.configuration = new Configuration(this.feature.pluginConfiguration);

            this.repository = this.configuration.repository;

            connect.connect(this._companyBox, "onChange", this, "_onCompanyChange");

            lang.setObject("ESBDSaveDocumentAction", this._saveDocumentAction);

            //lang.setObject("ESBDCancelAndCreateDocumentAction", dojo.hitch(this, function(repository, items, callback, teamspace, resultSet, parameterMap, action){ this._processAction(repository, items, callback, teamspace, resultSet, parameterMap, action); }));

            lang.setObject("ESBDCancelDueDuplicateDocumentAction", dojo.hitch(this, function(repository, items, callback, teamspace, resultSet, parameterMap, action){ this._processAction(repository, items, callback, teamspace, resultSet, parameterMap, action); }));

            lang.setObject("ESBDCancelDueErrorDocumentAction", dojo.hitch(this, function(repository, items, callback, teamspace, resultSet, parameterMap, action){ this._processAction(repository, items, callback, teamspace, resultSet, parameterMap, action); }));

            lang.setObject("ESBDCancelDocumentAction", dojo.hitch(this, function(repository, items, callback, teamspace, resultSet, parameterMap, action){ this._processAction(repository, items, callback, teamspace, resultSet, parameterMap, action); }));

/*

            // регистрируем обработчик на выход из сессии

            connect.connect(ecm.model.desktop, "onLogout", this, "reset");

            // загружаем конфигурацию

            var data = json.parse(this.feature.pluginConfiguration);

            this.repository = ecm.model.desktop.getRepositoryByName(data.repositoryId);

            if (this.repository.connected) {

                this._retrieveConfiguration();

            } else {

                connect.connect(this.repository, "onConnected", this, "_onConnected");

            }

            // регистрируем обработчики событий

            lang.setObject("addContractAction", dojo.hitch(this, this.addContractAction));

            lang.setObject("openContractAction", dojo.hitch(this, this.openContractAction));


            lang.setObject("addCase", dojo.hitch(this, this._addCase));

            lang.setObject("openCaseAction", dojo.hitch(this, this.openCaseAction));


            lang.setObject("saveContract", dojo.hitch(this, this._saveContract));

            lang.setObject("recissionDueDuplicateAction", dojo.hitch(this, this._recissionDueDuplicateAction));

            lang.setObject("recissionDueErrorAction", dojo.hitch(this, this._recissionDueErrorAction));

            lang.setObject("earlyRecissionAction", dojo.hitch(this, this._earlyRecissionAction));

            lang.setObject("addObject", dojo.hitch(this, this._addObject));

            lang.setObject("addClient", dojo.hitch(this, function(repository, items, callback, teamspace, resultSet, parameterMap) {

                if (resultSet && resultSet.onAdd) {

                    resultSet.onAdd();

                }

            }));

            lang.setObject("addVehicle", dojo.hitch(this, function(repository, items, callback, teamspace, resultSet, parameterMap) {

                if (resultSet && resultSet.onAdd) {

                    resultSet.onAdd();

                }

            }));
*/

        },

        // очищает данные в окне приложения
        _clearTabs: function() {

            var tabs = this.tabContainer.getChildren();

            array.forEach(tabs, function(tab){

                this.tabContainer.removeChild(tab);

                tab.destroyRecursive();

            }, this);

            delete this.tabs ;

            this.tabs = {};

        },

        // добавляет страницы согласно конфигурации
        _createPages: function() {

            var pages = this.configuration.getPages();

            array.forEach(pages, function(page){

                require([
                    "components/DocumentList",
                    "components/DocumentPane"
                ], dojo.hitch(this, function(
                    DocumentList,
                    DocumentPane
                ){

                    var contentPane = new ContentPane({

                        title: page.title

                    });

                    var documentList = new DocumentList({

                        repository: this.repository,

                        params: page.config,

                        onOpen: dojo.hitch(this, function(contentItem, params){

                            if (this.tabs[contentItem.id]) {

                                this.tabContainer.selectChild(this.tabs[contentItem.id]);

                            } else {

                                console.log("params: ", params);

                                contentItem.retrieveAttributes(dojo.hitch(this, function(){

                                    var name = contentItem.getValue("{NAME}") || contentItem.getValue("DocumentTitle") || "" ;

                                    var contentPane = new DocumentPane({

                                        repository: this.repository,

                                        toolbarDef: "ESBDDocumentMenuType",

                                        title: name,

                                        params: params,

                                        closable: true,

                                        onClose: dojo.hitch(this, function() {

                                            this.tabContainer.removeChild(contentPane);

                                            if (contentPane.destroyRecursive && lang.isFunction(contentPane.destroyRecursive)) {

                                                contentPane.destroyRecursive();

                                            }

                                            contentPane.destroy();

                                            // как только вкладка закрывается, удаляем информацию из списка
                                            // открытых вкладок

                                            delete this.tabs[contentItem.id];

                                        })

                                    });

                                    contentPane.set("contentItem", contentItem);

                                    this.tabContainer.addChild(contentPane);

                                    this.tabContainer.selectChild(contentPane);

                                    this.tabs[contentItem.id] = contentPane ;

                                }));

                            }

                        })

                    });

                    contentPane.addChild(documentList);

                    this.tabContainer.addChild(contentPane) ;

                }));

            }, this);

        },

        // сбрасывает состояние приложения
        reset: function() {

            this._clearTabs();

            this.needReset = false ;

        },

        // формирует контент
        loadContent: function() {

            this._companyBox.initialize(this.repository);

        },

        // обработчик выбора компании из списка
        _onCompanyChange: function(selectedItem) {

            // регистрируем выбранный департамент в сессии пользователя

           /* var requestParams = {
                name: "selectCompany",
                id: selectedItem.id.split(",")[2],
                repositoryId: selectedItem.repository.id
            };

            requestParams = Request.setSecurityToken(requestParams);

            Request.invokePluginService("ESBDPlugin", "CommonService", {
                requestParams: requestParams,
                requestCompleteCallback: dojo.hitch(this, dojo.hitch(this, function(response){

                    if (response && response.id) {

                        this.company = selectedItem ;

                        this.repository.clearContentClassesCache();

                        this.repository.clearSearchTemplates();

                        // удаляем все существующие вкладки

                        this._clearTabs();

                        // Создаем вкладки

                        this._createPages();

                    }

                }))

            });*/

            this._clearTabs();

            this._createPages();

        },

        _saveDocumentAction: function(repository, items, callback, teamspace, resultSet, parameterMap) {

            console.log("[ESBDFeature] _saveDocumentAction, arguments: ", arguments);

            require([
                "components/ActionHandler"
            ], dojo.hitch(this, function(
                ActionHandler
            ){

                ActionHandler.saveDocumentAction(repository, items, dojo.hitch(this, function(){

                }), teamspace, resultSet, parameterMap);

            }));

        },

        _processAction: function(repository, items, callback, teamspace, resultSet, parameterMap, action) {

            console.log("[ESBDFeature] _processAction, arguments: ", arguments);

            console.log("[ESBDFeature] configuration: ", this.configuration);

            var contentItem = items[0];

            var actionDescriptions = this.configuration.configuration.actions ;

            var actionDescriptions = array.filter(actionDescriptions, function(actionDesc){

                return actionDesc.id == action.id ;

            }, this);

            if (actionDescriptions && actionDescriptions[0]) {

                var actionDesc = actionDescriptions[0];

                if (actionDesc.entryTemplate && typeof actionDesc.entryTemplate === "string") {

                    actionDesc.entryTemplate = new EntryTemplate({
                        repository: repository,
                        id: actionDesc.entryTemplate
                    });

                }

                if (typeof actionDesc.contentClass === "string") {

                    actionDesc.contentClass = repository.getContentClass(actionDesc.contentClass);

                }

                var dialog = new ActionDialog();

                dialog.show({

                    repository: repository,

                    contentClass: actionDesc.contentClass,

                    entryTemplate: actionDesc.entryTemplate,

                    contentItem: contentItem,

                    title: actionDesc.title,

                    description: actionDesc.description,

                    onSuccess: dojo.hitch(this, function() {

                        dialog.hide();

                    })

                })


            }

            // ищем описание действия в конфигурации

            /*

            var contentItem = items[0];

            var actionConfig = this.configuration.actions[name];

            if (actionConfig && actionConfig.entryTemplate) {

                var contentClass = this.repository.getContentClass(name);

                if (typeof actionConfig.entryTemplate === "string") {

                    // если в конфигурации указан идентификатор, а не сам EntryTemplate, исправляем это

                    actionConfig.entryTemplate = new EntryTemplate({
                        repository: this.repository,
                        id: actionConfig.entryTemplate
                    });

                }

                var dialog = new ActionDialog();

                dialog.show({

                    repository: this.repository,

                    contentClass: contentClass,

                    entryTemplate: actionConfig.entryTemplate,

                    contentItem: contentItem,

                    title: actionConfig.title,

                    introText: actionConfig.introText,

                    onSuccess: dojo.hitch(this, function() {

                        dialog.hide();

                    })

                })

            } else {

                console.log("Ошибка получения конфигурационных данных для действия \"ESBD_RecissionDueDuplicateAction\"");

            }

            */

        },

        /*

        _createCasesTab: function() {

            var contentPane = new ContentPane({

                title: "Страховые случаи"

            });

            var caseList = new CaseList();

            contentPane.addChild(caseList);

            return contentPane ;

        },

        _createContractsTab: function() {

            var contentPane = new ContentPane({

                title: "Страховые договора"

            });

            var contractList = new ContractList();

            contentPane.addChild(contractList);

            return contentPane ;

        },

        _createTab: function(tabContainer, params) {

            require([
                "components/DocumentList"
            ], dojo.hitch(this, function(
                DocumentList
            ){

                var contentPane = new ContentPane({

                    title: params.title

                });

                var documentList = new DocumentList({

                    repository: params.repository,

                    searchTemplatesPath: params.searchTemplatesPath,

                    entryTemplate: params.entryTemplate

                });

                contentPane.addChild(documentList);

                tabContainer.addChild(contentPane) ;

            }))

        },

        _createInsuranceTab: function(item) {

            var tab = new ContentPane({
                title: "Страховой полис № " + item.getValue("ESBD_InsuranceCertificateNumber"),
                closable: true,
                style: 'padding: 10px 5px'
            });

            var insuranceTab = new InsuranceTab({
                readOnly: true,
                onOpen: dojo.hitch(this, function(newItem){
                    this._createInsuranceTab(newItem);
                })
            });

            insuranceTab.setValue(item);

            tab.addChild(insuranceTab);

            this.tabContainer.addChild(tab);

            this.tabContainer.selectChild(tab);

        },

        _addCase: function() {

            var dialog = new AddCaseDialog({

                repository: this.repository,

                configuration: this.configuration,

                onSuccess: dojo.hitch(this, function(contentItem){

                    dialog.hide();

                })

            });

            dialog.show();

        },

        addContractAction: function(repository, items, callback, teamspace, resultSet, parameterMap) {

            var dialog = new AddContractDialog({

                onSuccess: function(contentItem) {

                    dialog.hide();

                }

            });

            dialog.show({

                company: null,

                repository: this.repository,

                configuration: this.configuration,

                rootClass: this.repository.getContentClass("ESBD_Contract"),

                contentClass: this.repository.getContentClass("ESBD_InsuranceContract")

            });

        },

        openContractAction: function(repository, items, callback, teamspace, resultSet, parameterMap) {

            console.log("[ESBDFeature] openContractAction, arguments: ", arguments);

            if (lang.isArray(items) && items.length > 0) {

                // необходимо открыть вкладку с выбранным объектом

                var contentItem = items[0];

                console.log("[ESBDFeature] openContractAction, contentItem: ", contentItem);

                // проверяем на наличие уже открытой вкладки

                if (this.tabs[contentItem.id]) {

                    // если есть, просто переходим на нее

                    var tab = this.tabs[contentItem.id];

                    this.tabContainer.selectChild(tab);

                    return;

                }

                // получаем все данные указанного объекта

                var createTab = dojo.hitch(this, function(name, entryTemplate){

                    var tab = new ContractTab({

                        title: name,

                        closable: true,

                        repository: this.repository,

                        contentItem: contentItem,

                        entryTemplate: entryTemplate,

                        onClose: dojo.hitch(this, function() {

                            this.tabContainer.removeChild(tab);

                            if (tab.destroyRecursive && lang.isFunction(tab.destroyRecursive)) {

                                tab.destroyRecursive();

                            }

                            tab.destroy();

                            // как только вкладка закрывается, удаляем информацию из списка
                            // открытых вкладок

                            delete this.tabs[contentItem.id];

                        })

                    });

                    // tab.addChild(contractTab);

                    this.tabs[contentItem.id] = tab;

                    this.tabContainer.addChild(tab);

                    this.tabContainer.selectChild(tab);

                });

                contentItem.retrieveAttributes(dojo.hitch(this, function(){

                    var name = contentItem.getValue("DocumentTitle") || "Нет наименование" ;

                    var entryTemplate = this.configuration.entryTemplates.create[contentItem.template];

                    if (typeof entryTemplate === "string") {

                        entryTemplate = new EntryTemplate({
                            repository: this.repository,
                            id: entryTemplate
                        });

                        this.configuration.entryTemplates.create[contentItem.template] = entryTemplate ;

                    }

                    if (entryTemplate.isRetrieved) {

                        createTab(name, entryTemplate);

                    } else {

                        entryTemplate.retrieveEntryTemplate(dojo.hitch(this, function(entryTemplate){

                            this.configuration.entryTemplates.create[contentItem.template] = entryTemplate ;

                            createTab(name, entryTemplate);

                        }), false, true);

                    }

                }));

            }

        },

        openCaseAction: function(repository, items, callback, teamspace, resultSet, parameterMap) {

            if (lang.isArray(items) && items.length > 0) {

                // необходимо открыть вкладку с выбранным объектом

                var contentItem = items[0];

                // получаем все данные указанного объекта

                contentItem.retrieveAttributes(dojo.hitch(this, function(){

                    var name = contentItem.getValue("DocumentTitle") || "Нет наименование" ;

                    var tab = new ContentPane({
                        title: name,
                        closable: true
                    });

                    var caseTab = new CaseTab({
                        repository: this.repository,
                        contentItem : contentItem
                    });

                    tab.addChild(caseTab);

                    this.tabContainer.addChild(tab);

                    this.tabContainer.selectChild(tab);

                }));

            }

        },

        _saveContract: function(repository, items, callback, teamspace, resultSet, parameterMap) {

            console.log("_saveContract, arguments: ", arguments);

            if (lang.isArray(items) && items.length > 0) {

                // необходимо открыть вкладку с выбранным объектом

                var contentItem = items[0];

                // получить свойства

                var widget = parameterMap.widget ;

                var propertiesPane = widget.propertiesPane ;

                var properties = propertiesPane.getPropertiesJSON(true, true, false);

                contentItem.saveAttributes(
                    properties,
                    null,
                    null,
                    null,
                    false,
                    dojo.hitch(this, function(){

                        var messageDialog = new MessageDialog({

                            text: "Документ успешно сохранен",

                            onCancel: dojo.hitch(this, function() {

                                // переоткрыть документ

                                this.repository.retrieveItem(contentItem.id, dojo.hitch(this, function(contentItem){

                                    var tab = this.tabs[contentItem.id];

                                    tab.set("contentItem", contentItem);

                                }));

                            })

                        });

                        messageDialog.show();

                    }),
                    false,
                    dojo.hitch(this, function(){

                        console.log("[ESBDFeature] _saveContract, save failed");

                    })
                );

            }

        },

        _recissionDueDuplicateAction: function(repository, items, callback, teamspace, resultSet, parameterMap) {

            this._processAction("ESBD_RecissionDueDuplicateAction", repository, items, callback, teamspace, resultSet, parameterMap);

        },

        _recissionDueErrorAction: function(repository, items, callback, teamspace, resultSet, parameterMap) {

            this._processAction("ESBD_RecissionDueErrorAction", repository, items, callback, teamspace, resultSet, parameterMap);

        },

        _earlyRecissionAction: function(repository, items, callback, teamspace, resultSet, parameterMap) {

            this._processAction("ESBD_EarlyRecissionAction", repository, items, callback, teamspace, resultSet, parameterMap);

        },

        _processAction: function(name, repository, items, callback, teamspace, resultSet, parameterMap) {

            console.log("Вызов действия \"" + name + "\", arguments: ", arguments);

            // ищем описание действия в конфигурации

            var contentItem = items[0];

            var actionConfig = this.configuration.actions[name];

            if (actionConfig && actionConfig.entryTemplate) {

                var contentClass = this.repository.getContentClass(name);

                if (typeof actionConfig.entryTemplate === "string") {

                    // если в конфигурации указан идентификатор, а не сам EntryTemplate, исправляем это

                    actionConfig.entryTemplate = new EntryTemplate({
                        repository: this.repository,
                        id: actionConfig.entryTemplate
                    });

                }

                var dialog = new ActionDialog();

                dialog.show({

                    repository: this.repository,

                    contentClass: contentClass,

                    entryTemplate: actionConfig.entryTemplate,

                    contentItem: contentItem,

                    title: actionConfig.title,

                    introText: actionConfig.introText,

                    onSuccess: dojo.hitch(this, function() {

                        dialog.hide();

                    })

                })

            } else {

                console.log("Ошибка получения конфигурационных данных для действия \"ESBD_RecissionDueDuplicateAction\"");

            }

        },

        _addObject: function(repository, items, callback, teamspace, resultSet, parameterMap) {

            console.log("addObject, arguments: ", arguments);

            if (resultSet.onAdd) {

                resultSet.onAdd();

            }

        }

        */

    });

});