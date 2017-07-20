define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "ecm/widget/TitlePane",
    "ecm/widget/dialog/BaseDialog",
    "dojo/text!./templates/ChooseDivisionAndEmployeeDialog.html"
], function(
    declare,
    lang,
    ContentPane,
    TitlePane,
    BaseDialog,
    template)
{

	return declare("docs.employee.ChooseDivisionAndEmployeeDialog", [
		BaseDialog
	], {

		contentString: template,
		widgetsInTemplate: true,
        _selectButton: null,
        callback: null,

		postCreate: function() {
			this.inherited(arguments);
			this.setMaximized(true);
			this.setResizable(true);
			this.set("title", "Структурное подразделение / Сотрудник");
            this.setIntroText("Выберите структурное подразделение и сотрудника в нём.");
            this._selectButton = this.addButton("Выбрать", "_onSelect", true, true, "SELECT");
            this.divisionAndEmployeeList.onSelect = dojo.hitch(this, function(data) {

                this.selectedObject = data;

                this._selectButton.set("disabled", false);

            });
		},

		show: function(callback) {

		    this.callback = callback ;

            var d = this.inherited(arguments);

            this.divisionAndEmployeeList.startup();

            return d;

		},

		_onSelect: function() {

		    if (this.selectedObject) {

		        this.callback(this.selectedObject);

		    }

		},

		onCancel: function() {

			this.inherited(arguments);

		},

		onSearchSubmit: function() {

		    var filters = {
		        employeeCode: this.employeeCode.get("value"),
		        employeeName: this.employeeName.get("value"),
		        position: this.position.get("value"),
		        division: this.division.get("value")
		    };

		    this.divisionAndEmployeeList.filters = filters ;

		    this.divisionAndEmployeeList.refresh();

		},

		onSearchReset: function() {

		    this.employeeCode.set("value", null);
            this.employeeName.set("value", null);
            this.position.set("value", null);
            this.division.set("value", null);

		}

	});

});
