define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/json",
    "dojo/Deferred",
    "ecm/model/EntryTemplate"
],function(
    declare,
    lang,
    array,
    json,
    Deferred,
    EntryTemplate
) {

    var ActionHelper = declare("edbd.ActionHelper", [], {

    });

    ActionHelper.canSaveDocument = function(contentItem) {

        var status = contentItem.getValue("ESBD_Status");

        var privEditProperties = contentItem.hasPrivilege("privEditProperties");

        return privEditProperties && status != "Зарегистрирован" && status != "Аннулирован" ;

    };

    ActionHelper.canCancelDocument = function(contentItem) {

        var status = contentItem.getValue("ESBD_Status");

        return status == "Зарегистрирован" ;

    };

    return ActionHelper ;

});