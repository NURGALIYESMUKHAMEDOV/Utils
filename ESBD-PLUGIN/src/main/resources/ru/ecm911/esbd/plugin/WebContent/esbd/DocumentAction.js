define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "ecm/model/Action",
    "ecm/LoggerMixin",
    "./ActionHelper"
], function(
    declare,
    lang,
    array,
    Action,
    LoggerMixin,
    ActionHelper
) {

	var ComponentsPluginAction = declare("esbd.DocumentAction", [
	    Action,
	    LoggerMixin
    ], {

        canPerformAction: function(repository, items, listType, teamspace, resultSet) {

            var canPerform = false ;

            if (items && items.length == 1) {

                // выполняется только для одного элемента

                var contentItem = items[0];

                // проверяем по id действий

                switch (this.id) {

                    case "ESBDSaveDocumentAction" : canPerform = ActionHelper.canSaveDocument(contentItem); break ;

                    case "ESBDCancelAndCreateDocumentAction" : canPerform = ActionHelper.canCancelDocument(contentItem); break ;

                    case "ESBDCancelDocumentAction" : canPerform = ActionHelper.canCancelDocument(contentItem); break ;

                    case "ESBDCancelDueDuplicateDocumentAction" : canPerform = ActionHelper.canCancelDocument(contentItem); break ;

                    case "ESBDCancelDueErrorDocumentAction" : canPerform = ActionHelper.canCancelDocument(contentItem); break ;

                    default: canPerform = false ;

                }

            }

            return canPerform ;

        }


    });

    return ComponentsPluginAction ;

})