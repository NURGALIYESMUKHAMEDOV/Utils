define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/date/locale",
    "dijit/layout/ContentPane",
    "dijit/layout/TabContainer",
    "ecm/model/Request",
    "ecm/widget/dialog/BaseDialog",
    "ecm/widget/dialog/MessageDialog",
    "dojo/text!./templates/TerminateInsuranceDialog.html"
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

	return declare("esbd.contract.insurance.TerminateInsuranceDialog", [
		BaseDialog
	], {

		contentString: template,
		widgetsInTemplate: true,
        hasReturnOfPremium: false,
        premium: null,
        startDate: null,
        endDate: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setResizable(false);

            this.addButton("Сохранить", "onSubmit", false, true, "ADD");

            this.returnRow.style.display = this.hasReturnOfPremium ? "" : "none" ;

		},

		setDate: function(date) {

		    this.date.set("value", date);

		},

		getDate: function() {

		    return this.date.get("value");

		},

		setComment: function(value) {

		    this.comment.set("value", value);

		},

		getComment: function() {

		    return this.comment.get("value");

		},

		setReturnOfPremium: function(value) {

			this.returnOfPremium.set("value", value);

		},

		getReturnOfPremium: function() {

			return this.returnOfPremium.get("value");

		},

		onSubmit: function() {
		},

		_calculateReturnOfPremium: function() {

			var terminateDate = this.date.get("value");

			if (this.premium && this.startDate && this.endDate && terminateDate) {

				var diff = this._daysBetween(this.startDate, terminateDate);

				var days = this._daysBetween(this.startDate, this.endDate);

				var value = this.premium * diff / days ;

				this.returnOfPremium.set("value", value);

			}

		},

        _daysBetween: function(date1, date2) {

            var d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());

            var d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

            var millisecondsPerDay = 1000 * 60 * 60 * 24;

            var millisBetween = d2.getTime() - d1.getTime();

            var days = millisBetween / millisecondsPerDay;

            return Math.floor(days);

        }

	});

});
