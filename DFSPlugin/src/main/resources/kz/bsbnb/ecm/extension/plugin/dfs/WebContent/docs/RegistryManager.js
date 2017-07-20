define([
    "dojo/_base/declare",
    "dojo/has!icm-builder?icm/propsdesign/ui/registry/RegistryManager:icm/widget/properties/registry/RegistryManager",
    "docs/RegistryConfiguration"
], function(
    declare,
    RegistryManager,
    registryConfig
) {

    console.log("инициализация реестра редакторов ...");

    return declare("docs.RegistryManager", null, {
        initialize: function() {
            RegistryManager.mergeConfiguration(registryConfig);
        }
    });

});