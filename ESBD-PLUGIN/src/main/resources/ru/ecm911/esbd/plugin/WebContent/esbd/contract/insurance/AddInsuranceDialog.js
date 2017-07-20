define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/date/locale",
    "dijit/layout/ContentPane",
    "dijit/layout/TabContainer",
    "ecm/model/Request",
    "ecm/widget/dialog/BaseDialog",
    "ecm/widget/dialog/MessageDialog",
    "esbd/contract/insurance/InsurancePane",
    "dojo/text!./templates/AddInsuranceDialog.html"
], function(
    declare,
    lang,
    locale,
    ContentPane,
    TabContainer,
    Request,
    BaseDialog,
    MessageDialog,
    InsurancePane,
    template)
{

	return declare("esbd.contract.insurance.AddInsuranceDialog", [
		BaseDialog
	], {

		contentString: template,
		widgetsInTemplate: true,
		insurancePane: null,        // компонент для работы с договором страхования
		value: null,                // страховой договор

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(true);

			this.setResizable(true);

            this.set("title", "Страховой полис");

            this.setIntroText("Регистрация страхового полиса");

            this.addButton("Добавить", "_onSubmit", false, true, "ADD");

            this.insurancePane = new InsurancePane({
                onChange_Insurer: dojo.hitch(this, function(value){

                    var data = [];

                    // {
                    //   client: <ecm.model.ContentItem>,
                    //   driverRating: "<класс водителя>"
                    //   driverLicense: {
                    //      documentNumber: "<номер водительского удостоверения>",
                    //      issueDate: "<дата выдачи>"
                    //   },
                    //   drivingExperience: <стаж водителя>,
                    //   privilege: {
                    //      type: "<тип льготы>",
                    //      documentNumber: "<номер документа>",
                    //      issueDate: "<дата выдачи документа>",
                    //      validTo: "<срок действия документа>"
                    //   }
                    // }

                    data.push({
                        client: value,
                        driverRating: value.getValue("ESBD_DriverRating"),
                        driverLicenseNumber: null,
                        driverLicenseIssueDate: null,
                        drivingExperience: null,
                        privilegeDocumentType: null,
                        privilegeDocumentNumber: null,
                        privilegeDocumentIssueDate: null,
                        privilegeDocumentValidTo: null
                    });

                    this.insurancePane.insuredClientList.setValue(data);

                })
            });

            this.widget.addChild(this.insurancePane);

            if (this.value) {

                this._setLocalValue();

            }

		},

		setValue: function(value) {

		    this.value = value ;

		    this._setLocalValue();

		},

		_setLocalValue: function() {

		    if (this.value) {

                this.insurancePane.setValue(this.value);

		    }

		},

		_onSubmit: function() {

		    if (!this.insurancePane.isValid()) {

		        return ;

		    }

            var data = this.insurancePane.getData();

            var repository = ecm.model.desktop.repositories[0];

            Request.invokePluginService("ESBDPlugin", "InsuranceContractPluginService", {
                requestParams: {
                    name: "create",
                    repositoryId: repository.id,
                    data: JSON.stringify(data)
                },
                requestCompleteCallback: dojo.hitch(this, dojo.hitch(this, function(response){

                    if (response && response.response && response.id) {

                        repository.retrieveItem(response.id, dojo.hitch(this, function(item){

                            this.onSubmit(item);

                        }));

                    }

                }))

            });

		},

		onSubmit: function(item) {
		}

	});

});
