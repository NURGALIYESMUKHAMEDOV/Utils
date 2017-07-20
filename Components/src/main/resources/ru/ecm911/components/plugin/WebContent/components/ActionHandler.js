define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/json",
    "dojo/Deferred",
    "dojo/promise/all",
    "ecm/model/Request",
    "ecm/widget/dialog/MessageDialog",
    "components/AddDocumentDialog",
    "components/AdjustEntryTemplateDialog"
],function(
    declare,
    lang,
    array,
    json,
    Deferred,
    all,
    Request,
    MessageDialog,
    AddDocumentDialog,
    AdjustEntryTemplateDialog
) {

    var ActionHandler = declare("components.ActionHandler", [], {

    });

    ActionHandler.addDocumentAction = function(repository, items, callback, teamspace, resultSet, parameterMap, action) {

        console.log("[ComponentsPlugin] addDocumentAction, arguments: ", arguments);

        var widget = parameterMap.widget ;

        var params = widget.params ;

        if (params.add) {

            var dialog = new AddDocumentDialog({
                repository: repository
            });

            dialog.show(params.add, dojo.hitch(this, function(contentItem){

                if (callback) {

                    callback(action, contentItem);

                }

            }));

        }

    };

    ActionHandler.openDocumentAction = function(repository, items, callback, teamspace, resultSet, parameterMap) {

        console.log("[ComponentsPlugin] openDocumentAction, arguments: ", arguments);

        var contentItem = items[0];

        var widget = parameterMap.widget ;

        var params = widget.params ;

        if (widget.onOpen) {

            widget.onOpen(contentItem, params.modify);

        }

    };

    ActionHandler.saveDocumentAction = function(repository, items, callback, teamspace, resultSet, parameterMap) {

        console.log("[ComponentsPlugin] saveDocumentAction, arguments: ", arguments);

        if (lang.isArray(items) && items.length > 0) {

            var contentItem = items[0];

            var widget = parameterMap.widget ;

            var properties = widget.getPropertiesJSON(true, true, false);

            if (properties) {

                contentItem.saveAttributes(
                    properties,
                    null,
                    null,
                    null,
                    false,
                    dojo.hitch(this, function(){

                        var messageDialog = new MessageDialog({

                            onCancel: dojo.hitch(this, function() {

                                if (callback) {

                                    callback();

                                }

                            })

                        });

                        messageDialog.showMessage("Документ успешно сохранен");

                    }),
                    false,
                    dojo.hitch(this, function(){

                        var messageDialog = new MessageDialog();

                        messageDialog.showMessage("Ошибка сохранения документа");

                    })
                );

            }

        }

    };

    ActionHandler.deleteDocumentAction = function(repository, items, callback, teamspace, resultSet, parameterMap) {

        console.log("[ComponentsPlugin] deleteDocumentAction, arguments: ", arguments);

    };

    ActionHandler.adjustEntryTemplateAction = function(repository, items, callback, teamspace, resultSet, parameterMap) {

        console.log("[ComponentsPlugin] adjustEntryTemplateAction, arguments: ", arguments);

        array.forEach(items, function(item){

            // необходимо заменить ид хранилища объектов
            // необходимо сделать mapping по учетным именам

            // получить информацию по текущим данным (сервис)
            // в диалоговом окне вывести информацию и выполнить mapping
            // на основании mapping-а выполнить замену (сервис)

            var dialog = new AdjustEntryTemplateDialog();

            dialog.show(item, dojo.hitch(this, function(values) {

                var params = {
                    id: item.id.split(",")[2],
                    repositoryId: item.repository.id,
                    oval: values.oval,
                    nval: values.nval
                };

                params = Request.setSecurityToken(params);

                Request.invokePluginService("ComponentsPlugin", "AdjustEntryTemplateService", {
                    requestParams: params,
                    requestCompleteCallback: dojo.hitch(this, dojo.hitch(this, function(response){

                        console.log("response: ", response);

                    }))

                });

            }));

        }, this);

    };

    return ActionHandler ;


});