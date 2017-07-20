define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/json",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "ecm/widget/admin/PluginConfigurationPane",
    "esbd/ConfigurationDialog",
    "dojo/text!./templates/ESBDACFeatureConfigurationPane.html"
], function(
    declare,
    array,
    dojoJson,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    PluginConfigurationPane,
    ConfigurationDialog,
    template
) {

    return declare("esbd.ESBDACFeatureConfigurationPane", [
        PluginConfigurationPane,
        _TemplatedMixin,
        _WidgetsInTemplateMixin
    ], {

		templateString: template,

		widgetsInTemplate: true,

		// конфигурационные данные
		configuration: null,

		postCreate: function() {

		    this.inherited(arguments);

            this.repositoryField.removeOption(this.repositoryField.getOptions());

            this.repositoryField.addOption({
                label: "",
                value: "undefined"
            });

            array.forEach(ecm.model.desktop.repositories, function(repository){

                this.repositoryField.addOption({
                    label: repository.displayName,
                    value: repository.id
                });

            }, this);

		},

		load: function(callback) {

			if (this.configurationString) {

				try {

					var data = dojoJson.parse(this.configurationString);

					if (data.repositoryId) {

					    this.repositoryField.set("value", data.repositoryId);

					}

					if (data.configuration) {

					    this.configuration = data.configuration ;

					}

				} catch (e) {

					this.logError("load", "Ошибка загрузки конфигурации: " + e.message);

				}

			}

		},

		save: function(){

			var configJson = {
				repositoryId: this.repositoryField.get("value"),
				configuration: this.configuration
			};

			this.configurationString = JSON.stringify(configJson);

		},

		_onRepositoryChange: function() {

			this.onSaveNeeded(true);

		},

		_onConfig: function() {

		    var dialog = new ConfigurationDialog();

		    dialog.show({

		        value: this.configuration,

		        callback: dojo.hitch(this, function(configuration) {

		            this.configuration = configuration ;

		            this.onSaveNeeded(true);

		        })

		    });

		},

		validate: function() {

		    var repositoryId = this.repositoryField.get("value");

		    if (repositoryId == "undefined") {

		        return false ;

		    }

			return true;

		}

	});

});