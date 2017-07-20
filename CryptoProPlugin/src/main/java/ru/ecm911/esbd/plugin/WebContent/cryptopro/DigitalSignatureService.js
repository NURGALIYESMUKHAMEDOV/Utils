define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dojo/_base/window"
], function (
    declare,
    lang,
    domConstruct,
    win
){

    var digitalSignatureService = declare("cryptopro.DigitalSignatureService", null, {

		postCreate: function() {

		    console.log("\tсоздание объекта сервиса подписания документа ЭЦП");

            if (navigator.appName != "Microsoft Internet Explorer") {

                var userAgent = navigator.userAgent;

                var isIE = userAgent.match(/Trident\/./i);

                if (!isIE) {

                    console.log("\t добавление тега <object> в тело документа, dojo: ", dojo);

                    var _attrs = {
                        id: "cadesplugin",
                        type: "application/x-cades",
                        class: "hiddenObject"
                    };

                    var _object = domConstruct.create("object", _attrs, win.body(), "last");

                    console.log("\t был добавлен тег <object> в тело документа. object: ", _object);

                }

            }

        },

        _createObject: function(name) {

            switch (navigator.appName) {

                case 'Microsoft Internet Explorer':

                    return new ActiveXObject(name);

                default:

                    var userAgent = navigator.userAgent;

                    if (userAgent.match(/Trident\/./i)) { // IE10, 11

                        return new ActiveXObject(name);

                    }

                    var _plugin = document.getElementById('cadesplugin');

                    return _plugin.CreateObject(name);

            }

        },

        isActive: function() {

            var _active = false ;

            console.log("\t проверка загрузки плагина сервиса подписания документ ЭЦП");

            try {

                var aboutObj = this._createObject("CAdESCOM.About");

                console.log("\t Плагин загружен. Версия " + ( aboutObj.PluginVersion || aboutObj.Version ));

            } catch (e) {

                console.log("\t ошибка загрузки плагина. Exception = ", e);

                return false ;

            }

            return true ;

        },

        _getStoreObj: function() {

            try {

                if (!this._storeObj) {

                    this._storeObj = this._createObject("CAPICOM.store");

                    this._storeObj.Open(2, "My", 0); // CAPICOM_CURRENT_USER_STORE, "My", CAPICOM_STORE_OPEN_READ_ONLY

                }

            } catch (e) {

                console.log("\t Ошибка получения объекта 'CAPICOM.store'. Exception: ", e);

                this._storeObj = null ;

            }

            return this._storeObj ;

        },

        _getSignerObj: function() {

            try {

                if (!this._signerObj) {

                    this._signerObj = this._createObject("CAdESCOM.CPSigner");

                }

            } catch (e) {

                console.log("\t Ошибка получения объекта 'CAdESCOM.CPSigner'. Exception: ", e);

                this._signerObj = null ;

            }

            return this._signerObj ;

        },

        _getSignedDataObj: function() {

            try {

                if (!this._signedDataObj) {

                    this._signedDataObj = this._createObject("CAdESCOM.CadesSignedData");

                }

            } catch (e) {

                console.log("\t Ошибка получения объекта 'CAdESCOM.CadesSignedData'. Exception: ", e);

                this._signedDataObj = null ;

            }

            return this._signedDataObj ;

        },

        // возвращает список доступных сертификатов в формате JSON
        // {
        //   serialNumber: "серийный номер сертификата в хранилище"
        //   subject: "полное имя сертификата"
        //   issuer: "полное имя органа, выдавшего сертификат"
        //   notAfter: дата, после которой сертификат не валиден
        //   notBefore: дата, до которой сертификат не валиден
        // }
        getCertificates: function() {

            // получение списка сертификатов

            var data = [];

            try {

                var storeObj = this._getStoreObj();

                if (storeObj) {

                    // получить список сертификатов из хранилища

                    var certificates = storeObj.Certificates ;

                    var cnt = certificates.Count ;

                    for (var i = 1; i <= cnt; i++) {

                        // для каждого сертификата сформировать информационный объект

                        var certificate = certificates.Item(i);

                        // console.log("\t найден сертификат: ", certificate);

                        // var nm = Utils.extractNameFromDn(certificate.SubjectName) + " (" + Utils.extractNameFromDn(cert.IssuerName) + " " + this.joinDate(cert.ValidFromDate) +  ")";

                        data.push({
                            serialNumber: certificate.SerialNumber,
                            subject: certificate.SubjectName,
                            issuer: certificate.IssuerName,
                            notAfter: certificate.ValidToDate,
                            notBefore: certificate.ValidFromDate,
                            version: certificate.Version
                        });

                    }

                }

            } catch (e) {

                console.log("\t ошибка получения списка сертификатов. Exception: ", e);

            }

            return data ;

        },

        // возвращает сертификат по его имени
        _getCertificateBySerialNumber: function(serialNumber) {

            try {

                var storeObj = this._getStoreObj();

                if (storeObj) {

                    // получить список сертификатов из хранилища

                    var certificates = storeObj.Certificates;

                    var cnt = certificates.Count ;

                    for (var i = 1; i <= cnt; i++) {

                        // для каждого сертификата сформировать информационный объект

                        var certificate = certificates.Item(i);

                        if (certificate.SerialNumber == serialNumber) {

                            return certificate ;

                        }

                    }

                }

            } catch (e) {

                console.log("\t ошибка получения сертификата по его имени. Exception: ", e);

            }

            return null ;

        },

        sign: function(item, certificate, callback, errCallback) {

            // объект "Сертификат"

            var certificateObj = this._getCertificateBySerialNumber(certificate.serialNumber);

            if (!certificateObj) {

                errCallback("Ошибка подписания. Не найден сертификат");

                return ;

            }

            var signerObj = this._getSignerObj();

            if (!signerObj) {

                errCallback("Ошибка подписания. Невозможно создать объект 'CAdESCOM.CPSigner'.");

                return ;

            }

            var signedDataObj = this._getSignedDataObj();

            if (!signedDataObj) {

                errCallback("Ошибка подписания. Невозможно создать объект 'CAdESCOM.CadesSignedData'.");

                return ;

            }

            signerObj.Certificate = certificateObj ;

            signerObj.TSAAddress = "http://testca.cryptopro.ru/tsp/" ;

            signerObj.Options = 1; // CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN

            signedDataObj.ContentEncoding = 1; // CADESCOM_BASE64_TO_BINARY;

            var repositoryType = item.repository.type ;

            var repositoryId = item.repository.id ;

            var url = ecm.model.Request.getServiceRequestUrl("plugin", "", {
                plugin: "CryptoProPlugin",
                action: "GetContentService",
                repositoryId: item.repository.id,
                repositoryType: item.repository.type,
                id: item.id.split(",")[2]
            });

            url = ecm.model.Request.appendSecurityToken(url);

            var servicesUrl = ecm.model.desktop.servicesUrl ;

            var docUrl = servicesUrl + "/jaxrs/" + repositoryType + "/getDocument?docid=" + encodeURIComponent(item.id) + "&repositoryId=" + encodeURIComponent(repositoryId);

            // var url = ecm.model.Request.setSecurityToken(docUrl);

            console.log("url: ", url);

            var deffered = dojo.xhrGet({

                url: url,

                load: dojo.hitch(this, function(data, args) {

                    try {

                        // преобразуем поток данных в base64

                        // var base64 = btoa(unescape(encodeURIComponent(data)));

                        signedDataObj.Content = data;

                        var detached = true;

                        var _cmsData = signedDataObj.SignCades(signerObj, 1, detached); // CADESCOM_CADES_BES - 1, CADESCOM_CADES_X_LONG_TYPE_1 - 0x5D

                        callback(_cmsData);

                    } catch (ex) {

                        errCallback(ex);

                    }

                }),

                error: dojo.hitch(this, function(data, args) {

                    errCallback("Ошибка получения контента");

                })

            });

        },

        destroy: function() {

            try {

                var storeObj = this._getStoreObj();

                if (storeObj) {

                    storeObj.Close();

                }

            } catch (e) {

            }

        }

    });

    return digitalSignatureService ;

});