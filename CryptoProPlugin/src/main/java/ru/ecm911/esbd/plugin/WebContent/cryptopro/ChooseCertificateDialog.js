define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "ecm/widget/TitlePane",
    "ecm/widget/StateSelect",
    "ecm/widget/dialog/BaseDialog",
    "dojo/text!./templates/ChooseCertificateDialog.html"
], function(
    declare,
    lang,
    ContentPane,
    TitlePane,
    StateSelect,
    BaseDialog,
    template)
{

	return declare("cryptopro.ChooseCertificateDialog", [
		BaseDialog
	], {

		contentString: template,

		widgetsInTemplate: true,

		// поле выбора сертификата из списка
		_selectList: null,

		// список сертификатов
		_certificates: null,

		// выбранный сертификат
		_certificate: null,

        // конпка выбора
        _selectButton: null,

        // функция обратного вызова при завершении работы диалога
        callback: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(false);

			this.setResizable(true);

			this.set("title", "Выбор сертификата ЭЦП");

            this.setIntroText("Согласно статье 4 ФЗ «Об электронной цифровой подписи», ЭЦП признаётся равнозначной собственноручной подписи в документе на бумажном носителе при условии, что сертификат ключа подписи, относящийся к этой ЭЦП, не утратил силу (действует) на момент проверки или на момент подписания электронного документа при наличии доказательств, определяющих момент подписания.");

            this.setSize(800, 450);

            this._selectButton = this.addButton("Выбрать", "_onSelect", true, true, "SELECT");

		},

		show: function(certificates, callback) {

            var d = this.inherited(arguments);

            this.callback = callback ;

            this._certificates = certificates ;

            var data = [];

            for (var i = 0; i < this._certificates.length; i++) {

                var certificate = this._certificates[i];

                var result = /CN=(.*?),{1}?/g.exec(certificate.subject);

                data.push({
                    value: i + "",
                    label: result && result[1] ? result[1] : certificate.subject
                });

            }

            this._selectList = new StateSelect({

                options: data,

                onChange: lang.hitch(this, function(val) {

                    this._certificate = this._certificates[val * 1];

                    this._selectButton.setDisabled(false);

                    this._displayCertificate();

                })

            }, this.certificatesNode);

            this._certificate = this._certificates[0];

            this._selectButton.setDisabled(false);

            this._displayCertificate();

            return d;

		},

        _displayCertificate: function() {

            if (!this._certificate) {

                return ;

            }

            this.serialNumberNode.innerHTML = this._certificate.serialNumber ;
            this.subjectNode.innerHTML = this._certificate.subject ;
            this.issuerNode.innerHTML = this._certificate.issuer ;
            this.notBeforeNode.innerHTML = this._certificate.notBefore ;
            this.notAfterNode.innerHTML = this._certificate.notAfter ;

        },

		_onSelect: function() {

            if (!this._certificate) {

                return ;

            }

            this.callback(this._certificate);

            this.hide();

		},

	});

});