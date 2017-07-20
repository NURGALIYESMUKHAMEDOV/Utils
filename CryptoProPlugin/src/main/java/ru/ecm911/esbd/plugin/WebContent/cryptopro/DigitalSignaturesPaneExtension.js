define([
    "dojo/_base/declare",
    "ecm/widget/ItemPropertiesPaneExtension",
    "ecm/widget/CommonPropertiesPane",
    "cryptopro/DigitalSignaturesList"
], function(
    declare,
    ItemPropertiesPaneExtension,
    CommonPropertiesPane,
    DigitalSignaturesList
) {

	return declare("cryptopro.DigitalSignaturesPaneExtension", [ ItemPropertiesPaneExtension ], {

		postCreate: function() {

		    console.log("Инициализация расширения панели 'Свойство' списком ЭЦП..");

			this.inherited(arguments);

			this.set("title", "ЭЦП");

			// this._commonProperties = new CommonPropertiesPane();

			// this.addChild(this._commonProperties);

            this._digitalSignaturesList = new DigitalSignaturesList();

			this.addChild(this._digitalSignaturesList);

			this._digitalSignaturesList.startup();

		},

		isEnabledFor: function(item) {

		    console.log("is enabled for? ", item);

			return true;

		},

		getPropertiesTitle: function() {

		    console.log("get properties title");

			return "ЭЦП";

		},

		setItem: function(item) {

		    console.log("set item: ", item);

		    alert("set itemn !!");

			this.item = item;

			// this._digitalSignaturesList.setItem(item);

		},

		onChange: function() {

		    console.log("onChange");

		},

        isValid: function() {

            console.log("isValid");

            return true ;

        },

        saveIntoProperties: function(properties) {

            console.log("save into properties: ", properties);

        }


	});

});