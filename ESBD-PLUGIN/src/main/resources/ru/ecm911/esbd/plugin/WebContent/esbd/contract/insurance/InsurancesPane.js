define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dijit/form/Button",
    "dijit/DropDownMenu",
    "dijit/MenuItem",
    "ecm/model/ContentItem",
    "ecm/widget/DropDownButton",
    "ecm/widget/dialog/YesNoCancelDialog",
    "esbd/contract/insurance/InsuranceList",
    "esbd/contract/insurance/AddInsuranceDialog"
],function(
    declare,
    lang,
    ContentPane,
    BorderContainer,
    Button,
    DropDownMenu,
    MenuItem,
    ContentItem,
    DropDownButton,
    YesNoCancelDialog,
    InsuranceList,
    AddInsuranceDialog
) {

    return declare("esbd.contract.insurance.InsurancesPane", [
        BorderContainer
    ], {

        company: null,  // страховая компания

        postCreate: function() {

            this.inherited(arguments);

            var buttons = new ContentPane({
                region: "top",
                style: "padding: 8px"
            });

            var addButton = new Button({
                label: "Добавить",
                onClick: dojo.hitch(this, function(){
                    this._onAdd();
                })
            });

            buttons.addChild(addButton);

            this.addChild(buttons);

            var container = new ContentPane({
                region: "center",
                style: "overflow: auto"
            });

            this.addChild(container);

            this.documentList = new InsuranceList({

                onSelect: dojo.hitch(this, function(item){

                    this.onSelect(item);

                })

            });

            container.addChild(this.documentList);

            this.watch("company", dojo.hitch(this, function(name, oldValue, value){

                this.documentList.set("company", value);

            }))

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

                    value.setValue("ESBD_CompanyCode", this.company.getValue("ESBD_CompanyCode"));

                    var dialog = new AddInsuranceDialog({
                        company: this.documentList.get("company"),
                        value: value,
                        onSubmit: dojo.hitch(this, function(item){
                            dialog.hide();
                        })
                    });

                    dialog.show();

                }))

            }), ["ESBD_InsuranceContract"]);

        },

        onSelect: function(item) {

        }

    });

});