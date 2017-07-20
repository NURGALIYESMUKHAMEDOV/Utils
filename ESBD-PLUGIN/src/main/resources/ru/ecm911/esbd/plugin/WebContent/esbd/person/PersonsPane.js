/**
 * Компонент реализует работу со списком клиентов,
 * физических лиц, включая функцию добавления и
 * изменения информации о клиенте
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dijit/form/Button",
    "esbd/person/PersonList",
    "esbd/person/PersonDialog"
],function(
    declare,
    lang,
    ContentPane,
    BorderContainer,
    Button,
    PersonList,
    PersonDialog
) {

    return declare("esbd.person.PersonsPane", [
        BorderContainer
    ], {

        postCreate: function() {

            this.inherited(arguments);

            var buttons = new ContentPane({
                region: "top"
            });

            var button = new Button({
                label: "Добавить",
                onClick: dojo.hitch(this, function(){
                    this._onAdd();
                })
            });

            var container = new ContentPane({
                region: "center",
                style: "overflow: auto"
            });

            this.addChild(container);

            this.personList = new PersonList({
                onSelect: dojo.hitch(this, function(item){
                    this.onSelect(item);
                })
            });

            container.addChild(this.personList);

        },

        _onAdd: function(evt) {

        },

        onSelect: function(item) {

            var dialog = new PersonDialog();

            dialog.setValue(item);

            dialog.show();

        }

    });

});