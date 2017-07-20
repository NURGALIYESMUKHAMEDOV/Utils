define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "ecm/widget/TitlePane",
    "ecm/widget/dialog/BaseDialog",
    "dojo/text!./templates/ChooseEmployeeDialog.html"
], function(
    declare,
    lang,
    ContentPane,
    TitlePane,
    BaseDialog,
    template)
{

	return declare("docs.employee.ChooseEmployeeDialog", [
		BaseDialog
	], {

		contentString: template,
		widgetsInTemplate: true,
        _selectButton: null,

        // функция обратной связи
        callback: null,

        // структурное подразделение
        division: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(true);

			this.setResizable(true);

			this.set("title", "Сотрудник");

            this.setIntroText("Выберите сотрудника из указанного структурного подразделения");

            this._selectButton = this.addButton("Выбрать", "_onSelect", true, true, "SELECT");

            this.employeeList.onSelect = dojo.hitch(this, function(data) {

                this.selectedObject = data;

                this._selectButton.set("disabled", false);

            });

		},

		show: function(division, callback) {

		    this.division = division ;

		    this.callback = callback ;

            var d = this.inherited(arguments);

            this.employeeList.startup();

		    if (this.division) {

		        this.divisionNode.set("value", division.name);

		        this.divisionNode.set("readOnly", true);

                this.employeeList.retrieveData({
                    divisionId: division.id
                });

            } else {

                this.divisionNode.set("value", "");

                this.divisionNode.set("readOnly", false);

                this.employeeList.retrieveData({
                });

            }

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
		        code: this.employeeCodeNode.get("value"),
		        name: this.employeeNameNode.get("value"),
		        position: this.positionNode.get("value"),
		    };

		    if (this.division) {

		        filters.divisionId = this.division.id ;

		    } else {

		        filters.division = this.divisionNode.get("value")

		    }

		    console.log("filters: ", filters);

		    this.employeeList.retrieveData(filters);

		},

		onSearchReset: function() {

		    this.employeeCodeNode.set("value", null);
            this.employeeNameNode.set("value", null);
            this.positionNode.set("value", null);

            if (!this.division) {
                this.divisionNode.set("value", null);
            }

		}

	});

});
