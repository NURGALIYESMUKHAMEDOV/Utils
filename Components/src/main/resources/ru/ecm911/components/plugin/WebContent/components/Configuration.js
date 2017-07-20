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

    /*

        Конфигурационный объект в формате JSON

        {
          "pages" : [
            {
              "title": "Заголовок страницы",
              "config": {
                "list": {
                  "repository": "репозиторий",
                  "searchTemplatesPath": "папка с шаблонами поиска"
                },
                "add": {
                  "title": "Заголовок при создании документа",
                  "description": "Описание при создании документа",
                  "entryTemplate": "Шаблон ввода при создании документа"
                },
                "modify": {
                  "title": "Заголовок при измении документа",
                  "description": "Описание при изменении документа",
                  "entryTemplate": "Шаблон ввода при изменении документа"
                }
              }
            }
          ]
        }

    */

    var Configuration = declare("components.Configuration", [], {

        repository: null,

        configuration: null,

        _pages: null,

        // инициализирует конфигурацию по идентификатору
        constructor: function(pluginConfiguration) {

            var data = json.parse(pluginConfiguration);

            this.repository = ecm.model.desktop.getRepositoryByName(data.repositoryId);

            this.configuration = json.parse(data.configuration);

            this._resolvePages();

        },

        _resolvePages: function() {

            if (this.configuration && this.configuration.pages) {

                array.forEach(this.configuration.pages, function(page){

                    if (page.config) {

                        if (page.config.add && page.config.add.entryTemplate) {

                            var entryTemplate = page.config.add.entryTemplate ;

                            if (typeof entryTemplate === "string") {

                                entryTemplate = new EntryTemplate({
                                    repository: this.repository,
                                    id: entryTemplate
                                });

                                page.config.add.entryTemplate = entryTemplate ;

                            }

                        }

                        if (page.config.modify && page.config.modify.entryTemplate) {

                            var entryTemplate = page.config.modify.entryTemplate ;

                            if (typeof entryTemplate === "string") {

                                entryTemplate = new EntryTemplate({
                                    repository: this.repository,
                                    id: entryTemplate
                                });

                                page.config.modify.entryTemplate = entryTemplate ;

                            }

                        }

                    }


                }, this);

            }

        },

        getPages: function() {

            return this.configuration.pages ;

        }

    });

    return Configuration ;

});