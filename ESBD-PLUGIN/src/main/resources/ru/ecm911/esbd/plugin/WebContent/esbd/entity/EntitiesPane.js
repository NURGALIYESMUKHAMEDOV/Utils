/**
 * Компонент реализует работу со списком клиентов,
 * юридических лиц, включая функцию добавления и
 * изменения информации о клиенте
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dijit/form/Button",
    "esbd/entity/EntityList",
    "esbd/entity/EntityDialog"
],function(
    declare,
    lang,
    ContentPane,
    BorderContainer,
    Button,
    EntityList,
    EntityDialog
) {

    return declare("esbd.entity.EntitiesPane", [
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

            this.entityList = new EntityList({
                onSelect: dojo.hitch(this, function(item){
                    this.onSelect(item);
                })
            });

            container.addChild(this.entityList);

        },

        _onAdd: function(evt) {

        },

        onSelect: function(item) {

            var dialog = new EntityDialog();

            dialog.setValue(item);

            dialog.show();

        }

    });

});