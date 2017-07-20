define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dijit/form/Button",
    "ecm/widget/DropDownButton",
    "dijit/DropDownMenu",
    "dijit/MenuItem",
    "ecm/widget/dialog/MessageDialog",
    "ecm/widget/TitlePane",
    "esbd/person/SelectPersonDialog",
    "esbd/entity/SelectEntityDialog",
    "esbd/contract/insurance/InsuredClientBox"
],function(
    declare,
    lang,
    ContentPane,
    BorderContainer,
    Button,
    DropDownButton,
    DropDownMenu,
    MenuItem,
    MessageDialog,
    TitlePane,
    SelectPersonDialog,
    SelectEntityDialog,
    InsuredClientBox
) {

    return declare("esbd.contract.insurance.InsuredClientList", [
        BorderContainer
    ], {

        value: null,
        readOnly: false,
        widgets: [],
        items: [],
        personDialog: null,
        entityDialog: null,

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
                    this._onAdd("person");
                })
            });

            menu.addChild(personItem);

            var entityItem = new MenuItem({
                label: "Юридическое лицо",
                onClick: dojo.hitch(this, function(){
                    this._onAdd("entity");
                })
            });

            menu.addChild(entityItem);

            var button = new DropDownButton({
                label: "Добавить",
                dropDown: menu
            });

            buttonsPane.addChild(button);

            if (this.readOnly) {

                buttonsPane.domNode.style.display = "none" ;

            }

            this.addChild(buttonsPane);

            var container = new ContentPane({
                region: "center",
                style: "overflow: auto"
            });

            this.addChild(container);

            // убираем функцию установки размера, так как
            // в противном случае панель будет во весь экран
            this.list = new ContentPane({
                style: "overflow: auto",
                resize: function(){}
            });

            container.addChild(this.list);

        },

        getValue: function() {

            this._getLocalValue();

            return this.value;

        },

        _getLocalValue: function() {

            var value = [];

            for (var i = 0; i < this.items.length; i++) {

                var item = this.items[i];

                value.push(item.getValue());

            }

            this.value = value ;

/*
            if (this.value) {

                for (var i = 0; i < this.items.length; i++) {

                    var item = this.items[i];

                    this.value[i] = item.getValue();

                }

            }
*/

        },

        setValue: function(value) {

            this.value = value;

            this._setLocalValue();

        },

        _setLocalValue: function() {

            // удалить все компоненты

            for (var i = 0; i < this.widgets.length; i++) {

                var widget = this.widgets[i];

                this.list.removeChild(widget);

            }

            // обнуляем массив
            this.widgets = [] ;

            this.items = [] ;

            // для каждого застрахованного создаем блок

            for (var i = 0; i < this.value.length; i++) {

                var insured = this.value[i];

                var widget = new TitlePane({
                    title: "Застрахованное лицо",
                    closable: !this.readOnly,
                    onClose: dojo.hitch(this, function(){
                        this._removeItem(widget);
                    })
                });

                var insuredClientBox = new InsuredClientBox({
                    readOnly: this.readOnly
                });

                insuredClientBox.setValue(insured);

                widget.addChild(insuredClientBox);

                this.list.addChild(widget);

                this.widgets.push(widget);

                this.items.push(insuredClientBox);

            }

        },

        addItem: function(item) {

            if (!this.value) {
                this.value = [] ;
            }

            this.value.push(item);

            var widget = new TitlePane({
                title: "Застрахованное лицо",
                closable: !this.readOnly,
                onClose: dojo.hitch(this, function(){
                    this._removeItem(widget);
                })
            });

            var insuredClientBox = new InsuredClientBox({
                readOnly: this.readOnly
            });

            insuredClientBox.setValue(item);

            widget.addChild(insuredClientBox);

            this.list.addChild(widget);

            this.widgets.push(widget);

            this.items.push(insuredClientBox);

        },

        _onAdd: function(type) {

            if (type == "person") {

                if (!this.personDialog) {

                    this.personDialog = new SelectPersonDialog({

                        onSelect: dojo.hitch(this, function(person){

                            // проверяем список застрахованных лиц на
                            // наличие

                            for (var i = 0; i < this.value.length; i++) {

                                var item = this.value[i];

                                console.log("item : ", item);

                                if (item.client.getValue("Id") == person.getValue("Id")) {

                                    var messageDialog = new MessageDialog({
                                        text: "Указанное физическое лицо уже присутствует в списке застрахованных лиц"
                                    });

                                    messageDialog.show();

                                    return ;

                                }


                            }

                            this.personDialog.hide();

                            this.addItem({
                                client: person,
                                driverRating: null,
                                driverLicenseNumber: null,
                                driverLicenseIssueDate: null,
                                drivingExperience: null,
                                privilegeDocumentType: null,
                                privilegeDocumentNumber: null,
                                privilegeDocumentIssueDate: null,
                                privilegeDocumentValidTo: null
                            });

                        })

                    });

                }

                this.personDialog.show();

            } else if (type == "entity") {

                if (!this.entityDialog) {

                    this.entityDialog = new SelectEntityDialog({

                        onSelect: dojo.hitch(this, function(entity){

                            // проверяем список застрахованных лиц на
                            // наличие

                            for (var i = 0; i < this.value.length; i++) {

                                var item = this.value[i];

                                if (item.client.getValue("Id") == entity.getValue("Id")) {

                                    var messageDialog = new MessageDialog({
                                        text: "Указанное юридическое лицо уже присутствует в списке застрахованных лиц"
                                    });

                                    messageDialog.show();

                                    return ;

                                }


                            }

                            this.entityDialog.hide();

                            this.addItem({
                                client: entity,
                                driverRating: null,
                                driverLicenseNumber: null,
                                driverLicenseIssueDate: null,
                                drivingExperience: null,
                                privilege: null,
                                privilegeDocumentNumber: null,
                                privilegeDocumentIssueDate: null,
                                privilegeDocumentValidTo: null
                            });

                        })

                    });

                }

                this.entityDialog.show();

            }

        },

        _removeItem: function(widget) {

            var indexOf = this.widgets.indexOf(widget);

            this.value.splice(indexOf, 1);

            this.widgets.splice(indexOf, 1);

            this.items.splice(indexOf, 1);

        }

    });

});