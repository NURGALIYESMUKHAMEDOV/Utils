require([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "ecm/model/Request",
    "sl/MessageBox"
], function(
    declare,
    lang,
    Request,
    MessageBox
){

    lang.setObject("shareLink", function(repository, items) {

        // сформировать ссылку и записать ее в CustomObject

        var params = {};

        params.op = "shareLink" ;
        params.userId = ecm.model.desktop.userId ;
        params.repositoryId = items[0].repository.id ;
        params.repositoryType = items[0].repository.type;
        params.documentId = items[0].docid ;
        params.vsId = items[0].vsId ;

        Request.invokePluginService("SLPlugin", "SLService", {
          requestParams: params,
          requestCompleteCallback: function(response){

            var messageBox = new MessageBox();

            messageBox.setMessage(response.url);

            messageBox.show();

          }

        });


    });

})