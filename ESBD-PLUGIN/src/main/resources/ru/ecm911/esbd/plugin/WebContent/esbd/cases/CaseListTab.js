/**
 * Компонент реализует работу со списком документов
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dijit/form/Button",
    "ecm/model/ContentItem",
    "esbd/cases/CaseList"
],function(
    declare,
    lang,
    domStyle,
    ContentPane,
    BorderContainer,
    Button,
    ContentItem,
    CaseList
) {

    return declare("esbd.cases.CaseListTab", [
        BorderContainer
    ], {

        postCreate: function() {

            this.inherited(arguments);

            var center = new ContentPane({
                region: "center",
                style: "overflow: auto"
            });

            this.caseList = new CaseList({
                onOpen: this.onOpen
            });

            center.addChild(this.caseList);

            this.addChild(center);

        },

        _onAdd: function(evt) {

            var repository = ecm.model.desktop.repositories[0];

            repository.retrieveContentClassList(dojo.hitch(this, function(contentClasses){

                var contentClass = contentClasses[0];

                contentClass.retrieveAttributeDefinitions(dojo.hitch(this, function(attributeDefinitions){

                    var value = new ContentItem();

                    for (var index = 0; index < attributeDefinitions.length; index++) {

                        var attributeDefinition = attributeDefinitions[index];

                        if (attributeDefinition.system) {

                            continue ;

                        }

                        value.setValue(attributeDefinition.id, null);

                    }

                    value.setValue("ASDO_Status", "Новый");

                    this.onSelect(value);

                }))

            }), ["ASDO_ArchivedBundle"]);

        },

        onSelect: function(item) {
        },

        onOpen: function(contentItem) {

            console.log("[CaseListTab] onOpen, contentItem: ", contentItem);

        }

    });

});