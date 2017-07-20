require([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "ecm/model/Request",
    "ecm/widget/ItemPropertiesPane",
    "cryptopro/DigitalSignaturesPaneExtension",
    "cryptopro/AddDigitalSignatureDialog",
    "cryptopro/ListDigitalSignaturesDialog",
    "cryptopro/DigitalSignatureService",
    "cryptopro/ChooseCertificateDialog"
], function(
    declare,
    lang,
    Request,
    ItemPropertiesPane,
    DigitalSignaturesPaneExtension,
    AddDigitalSignatureDialog,
    ListDigitalSignaturesDialog,
    DigitalSignatureService,
    ChooseCertificateDialog
){

    console.log("Инициализация расширения 'КриптоПро ЭЦП' запущена...");

    lang.setObject("addDigitalSignature", function(repository, items) {

        console.log("Подписание!");

        var item = items[0];

        var documentId = item.id.split(",")[2];

        console.log("item: ", item, ", documentId: " + documentId);

        var digitalSignatureService = new DigitalSignatureService();

        if (!digitalSignatureService.isActive()) {

            var messageDialog = new ecm.widget.dialog.MessageDialog({
                text: "'КриптоПро ЭЦП Browser plug-in' не установлен либо не активирован."
            });

            messageDialog.show();

            return ;

        }

        var certificates = digitalSignatureService.getCertificates();

        var sign = dojo.hitch(this, function(certificate) {

            digitalSignatureService.sign(
                item,
                certificate,
                function(callback) {

                    // сохранить подпись в аннотации

                    var params = {
                        repositoryId: repository.id,
                        repositoryType: repository.type,
                        documentId: documentId
                    };

                    ecm.model.Request.postPluginService("CryptoProPlugin", "AddDigitalSignatureService", "application/x-www.form-urlencoded", {
                        requestParams: params,
                        requestBody: callback,
                        requestCompleteCallback: dojo.hitch(this, function(response){

                            if (response.status == 1) {

                                var messageDialog = new ecm.widget.dialog.MessageDialog({
                                    text: "Документ успешно подписан"
                                });

                                messageDialog.show();

                            } else {

                                var messageDialog = new ecm.widget.dialog.MessageDialog({
                                    text: "Ошибка подписания документа"
                                });

                                messageDialog.show();

                            }

                        })
                    });

                }, function(errCallback) {

                    console.log("Ошибка подписания документа. ", errCallback);

                    var messageDialog = new ecm.widget.dialog.MessageDialog({
                        text: "Ошибка подписания документа. " + errCallback
                    });

                    messageDialog.show();

                }
            );

        });

        if (certificates.length > 1) {

            console.log("Количество сертификатов более одного, показываем окно выбора сертификата.");

            var chooseCertificateDialog = new ChooseCertificateDialog();

            chooseCertificateDialog.show(certificates, dojo.hitch(this, function(certificate){

                console.log("Выбран сертификат: ", certificate);

                sign(certificate);

            }))

        } else {

            var certificate = certificates[0];

            sign(certificate);

        }

        /*

        if (!this.addDigitalSignatureDialog) {

            this.addDigitalSignatureDialog = new AddDigitalSignatureDialog();

        }

        this.addDigitalSignatureDialog.show(repository, items, function (callback){


        });

        */

    });

    lang.setObject("listDigitalSignatures", function(repository, items) {

        if (!this.listDigitalSignaturesDialog) {

            this.listDigitalSignaturesDialog = new ListDigitalSignaturesDialog();

        }

        this.listDigitalSignaturesDialog.show(items[0], function (callback){


        });

    });

    lang.setObject("addDigitalSignatureFromViewer", function(repositoryId, itemId) {

        console.log("addDigitalSignatureFromViewer action. repositoryId: ", repositoryId, ", itemId: ", itemId);

        var repositories = ecm.model.desktop.repositories ;

        for (var i = 0; i < repositories.length; i++) {

            var repository = repositories[i];

            if (repository.id == repositoryId) {

                // поиск документа

                repository.retrieveItem(itemId, function(item) {

                    if (item) {

                        console.log("Найден документ: ", item);

                        var addDigitalSignature = dojo.getObject("addDigitalSignature");

                        if (addDigitalSignature) {

                            var items = [item];

                            console.log("Вызываем подписание. Репозиторий: ", item.repository, ", элементы: ", items);

                            dojo.hitch(this, addDigitalSignature(item.repository, items));

                        }

                    }

                });

            }

        }


    });

    // инициализация сервиса подписания эцп

    console.log("\t инициализация сервиса подписания документов ЭПЦ.");

    var digitalSignatureService = new DigitalSignatureService();

    console.log("\t сервис подписания документов ЭЦП: ", digitalSignatureService);

    digitalSignatureService.postCreate();

    // var active = digitalSignatureService.isActive();

    // console.log("\t сервис подписания документов ЭЦП активен?: ", active);

    console.log("Инициализация расширения 'КриптоПро ЭЦП' завершена.");

})