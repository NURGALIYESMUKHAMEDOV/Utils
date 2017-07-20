define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "ecm/model/Action",
    "ecm/LoggerMixin"
], function(
    declare,
    lang,
    array,
    Action,
    LoggerMixin
) {

	var ComponentsPluginAction = declare("components.ComponentsPluginAction", [
	    Action,
	    LoggerMixin
    ], {


    });

    return ComponentsPluginAction ;

})