define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "cryptopro/Utils",
    "dijit/layout/ContentPane",
    "ecm/widget/TitlePane",
    "ecm/widget/StateSelect",
    "ecm/widget/dialog/BaseDialog",
    "dojo/text!./templates/AddDigitalSignatureDialog.html"
], function(
    declare,
    lang,
    Utils,
    ContentPane,
    TitlePane,
    StateSelect,
    BaseDialog,
    template)
{

    var CADESCOM_CADES_BES = 1;

    var CADESCOM_CADES_X_LONG_TYPE_1 = 0x5d;

    var CADESCOM_BASE64_TO_BINARY = 1;

	return declare("cryptopro.AddDigitalSignatureDialog", [
		BaseDialog
	], {

		contentString: template,

		widgetsInTemplate: true,

        // конпка подписания
        _signButton: null,

        // репозиторий объектов, в рамках которого выполняется подписание
        repository: null,

        // список объектов для подписания
        items: null,

        // функция обратного вызова при завершении работы диалога
        callback: null,

        _applet: null,
        _appletConfig: null,
        _cert: null,
        _storeObj: null,
        _signObj: null,
        _signedDataObj: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(true);

			this.setResizable(true);

			this.set("title", "Подписание документа");

            this.setIntroText("Согласно статье 4 ФЗ «Об электронной цифровой подписи», ЭЦП признаётся равнозначной собственноручной подписи в документе на бумажном носителе при условии, что сертификат ключа подписи, относящийся к этой ЭЦП, не утратил силу (действует) на момент проверки или на момент подписания электронного документа при наличии доказательств, определяющих момент подписания.");

            this._button = this.addButton("Подписать", "_onAdd", true, true, "SELECT");

            this.connect(this.appletFrame, "load", lang.hitch(this, function(){

                this._appletWinLoaded();

            }));

		},

        _appletWinLoaded: function(){

            console.log("выполнена загрузка фрейма с плагином КриптоПро, инициализация ...");

            var object = this.appletFrame.contentWindow;

            object.parentDialog = this;

            if (object.initialize()) {

                this._button.setDisabled(false);

            };

        },

        /**
         * запускается из плагинного фрейма TODO: Поправить
         * @param errDesc - описание ошибки
         */
        signInitError: function(errDesc){

            // Utils.showError("Ошибка плагина: \n" + errDesc)

        },

        /**
         * запускается из плагинного фрейма
         * @param storeObj - объект для работы с контейнерами
         * @param signObj - объект для работы с подписью
         */
        initialize: function(storeObj, signObj, signedData){

            /*

            var opt = this._config.providerOptions;

            if(!opt.provType){

                Utils.showError("Не определена конфигурация провайдера!")

                return ;

            }

            this._appletConfig = {
                signatureType: opt.signatureType,
                tsURL: opt.tsURL
            };

            */

            this._storeObj = storeObj;

            this._signedDataObj = signedData;

            this._signObj = signObj;

            try {

                var certs = storeObj.Certificates;

                var cnt = storeObj.Certificates.Count;

                if (cnt == 0) {

                    // Utils.showError("Не найдены личные сертификаты!");

                    return false;

                } else if (cnt == 1) {

                    this._cert = certs.Item(1);

                    this.containerFieldNode.innerHTML = Utils.extractNameFromDn(this._cert.SubjectName);

                    this._showCertInfo();

                } else {

                    var data = [];

                    for (var i = 1; i <= cnt; i++) {

                        var cert = certs.Item(i);

                        var nm = Utils.extractNameFromDn(cert.SubjectName) + " (" + Utils.extractNameFromDn(cert.IssuerName) + " " + this.joinDate(cert.ValidFromDate) +  ")";

                        data.push({value: i + "", label: nm});

                    }

                    this._containerField = new StateSelect({

                        options: data,

                        onChange: lang.hitch(this, function(val) {
                            this._cert = storeObj.Certificates.Item(val*1);
                            this._showCertInfo();
                        })

                    }, this.containerFieldNode);

                    this._cert = certs.Item(1);

                    this._showCertInfo();

                }

                return true ;

                // this.onInitReady();

            } catch (e) {

                // Utils.showError(e.message || e);

                console.log(e);

                return false ;

            }

        },

        _showCertInfo: function() {

            if(!this._cert) return;

            var info = this._cert;

            this.certInfoNode.innerHTML =  '<b>Кому выдан:</b> '+info.SubjectName + "<BR><BR>"+
                '<b>Кем выдан:</b> ' + info.IssuerName + "<BR><BR>" +
                '<b>Срок действия:</b> ' + this.joinDate(info.ValidFromDate) + ' - ' + this.joinDate(info.ValidToDate) ;

        },

        destroy: function() {
            delete this._keyContainer;
            delete this._applet;
            delete this._appletConfig;

            this.certInfoNode.innerHTML = "";

            if(this.containerFieldNode.destroy){

                this.containerFieldNode.destroyRecursive()

            }

            this.inherited(arguments);

        },

        joinDate: function(certDate){

            var dt = new Date(certDate)

            var check = function(digit){

                return (digit<10) ? "0" + digit : digit

            };

            return check(dt.getUTCDate()) + "." + check(dt.getMonth()+1) + "." + dt.getFullYear();

        },

		show: function(repository, items, callback) {

            var d = this.inherited(arguments);

            this.repository = repository;

            this.items = items ;

            this.callback = callback;

            return d;

		},

		_onAdd: function() {

		    console.log("Нажата кнопка 'Подписать' ...");

            // формируем URL для запроса контента документа

            for (var i = 0; i < this.items.length; i++) {

                var item = this.items[i] ;

                console.log("item: ", item);

                ecm.model.Request.invokePluginService("CryptoProPlugin", "GetContentService", {
                    requestParams: {
                        repositoryId: item.repository.id,
                        repositoryType: item.repository.type,
                        documentId: item.docid
                    },
                    requestCompleteCallback: dojo.hitch(this, function(response){

                        console.log("Результат: ", response);

                    })
                });

                var servicesUrl = ecm.model.desktop.servicesUrl ;

                var docUrl = servicesUrl + "/jaxrs/" + this.repository.type + "/getDocument?docid=" + encodeURIComponent(item.id) + "&repositoryId=" + encodeURIComponent(this.repository.id);

                var url = ecm.model.Request.setSecurityToken(docUrl);

                console.log("  сформирован url для запроса контента документа '" + url + "'");

                var deffered = dojo.xhrGet({

                    url: url,

                    load: dojo.hitch(this, function(data, args) {

                        try {

                            console.log("Данные загружены...");

                            this._signObj.Certificate = this._cert;

                            var certificate = this._cert.Export(0);

                            console.log("  сертификат: ", certificate);

                            this._signObj.TSAAddress = "http://www.cryptopro.ru/tsp/tsp.srf";

                            this._signObj.Options = 1; //CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN

                            // Значение свойства ContentEncoding должно быть задано
                            // до заполнения свойства Content

                            this._signedDataObj.ContentEncoding = CADESCOM_BASE64_TO_BINARY;

                            // преобразуем поток данных в base64

                            var base64 = btoa(unescape(encodeURIComponent(data)));

                            this._signedDataObj.Content = base64;

                            // var detached = (this._appletConfig.signatureType == "CADESDET");

                            var detached = true;

                            var digitalSignature = this._signedDataObj.SignCades(this._signObj, CADESCOM_CADES_BES);

                            this._storeObj.Close();

                            // что делать с подписью дальше

                            var params = {
                                repositoryId: this.repository.id,
                                repositoryType: this.repository.type,
                                documentId: item.docid,
                                sig: digitalSignature
                            };

                            ecm.model.Request.invokePluginService("CryptoProPlugin", "AddDigitalSignatureService", {
                                requestParams: params,
                                requestCompleteCallback: dojo.hitch(this, function(response){

                                    console.log("Результат: ", response);

                                    if (response.status == 1) {

                                        this.hide();

                                    }

                                })
                            });

                        } catch (ex) {

                            console.log("Ошибка подписания: ", ex);

                        }

                    }),

                    error: dojo.hitch(this, function(data, args) {

                        console.log("  данные не загружены");

                    })

                })

            }



		},

        DoSigning: function(itemId, repositoryId, content) {

            try{

                this._signObj.Certificate = this._cert;

                this._signObj.TSAAddress = this._appletConfig.tsURL;

                this._signObj.Options = 1; //CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN
                // Значение свойства ContentEncoding должно быть задано
                // до заполнения свойства Content

                this._signedDataObj.ContentEncoding = CADESCOM_BASE64_TO_BINARY;

                this._signedDataObj.Content = content;

                var detached = (this._appletConfig.signatureType == "CADESDET");

                var signature = this._signedDataObj.SignCades(this._signObj, CADESCOM_CADES_X_LONG_TYPE_1, detached);

                this._storeObj.Close();

                return {
                    "type": this._appletConfig.signatureType,
                    "signature": signature
                };

            } catch(e) {

                console.log(e.number);

                console.log(e.message || e);

                throw e

            }

        },

		onCancel: function() {

			this.inherited(arguments);

		}

	});

});
