require([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "ecm/model/EntryTemplate"
], function(
    declare,
    lang,
    EntryTemplate
){

    console.log("Расширение 'ЕСБД' загружено");

    // Register the custom model integration configuration with the Entry Template so the Property Layout designer will see it.
    // EntryTemplate.registerModelIntegration("esbd/IntegrationConfiguration");

    // Register the custom property controls with the Entry Template so the Property Layout designer will see it.
    EntryTemplate.registerControlRegistry("esbd/ControlRegistry");

})