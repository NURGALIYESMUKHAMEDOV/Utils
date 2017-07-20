define([
    "dojo/_base/declare",
    "dojo/json",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "ecm/model/Desktop",
    "dojo/store/Memory",
    "ecm/widget/admin/PluginConfigurationPane",
    "dojo/text!./templates/FeatureConfigurationPane.html",
    "ecm/widget/ValidationTextBox",
    "ecm/widget/FilteringSelect",
    "ecm/widget/HoverHelp",
    "dijit/form/Textarea"
], function(
    declare,
    dojoJson,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    Desktop,
    MemoryStore,
    PluginConfigurationPane,
    template
) {

    return declare("esbd.FeatureConfigurationPane", [
        PluginConfigurationPane,
        _TemplatedMixin,
        _WidgetsInTemplateMixin
    ], {

		templateString: template,

		widgetsInTemplate: true,

		load: function(callback) {

			if (this.configurationString) {

				try {

					this.jsonConfig = dojoJson.parse(this.configurationString);

					if(this.jsonConfig.config)
						this.configField.set("value", this.jsonConfig.config);

				} catch (e) {

					this.logError("load", "Ошибка загрузки конфигурации: " + e.message);

				}

			}

		},

		save: function(){

			var configJson = {
				"config" : this.configField.get("value")
			};

			this.configurationString = JSON.stringify(configJson);

		},

		_onParamChange: function() {

			this.onSaveNeeded(true);

		},

		validate: function() {

			if(!this.configField.isValid())
				return false;

			return true;

		}

	});

});