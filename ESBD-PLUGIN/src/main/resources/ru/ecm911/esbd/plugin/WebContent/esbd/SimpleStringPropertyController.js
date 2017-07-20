define([
	"dojo/_base/declare",
	"pvr/controller/_PropertyController",
	"pvr/controller/types/mixins/_StringPropertyControllerMixin",
	"pvr/controller/attributes/Attribute",
	"pvr/controller/converters/StringConverter",
	"esbd/SimpleObjectConverter"
], function(declare, _PropertyController, _StringPropertyControllerMixin, Attribute, StringConverter, SimpleObjectConverter) {

	/**
	 * @name samplePluginDojo.SampleStringPropertyController
	 * @class Extends {@link pvr.controller._PropertyController} for properties of type "string".
	 * @augments pvr.controller._PropertyController, pvr.controller.types.mixins._StringPropertyControllerMixin
	 */
	return declare("esbd.SimpleStringPropertyController", [
		_PropertyController,
		_StringPropertyControllerMixin
	], {
	/** @lends samplePluginDojo.SampleStringPropertyController.prototype */

		/**
		 * Overloaded to include the repositoryId attribute.
		 */
		createTypeMixinAttributes: function() {
			this.inherited(arguments);
			// Add a couple new attributes that are part of the ICN model layer but are not currently
			// passed through to the property layout editors
			this.addAttribute(new Attribute({
				controller: this,
				name: "repositoryType",
				defaultValue: "",
				valueDependsOn: true,
				errorDependsOn: true,
				converter: StringConverter.Default
			}));
			this.addAttribute(new Attribute({
				controller: this,
				name: "repository",
				defaultValue: null,
				valueDependsOn: true,
				errorDependsOn: true,
				converter: SimpleObjectConverter.Default
			}));
		}
	});

});
