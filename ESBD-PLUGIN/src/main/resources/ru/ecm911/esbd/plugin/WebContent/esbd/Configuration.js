define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/json",
    "dojo/Deferred",
    "ecm/model/EntryTemplate"
],function(
    declare,
    lang,
    array,
    json,
    Deferred,
    EntryTemplate
) {

    var Configuration = declare("edbd.Configuration", [], {

        repository: null,

        configuration: null,

        // инициализирует конфигурацию по идентификатору
        constructor: function(pluginConfiguration) {

            var data = json.parse(pluginConfiguration);

            this.repository = ecm.model.desktop.getRepositoryByName(data.repositoryId);

            this.configuration = json.parse(data.configuration);

            this._resolveEntryTemplates();

        },

        _resolveEntryTemplates: function() {

            if (this.configuration && this.configuration.entryTemplates) {

                for (var className in this.configuration.entryTemplates) {

                    console.log("resolve entry templates for class: ", className);

                    var config = this.configuration.entryTemplates[className];

                    if (config.add && typeof config.add === "string") {

                        var entryTemplate = new EntryTemplate({
                            repository: this.repository,
                            id: config.add
                        });

                        config.add = entryTemplate ;

                    }

                    if (config.edit && typeof config.edit === "string") {

                        var entryTemplate = new EntryTemplate({
                            repository: this.repository,
                            id: config.edit
                        });

                        config.edit = entryTemplate ;

                    }

                }

            }

        },

        getEntryTemplate: function(className, type) {

            if (this.configuration && this.configuration.entryTemplates) {

                var object = this.configuration.entryTemplates[className];

                return object[type];

            } else {

                return null ;

            }

        }

    });

    return Configuration ;

});