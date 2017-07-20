define([
		"dojo/_base/declare",
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		"ecm/widget/ValidationTextBox",
		"dijit/Tooltip",
		"ecm/widget/admin/PluginConfigurationPane",
		"dojo/text!./templates/ConfigurationPane.html"
	],
	function(declare, _TemplatedMixin, _WidgetsInTemplateMixin, ValidationTextBox,HoverHelp,PluginConfigurationPane, template) {

		/**
		 * @name samplePluginDojo.ConfigurationPane
		 * @class Provides a configuration panel for the sample plugin.  This panel appears on the plug-in configuration page in
		 * administration after loading the plug-in.
		 * @augments ecm.widget.admin.PluginConfigurationPane
		 */
		return declare("cryptopro.ConfigurationPane", [ PluginConfigurationPane, _TemplatedMixin, _WidgetsInTemplateMixin], {
		/** @lends samplePluginDojo.ConfigurationPane.prototype */

		templateString: template,
		widgetsInTemplate: true,

		postCreate:function(){

			this.inherited(arguments);

		},

		load: function(callback) {

			if (this.configurationString) {

				var jsonConfig = eval('(' + this.configurationString + ')');

				this.tsUrl.set('value',jsonConfig.configuration[0].value);

			}

		},

		_onParamChange: function() {

			var configArray = [];

			var configString = {
				name: "tsUrl",
				value: this.tsUrl.get('value')
			};

			configArray.push(configString);

			var configJson = {
				"configuration" : configArray
			};

			this.configurationString = JSON.stringify(configJson);

			this.onSaveNeeded(true);

		},

		validate: function() {

			if(!this.tsUrl.isValid()) {

				return false;

            }

			return true;
		}

	});

});