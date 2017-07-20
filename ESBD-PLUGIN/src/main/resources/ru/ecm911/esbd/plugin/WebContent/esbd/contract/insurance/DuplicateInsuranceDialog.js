define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/date/locale",
    "dijit/layout/ContentPane",
    "dijit/layout/TabContainer",
    "ecm/model/Request",
    "ecm/widget/dialog/BaseDialog",
    "ecm/widget/dialog/MessageDialog",
    "dojo/text!./templates/DuplicateInsuranceDialog.html"
], function(
    declare,
    lang,
    locale,
    ContentPane,
    TabContainer,
    Request,
    BaseDialog,
    MessageDialog,
    template)
{

	return declare("esbd.contract.insurance.DuplicateInsuranceDialog", [
		BaseDialog
	], {

		contentString: template,
		widgetsInTemplate: true,

		postCreate: function() {

			this.inherited(arguments);

			this.setResizable(false);

            this.addButton("Сохранить", "onSubmit", false, true, "ADD");

		},

		setSubmitDate: function(date) {

		    this["ESBD_SubmitDate"].set("value", date);

		},

		getSubmitDate: function() {

		    return this["ESBD_SubmitDate"].get("value");

		},

		setCertificateNumber: function(value) {

		    this["ESBD_InsuranceCertificateNumber"].set("value", value);

		},

		getCertificateNumber: function() {

		    return this["ESBD_InsuranceCertificateNumber"].get("value");

		},

		onSubmit: function() {
		}

	});

});
