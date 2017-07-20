require([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/request/script",
    "ecm/model/EntryTemplate",
    "components/ActionHandler"
], function(
    declare,
    lang,
    script,
    EntryTemplate,
    ActionHandler
){

    console.log("Расширение 'Компоненты' загружено");

    EntryTemplate.registerControlRegistry("components/ControlRegistry");

    lang.setObject("ComponentsPlugin_AddDocumentAction", ActionHandler.addDocumentAction);

    lang.setObject("ComponentsPlugin_OpenDocumentAction", ActionHandler.openDocumentAction);

    lang.setObject("ComponentsPlugin_DeleteDocumentAction", ActionHandler.deleteDocumentAction);

    lang.setObject("ComponentsPlugin_AdjustEntryTemplateAction", ActionHandler.adjustEntryTemplateAction);

})