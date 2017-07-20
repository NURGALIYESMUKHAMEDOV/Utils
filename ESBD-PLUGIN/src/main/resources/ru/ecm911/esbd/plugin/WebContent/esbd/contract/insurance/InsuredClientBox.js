define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dijit/layout/ContentPane",
    "dijit/form/Button",
    "ecm/widget/ValidationTextBox",
    "ecm/widget/DatePicker",
    "ecm/widget/CheckBox",
    "ecm/widget/Select",
    "ecm/model/Request",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/InsuredClientBox.html"
],function(
    declare,
    lang,
    domStyle,
    ContentPane,
    Button,
    ValidationTextBox,
    DatePicker,
    CheckBox,
    Select,
    Request,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template
) {

    return declare("esbd.contract.insurance.InsuredClientBox", [
        _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin
    ], {

        templateString: template,
        widgetsInTemplate: true,
        value: null,
        readOnly: false,
        loaded: false,

        _retrievePrivilege: function(callback) {

            this.ESBD_PrivilegeDocumentType.removeOption(this.ESBD_PrivilegeDocumentType.getOptions());

            this.ESBD_PrivilegeDocumentType.addOption({
                label: "Нет",
                value: null
            });

            var repository = ecm.model.desktop.repositories[0];

            Request.invokePluginService("ESBDPlugin", "DictionaryPluginService", {
                requestParams: {
                    name: "Тип льготного документа",
                    repositoryId: repository.id
                },
                requestCompleteCallback: dojo.hitch(this, function(response){

                    if (response && response.data) {

                        var values = response.data ;

                        this.ESBD_PrivilegeDocumentType.addOption(values);

                        if (callback) {

                            callback();

                        }

                    }

                })

            });

        },

        _retrieveDriverRating: function(callback) {

            this.ESBD_DriverRating.removeOption(this.ESBD_DriverRating.getOptions());

            var repository = ecm.model.desktop.repositories[0];

            Request.invokePluginService("ESBDPlugin", "DictionaryPluginService", {
                requestParams: {
                    name: "Класс водителя",
                    repositoryId: repository.id
                },
                requestCompleteCallback: dojo.hitch(this, function(response){

                    if (response && response.data) {

                        var values = response.data ;

                        this.ESBD_DriverRating.addOption(values);

                        if (callback) {

                            callback();

                        }

                    }

                })

            });

        },

        _retrieveAll: function(callback) {

            var calls = [];

            calls.push(dojo.hitch(this, this._retrievePrivilege));
            calls.push(dojo.hitch(this, this._retrieveDriverRating));

            var count = 0;

            var myCallback = function() {

                count++ ;

                if (count == calls.length) {

                    callback();

                }

            }

            for (var i = 0; i < calls.length; i++) {

                calls[i](myCallback);

            }

        },

        getValue: function() {

            this._getLocalValue();

            return this.value;

        },

        _getLocalValue: function() {

            if (this.value) {

                this.value.driverRating = this.ESBD_DriverRating.get("value");

                this.value.drivingExperience = this.ESBD_DrivingExperience.get("value");

                this.value.driverLicenseNumber = this.ESBD_DriverLicenseNumber.get("value");

                this.value.driverLicenseIssueDate = this.ESBD_DriverLicenseIssueDate.get("value");

                var drivingExperience = this.ESBD_DrivingExperience.get("value");

                this.value.drivingExperience = !isNaN(drivingExperience) ? parseInt(drivingExperience) : null;

                this.value.privilegeDocumentType = this.ESBD_PrivilegeDocumentType.get("value");

                this.value.privilegeDocumentNumber = this.ESBD_PrivilegeDocumentNumber.get("value");

                this.value.privilegeDocumentIssueDate = this.ESBD_PrivilegeDocumentIssueDate.get("value");

                this.value.privilegeDocumentValidTo = this.ESBD_PrivilegeDocumentValidTo.get("value");

            }

        },

        setValue: function(value) {

            this.value = value ;

            this._setLocalValue();

        },

        _setLocalValue: function() {

            if (!this.loaded) {

                this._retrieveAll(dojo.hitch(this, function(){

                    this.loaded = true ;

                    this._setLocalValue();

                }));

                return ;

            }

            if (this.value) {

                var client = this.value.client ;

                if (!client) {

                } else if (typeof client === "string" || client instanceof String) {

                    this._retrieveClient(client);

                } else {

                    // находим наименование поля

                    var label = null ;

                    var labels = document.getElementsByTagName('label');

                    for( var i = 0; i < labels.length; i++ ) {

                        if (labels[i].htmlFor == this.ESBD_DriverRating.id) {

                            label = labels[i];

                            break ;

                        }

                    }

                    // check client type

                    if (client.template == "ESBD_Person") {

                        this.codeLabel.innerHTML = "ИИН";

                        this.nameLabel.innerHTML = "Ф.И.О.";

                        this.code.set("value", client.getValue("ESBD_IIN"));

                        this.name.set("value", client.getValue("DocumentTitle"));

                        this.ESBD_DriverRating.domNode.style.visibility = "visible" ;

                        this.driverLicenseProps.style.display = "" ;

                        this.privilegeProps.style.display = "" ;

                        domStyle.set(label, "visibility", "visible");

                    } else if (client.template = "ESBD_Entity") {

                        this.codeLabel.innerHTML = "БИН";

                        this.nameLabel.innerHTML = "Наименование";

                        this.code.set("value", client.getValue("ESBD_BIN"));

                        this.name.set("value", client.getValue("ESBD_Name"));

                        this.ESBD_DriverRating.domNode.style.visibility = "hidden" ;

                        this.driverLicenseProps.style.display = "none" ;

                        this.privilegeProps.style.display = "none" ;

                        domStyle.set(label, "visibility", "hidden");

                    }

                    this.id.set("value", client.getValue("Id"));

                }

                this.ESBD_DriverRating.set("value", this.value.driverRating);

                this.ESBD_DriverLicenseNumber.set("value", this.value.driverLicenseNumber);

                this.ESBD_DriverLicenseIssueDate.set("value", this.value.driverLicenseIssueDate);

                this.ESBD_DrivingExperience.set("value", this.value.drivingExperience);

                this.ESBD_PrivilegeDocumentType.set("value", this.value.privilegeDocumentType);

                this.ESBD_PrivilegeDocumentNumber.set("value", this.value.privilegeDocumentNumber);

                this.ESBD_PrivilegeDocumentIssueDate.set("value", this.value.privilegeDocumentIssueDate);

                this.ESBD_PrivilegeDocumentValidTo.set("value", this.value.privilegeDocumentValidTo);

            } else {

                this.id.set("value", null);

                this.code.set("value", null);

                this.name.set("value", null);

                this.ESBD_DriverRating.set("value", null);

                this.ESBD_DriverLicenseNumber.set("value", null);

                this.ESBD_DriverLicenseIssueDate.set("value", null);

                this.ESBD_DrivingExperience.set("value", null);

                this.ESBD_PrivilegeDocumentType.set("value", null);

                this.ESBD_PrivilegeDocumentNumber.set("value", null);

                this.ESBD_PrivilegeDocumentIssueDate.set("value", null);

                this.ESBD_PrivilegeDocumentValidTo.set("value", null);

            }

            this.ESBD_DriverRating.set("disabled", this.readOnly);

            this.ESBD_DriverLicenseNumber.set("disabled", this.readOnly);

            this.ESBD_DriverLicenseIssueDate.set("disabled", this.readOnly);

            this.ESBD_DrivingExperience.set("disabled", this.readOnly);

            this.ESBD_PrivilegeDocumentType.set("disabled", this.readOnly);

            this.ESBD_PrivilegeDocumentNumber.set("disabled", this.readOnly);

            this.ESBD_PrivilegeDocumentIssueDate.set("disabled", this.readOnly);

            this.ESBD_PrivilegeDocumentValidTo.set("disabled", this.readOnly);

        },

        _retrieveClient: function(id) {

            var repository = ecm.model.desktop.repositories[0];

            repository.retrieveItem(id, dojo.hitch(this, function(item){

                this.value.client = item ;

                this._setLocalValue();

            }));

        },

        _onPrivilegeChange: function(val) {

            var value = this.ESBD_PrivilegeDocumentType.get("value");

            if (!value || value == "Нет") {

                this.privilegePane.domNode.style.display = "none" ;

            } else {

                this.privilegePane.domNode.style.display = "block" ;

            }

        },

        _onDriverLicenseIssueDateChanged: function() {

            var driverLicenseIssueDate = this.ESBD_DriverLicenseIssueDate.get("value");

            // стаж вождения по умолчанию, количество полных лет между текущим днем
            // и датой выдачи водительского удостоверения

            if (driverLicenseIssueDate) {

                var mills = Date.now() - driverLicenseIssueDate.getTime();

                var date = new Date(mills);

                var age = Math.abs(date.getUTCFullYear() - 1970);

                this.ESBD_DrivingExperience.set("value", age);

            }

        }

    });

});