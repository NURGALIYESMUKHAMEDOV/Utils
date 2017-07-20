/**
 * Компонент отображает информацию страхователе. При этом
 * страхователь может является как физическим так и юридическим
 * лицом
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dijit/layout/StackContainer",
    "dijit/layout/StackController",
    "dijit/form/Button",
    "ecm/widget/DropDownButton",
    "dijit/DropDownMenu",
    "dijit/MenuItem",
    "esbd/person/PersonBox",
    "esbd/entity/EntityBox",
    "esbd/person/SelectPersonDialog",
    "esbd/entity/SelectEntityDialog"
],function(
    declare,
    lang,
    ContentPane,
    BorderContainer,
    StackContainer,
    StackController,
    Button,
    DropDownButton,
    DropDownMenu,
    MenuItem,
    PersonBox,
    EntityBox,
    SelectPersonDialog,
    SelectEntityDialog
) {

    return declare("esbd.contract.insurance.InsurerBox", [
        BorderContainer
    ], {

        value: null,
        readOnly: false,
        selectPersonDialog: null,
        selectEntityDialog: null,

        postCreate: function() {

            this.inherited(arguments);

            this.set("design", "sidebar");

            var buttonsPane = new ContentPane({
                region: "top"
            });

            var menu = new DropDownMenu({style: "display: none"});

            var personItem = new MenuItem({
                label: "Физическое лицо",
                onClick: dojo.hitch(this, function(){
                    this._onLookup("person");
                })
            });

            menu.addChild(personItem);

            var entityItem = new MenuItem({
                label: "Юридическое лицо",
                onClick: dojo.hitch(this, function(){
                    this._onLookup("entity");
                })
            });

            menu.addChild(entityItem);

            var button = new DropDownButton({
                label: "Найти",
                dropDown: menu
            });

            buttonsPane.addChild(button);

            if (this.readOnly) {

                buttonsPane.domNode.style.display = "none" ;

            }

            var insurerPane = new ContentPane({
                region: "center"
            });

            // отображает либо панель поиска физических лиц,
            // либо панель поиска юридических лиц
            this.insurerStackPane = new StackContainer({
                style: "overflow: auto"
            });

            // пустая панель
            this.emptyPane = new ContentPane({
                content: "Страхователь не указан"
            });

            this.insurerStackPane.addChild(this.emptyPane);

            // панель для работы с физическими лицами
            this.personBox = new PersonBox({
                readOnly: this.readOnly
            });

            this.insurerStackPane.addChild(this.personBox);

            // панель для работы с юридическими лицами
            this.entityBox = new EntityBox({
                readOnly: this.readOnly
            });

            this.insurerStackPane.addChild(this.entityBox);

            this.insurerStackPane.selectChild(this.emptyPane);

            insurerPane.addChild(this.insurerStackPane);

            this.addChild(buttonsPane);

            this.addChild(insurerPane);

        },

        _onLookup: function(type) {

            if (type == "person") {

                if (!this.selectPersonDialog) {

                    this.selectPersonDialog = new SelectPersonDialog({

                        onSelect: dojo.hitch(this, function(person){

                            this.selectPersonDialog.hide();

                            this.setValue(person, true);

                        })

                    });

                }

                this.selectPersonDialog.show();

            } else if (type == "entity") {

                if (!this.selectEntityDialog) {

                    this.selectEntityDialog = new SelectEntityDialog({

                        onSelect: dojo.hitch(this, function(entity){

                            this.selectEntityDialog.hide();

                            this.setValue(entity, true);

                        })

                    });

                }

                this.selectEntityDialog.show();

            }

        },

        _getSelectedPane: function() {

            if (this.value && this.value.template == "ESBD_Person") {

                return this.personBox ;

            } else if (this.value && this.value.template == "ESBD_Entity") {

                return this.entityBox ;

            } else {

                return null ;

            }

        },

        getValue: function() {

            this._getLocalValue();

            return this.value;

        },

        _getLocalValue: function() {

            if (this.value) {

                if (this._getSelectedPane()) {

                    var properties = this._getSelectedPane().getValue();

                    for (var i = 0; i < properties.length; i++) {

                        var property = properties[i];

                        if (this.value.attributes[property.name]) {

                            this.value.setValue(property.name, property.value);

                        }

                    }

                }

            }

        },

        /**
         * Устанавливает значение ecm.model.ContentItem
         * для отображения информации о страхователе
         *
         */
        setValue: function(value, notify) {

            this.value = value ;

            this._setLocalValue();

            if (notify) {

                this.onUpdate(this.value);

            }

        },

        _setLocalValue: function() {

            if (!this.value) return ;

            if (this.value.template == "ESBD_Person") {

                this.personBox.setValue(this.value);

                this.insurerStackPane.selectChild(this.personBox);

            } else if (this.value.template == "ESBD_Entity") {

                this.entityBox.setValue(this.value);

                this.insurerStackPane.selectChild(this.entityBox);

            }

        },

        isDirty: function() {

            return this._getSelectedPane().isDirty;

        },

        onUpdate: function(value) {
        }

    });

});