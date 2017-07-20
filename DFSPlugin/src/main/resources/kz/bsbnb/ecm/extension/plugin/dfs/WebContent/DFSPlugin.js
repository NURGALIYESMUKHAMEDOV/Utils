require([
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/dom-construct",
    "dojo/sniff",
    "dojo/promise/all",
    "dojo/Deferred",
    "ecm/model/Request",
    "ecm/model/EntryTemplate"
], function(
    lang,
    array,
    domConstruct,
    sniff,
    all,
    Deferred,
    Request,
    EntryTemplate
) {

    console.log("initialize DFSPlugin!!");

    EntryTemplate.registerControlRegistry("docs/RegistryConfiguration");

    var extensions = [
        {
            packages: {
                docs: "/navigator/plugin/DFSPlugin/getResource/docs"
            },
            css: [
                "/navigator/plugin/DFSPlugin/getResource/docs/themes/DFSPlugin.css"
            ],
            bootstrapModule: "docs/RegistryManager",
            bootstrapMethod: "initialize"
        }
    ];

    var promises = [];

    array.forEach(extensions, function(extension) {

        var deferred = new Deferred();

        promises.push(deferred.promise);

        // Load the module packages.
        require({
            paths: extension.packages
        });

        // Load the stylesheets.
        array.forEach(extension.css, function(url) {

            if (sniff("ie")) {
                document.createStyleSheet(url);
            } else {
                domConstruct.create("link", {
                    rel: "stylesheet",
                    type: "text/css",
                    href: url
                }, document.getElementsByTagName("head")[0]);
            }

        });

        // Call the bootstrap method.
        if (extension.bootstrapModule && extension.bootstrapMethod) {
            require([extension.bootstrapModule], function(bootstrapClass) {
                var bootstrap = new bootstrapClass();
                if (lang.isFunction(bootstrap[extension.bootstrapMethod])) {
                    bootstrap[extension.bootstrapMethod]();
                    deferred.resolve();
                } else {
                    deferred.resolve();
                }

            });
        } else {
            deferred.resolve();
        }

    });

    all(promises);

    lang.setObject("EmployeeService", {

        getEmployeeByUsername: function(username, callback) {

            console.log("Загрузить пользователя по учетному имени '" + username + "' ...");

            // var userId = ecm.model.desktop.userId ;

            var params = {};

            params.repositoryId = ecm.model.desktop.currentSolution.targetObjectStore.repositoryId ;
            params.repositoryType = "p8";
            params.op = "getByUsername" ;
            params.username = username ;

            Request.invokePluginService("DFSPlugin", "EmployeeService", {
                requestParams: params,
                requestCompleteCallback: function(response) {

                    callback(response);

                }

            });

        }

    });

});