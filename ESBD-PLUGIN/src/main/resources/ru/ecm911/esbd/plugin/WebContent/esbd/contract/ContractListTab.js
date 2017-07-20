define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dijit/form/Button",
    "ecm/model/ContentItem",
    "esbd/contract/ContractList"
],function(
    declare,
    lang,
    domStyle,
    ContentPane,
    BorderContainer,
    Button,
    ContentItem,
    ContractList
) {

    return declare("esbd.contract.ContractListTab", [
        BorderContainer
    ], {

        postCreate: function() {

            this.inherited(arguments);

            var center = new ContentPane({
                region: "center",
                style: "overflow: auto"
            });

            this.contractList = new ContractList({
                onOpen: this.onOpen
            });

            center.addChild(this.contractList);

            this.addChild(center);

        },

        _onAdd: function(evt) {

            var repository = ecm.model.desktop.repositories[0];

            var contentClass = repository.getContentClass("ESBD_InsuranceContract");

            contentClass.retrieveAttributeDefinitions(dojo.hitch(this, function(attributeDefinitions){

                var contentItem = new ContentItem();

                for (var index = 0; index < attributeDefinitions.length; index++) {

                    var attributeDefinition = attributeDefinitions[index];

                    if (attributeDefinition.system) {

                        continue ;

                    }

                    contentItem.setValue(attributeDefinition.id, null);

                }

                this.onSelect(value);

            }));

        },

        onSelect: function(contentItem) {
        },

        onOpen: function(contentItem) {
        }

    });

});