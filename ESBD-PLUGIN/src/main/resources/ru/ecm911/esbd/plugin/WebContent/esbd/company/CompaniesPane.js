/**
 * Компонент реализует работу со списком страховых компаний
 * включая функцию добавления и изменения информации
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dijit/form/Button",
    "esbd/company/CompanyList",
    "esbd/company/CompanyDialog"
],function(
    declare,
    lang,
    ContentPane,
    BorderContainer,
    Button,
    CompanyList,
    CompanyDialog
) {

    return declare("esbd.company.CompaniesPane", [
        BorderContainer
    ], {

        postCreate: function() {

            this.inherited(arguments);

            var buttons = new ContentPane({
                region: "top",
                style: "padding: 8px"
            });

            var button = new Button({
                label: "Добавить",
                onClick: dojo.hitch(this, function(){
                    this._onAdd();
                })
            });

            buttons.addChild(button);

            this.addChild(buttons);

            var container = new ContentPane({
                region: "center",
                style: "overflow: auto"
            });

            this.addChild(container);

            this.companyList = new CompanyList({
                onSelect: dojo.hitch(this, function(item){
                    this.onSelect(item);
                })
            });

            container.addChild(this.companyList);

        },

        _onAdd: function(evt) {

            var dialog = new CompanyDialog({
                onSelect: dojo.hitch(this, function(contentItem){
                    dialog.hide();
                })
            });

            dialog.setValue(null);

            dialog.show();

        },

        onSelect: function(item) {

            var repository = ecm.model.desktop.repositories[0];

            repository.retrieveItem(item.id, dojo.hitch(this, function(contentItem){

                contentItem.retrievePermissions(dojo.hitch(this, function(permissions){

                    var dialog = new CompanyDialog({
                        onSelect: dojo.hitch(this, function(contentItem){
                            dialog.hide();
                        })
                    });

                    dialog.setValue(contentItem);

                    dialog.show();

                }));

            }));

        }

    });

});