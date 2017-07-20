/**
 * Компонент, отвечающий за отображения информации по
 * договору страхования
 *
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/date/locale",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dijit/layout/TabContainer",
    "dijit/form/Button",
    "dijit/DropDownMenu",
    "dijit/MenuItem",
    "ecm/widget/DropDownButton",
    "ecm/model/Request",
    "ecm/model/ContentItem",
    "ecm/widget/dialog/MessageDialog",
    "esbd/contract/insurance/InsurerBox",
    "esbd/contract/insurance/InsuredClientList",
    "esbd/contract/insurance/InsuredVehicleList",
    "esbd/contract/insurance/PropertiesBox",
    "esbd/contract/insurance/TerminateInsuranceDialog",
    "esbd/contract/insurance/DuplicateInsuranceDialog",
    "esbd/contract/insurance/AddInsuranceDialog"
], function(
    declare,
    lang,
    locale,
    ContentPane,
    BorderContainer,
    TabContainer,
    Button,
    DropDownMenu,
    MenuItem,
    DropDownButton,
    Request,
    ContentItem,
    MessageDialog,
    InsurerBox,
    InsuredList,
    InsuredVehicleList,
    PropertiesBox,
    TerminateInsuranceDialog,
    DuplicateInsuranceDialog,
    AddInsuranceDialog
) {

	return declare("esbd.contract.insurance.InsurancePane", [
		TabContainer
	], {

		value: null,
		readOnly: false,
		insurerBox: null,
		insuredClientList: null,
		insuredVehicleList: null,
		propertiesBox: null,

		postCreate: function() {

		    this.addChild(this._createInsurerBox());

		    this.addChild(this._createInsuredClientList());

		    this.addChild(this._createInsuredVehicleList());

		    this.addChild(this._createPropertiesBox());

		},

		_createInsurerBox: function() {

		    this.insurerBox = new InsurerBox({
		        title: "Страхователь",
		        readOnly: this.readOnly,
		        onUpdate: dojo.hitch(this, function(value){
                    this.onChange_Insurer(value);
		        })
		    });

		    return this.insurerBox ;

		},

        _createInsuredClientList: function() {

            this.insuredClientList = new InsuredList({
                title: "Застрахованные лица",
                readOnly: this.readOnly,
                style: "width: 100%; height: 100%; overflow: auto"
            });

            return this.insuredClientList ;

        },

        _createInsuredVehicleList: function() {

            this.insuredVehicleList = new InsuredVehicleList({
                title: "Транспортное средство",
                readOnly: this.readOnly,
                style: "width: 100%; height: 100%; overflow: auto"
            });

            return this.insuredVehicleList ;

        },

        _createPropertiesBox: function() {

            this.propertiesBox = new PropertiesBox({
                title: "Страховой полис",
                readOnly: this.readOnly,
                style: "width: 100%; height: 100%; overflow: auto",
                onOpen: dojo.hitch(this, function(contentItem){
                    this.onOpen(contentItem);
                }),
                onCalculate: dojo.hitch(this, function(callback){
                    this.onCalculate(callback);
                })
            });

            return this.propertiesBox ;

        },

        setValue: function(value) {

            this.value = value ;

            this._setLocalValue();

        },

        _setLocalValue: function() {

            if (this.value) {

                if (this.value.getValue("ESBD_Insurer")) {

                    this._retrieveInsurer(this.value.getValue("ESBD_Insurer"));

                }

                if (this.value.getValue("ESBD_InsuredClients")) {

                    this._retrieveInsuredClients(this.value.getValue("ESBD_InsuredClients"));

                } else {

                    this.insuredClientList.setValue([]);

                }

                if (this.value.getValue("ESBD_InsuredVehicles")) {

                    this._retrieveInsuredVehicles(this.value.getValue("ESBD_InsuredVehicles"));

                } else {

                    this.insuredVehicleList.setValue([]);

                }

                this.propertiesBox.setValue(this.value);

            }

        },

        _retrieveInsurer: function(id) {

            var repository = ecm.model.desktop.repositories[0];

            repository.retrieveItem(id, dojo.hitch(this, function(item){

                this.insurerBox.setValue(item, false);

            }));

        },

        _retrieveInsuredClients: function(ids) {

            var repository = ecm.model.desktop.repositories[0];

            repository._teamspaceItemsCache = null;

            repository.retrieveMultiItem(ids, dojo.hitch(this, function(items){

                var data = [];

                for (var i = 0; i < items.length; i++) {

                    var item = items[i];

                    data.push({
                        client: item.getValue("ESBD_Client"),
                        driverRating: item.getValue("ESBD_DriverRating"),
                        driverLicenseNumber: item.getValue("ESBD_DriverLicenseNumber"),
                        driverLicenseIssueDate: item.getValue("ESBD_DriverLicenseIssueDate"),
                        drivingExperience: item.getValue("ESBD_DrivingExperience"),
                        privilegeDocumentType: item.getValue("ESBD_PrivilegeDocumentType"),
                        privilegeDocumentNumber: item.getValue("ESBD_PrivilegeDocumentNumber"),
                        privilegeDocumentIssueDate: item.getValue("ESBD_PrivilegeDocumentIssueDate"),
                        privilegeDocumentValidTo: item.getValue("ESBD_PrivilegeDocumentValidTo")
                    });

                }

                this.insuredClientList.setValue(data);

            }));

        },

        _retrieveInsuredVehicles: function(ids) {

            var repository = ecm.model.desktop.repositories[0];

            repository._teamspaceItemsCache = null;

            repository.retrieveMultiItem(ids, dojo.hitch(this, function(items){

                var data = [];

                for (var i = 0; i < items.length; i++) {

                    var item = items[i];

                    data.push({
                        vehicle: item.getValue("ESBD_Vehicle"),
                        registrationRegion: item.getValue("ESBD_VehicleRegistrationRegion"),
                        registrationCity: item.getValue("ESBD_VehicleRegistrationCity"),
                        VRN: item.getValue("ESBD_VRN"),
                        certificateNumber: item.getValue("ESBD_VehicleCertificateNumber"),
                        certificateIssueDate: item.getValue("ESBD_VehicleCertificateIssueDate")
                    });

                }

                this.insuredVehicleList.setValue(data);

            }));

        },

        getData: function() {

            // данные в формате JSON объекта:
            //
            // {
            //   "company" : "<код страховой компании>",
            //   "insurer": "<идентификатор страхователя>",
            //   "insuredClients": [
            //     {
            //       "client" : "<идентификатор клиента>",
            //       "driverRating" : "<класс водителя>",
            //       "drivingExperience" : <стаж вождения>,
            //       "driverLicenseNumber" : "<номер вод. уд-я>",
            //       "driverLicenseIssueDate" : "<дата выдачи вод. уд-я>",
            //       "privilegeDocumentType" : "<льгота>",
            //       "privilegeDocumentNumber" : "<номер док-а льготы>",
            //       "privilegeDocumentIssueDate" : "<дата выдачи док-а льготы>",
            //       "privilegeDocumentValidTo" : "<срок действия док-а льготы>"
            //     }
            //   ],
            //   "insuredVehicles": [
            //     {
            //       "vehicle" : "<идентификатор ТС>",
            //       "registrationRegion" : "<район регистрации>",
            //       "registrationCity" : "<город регистрации>",
            //       "VRN" : "<гос номер>",
            //       "certificateNumber" : "<номер ПТС>",
            //       "certificateIssueDate" : "<дата выдачи ПТС>",
            //       "certificateValidTo" : "<срок действия ПТС>"
            //     }
            //   ],
            //   "submitDate" : "<дата заключения>",
            //   "startDate" : "<дата начала действия>",
            //   "endDate" : "<дата окончания действия>",
            //   "branch" : "<филиал>",
            //   "certificateNumber" : "<номер полиса>",
            //   "premium" : <страховая премия>,
            //   "paymentType" : <порядок оплаты>,
            //   "paymentDate" : <дата оплаты>
            // }
            //

            var data = {} ;

            // указываем страховую компанию

            data.company = this.value.getValue("ESBD_CompanyCode") ;

            // указываем страхователя

            var insurer = this.insurerBox.getValue();

            data.insurer = insurer.getValue("Id");

            // формируем список застрахованных лиц

            data.insuredClients = [];

            var clients = this.insuredClientList.getValue();

            for (var i = 0; i < clients.length; i++) {

                var item = clients[i];

                data.insuredClients.push({
                    client: item.client.getValue("Id"),
                    driverRating: item.driverRating,
                    drivingExperience: item.drivingExperience,
                    driverLicenseNumber: item.driverLicenseNumber,
                    driverLicenseIssueDate: this._formatDate(item.driverLicenseIssueDate),
                    privilegeDocumentType: item.privilegeDocumentType,
                    privilegeDocumentNumber: item.privilegeDocumentNumber,
                    privilegeDocumentIssueDate: this._formatDate(item.privilegeDocumentIssueDate),
                    privilegeDocumentValidTo: this._formatDate(item.privilegeDocumentValidTo)
                });

            }

            // формируем список застрахованных ТС

            data.insuredVehicles = [] ;

            var vehicles = this.insuredVehicleList.getValue();

            for (var i = 0; i < vehicles.length; i++) {

                var item = vehicles[i];

                data.insuredVehicles.push({
                    vehicle: item.vehicle.getValue("Id"),
                    registrationRegion: item.registrationRegion,
                    registrationCity: item.registrationCity,
                    VRN: item.VRN,
                    certificateNumber: item.certificateNumber,
                    certificateIssueDate: this._formatDate(item.certificateIssueDate),
                    certificateValidTo: this._formatDate(item.certificateValidTo)
                });

            }

            // указываем остальные атрибуты

            var value = this.propertiesBox.getValue();

            for (var propertyName in value.attributes) {

                if (propertyName == "ESBD_SubmitDate") {

                    data.submitDate = this._formatDate(value.getValue(propertyName));

                } else if (propertyName == "ESBD_StartDate") {

                    data.startDate = this._formatDate(value.getValue(propertyName));

                } else if (propertyName == "ESBD_EndDate") {

                    data.endDate = this._formatDate(value.getValue(propertyName));

                } else if (propertyName == "ESBD_Branch") {

                    data.branch = value.getValue(propertyName);

                } else if (propertyName == "ESBD_InsuranceCertificateNumber") {

                    data.certificateNumber = value.getValue(propertyName);

                } else if (propertyName == "ESBD_Premium") {

                    data.premium = parseFloat(value.getValue(propertyName));

                    if (isNaN(data.premium)) {

                        data.premium = 0.0 ;

                    }

                } else if (propertyName == "ESBD_Source") {

                    data.source = value.getValue("ESBD_Source");

                } else if (propertyName == "ESBD_PaymentType") {

                    data.paymentType = value.getValue(propertyName);

                } else if (propertyName == "ESBD_PaymentDate") {

                    data.paymentDate = this._formatDate(value.getValue(propertyName));

                }

            }

            return data ;

        },

        _formatDate(date) {

            try {

                var newDate = new Date(date.getTime() - date.getTimezoneOffset()  * 60 * 1000);

                console.log("Дата: ", date, ", ISO: " + newDate.toISOString());

                return newDate.getTime();

                // return newDate.toISOString();

                // return locale.format(date, {selector: "date", datePattern: "dd.MM.yyyy"});

            } catch (e) {

                return null ;

            }

        },

        isValid: function() {

		    var insurer = this.insurerBox.getValue();

		    if (!insurer) {

		        var dialog = new MessageDialog({
		            text: "Не указан страхователь"
		        });

		        dialog.show();

		        return false ;

		    }

            var insuredClients = this.insuredClientList.getValue();

            if (!insuredClients || insuredClients.length == 0) {

		        var dialog = new MessageDialog({
		            text: "Не указаны застрахованные лица"
		        });

		        dialog.show();

		        return false ;

            }

            var insuredVehicles = this.insuredVehicleList.getValue();

            if (!insuredVehicles || insuredVehicles.length == 0) {

		        var dialog = new MessageDialog({
		            text: "Не указано хотя бы одно транспортное средство"
		        });

		        dialog.show();

		        return false ;

            }

            return true ;

        },

        onChange_Insurer: function(value) {
        },

        onOpen: function(contentItem) {
        },

        onCalculate: function(callback) {

            if (!this.isValid()) {

                callback(null);

                return ;

            }

            var data = this.getData();

            console.log("data: ", data);

            var repository = ecm.model.desktop.repositories[0];

            Request.invokePluginService("ESBDPlugin", "InsuranceContractPluginService", {
                requestParams: {
                    name: "calculate",
                    repositoryId: repository.id,
                    data: JSON.stringify(data)
                },
                requestCompleteCallback: dojo.hitch(this, dojo.hitch(this, function(response){

                    if (response && response.response && response.premium) {

                        callback(response);

                    } else {

                        callback(null);

                    }

                }))

            });

        }

	});

});
