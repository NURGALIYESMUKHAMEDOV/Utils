define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "cryptopro/Utils",
    "dijit/layout/ContentPane",
    "ecm/widget/TitlePane",
    "ecm/widget/StateSelect",
    "ecm/widget/dialog/BaseDialog",
    "dojo/text!./templates/ListDigitalSignaturesDialog.html"
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

	return declare("cryptopro.ListDigitalSignaturesDialog", [
		BaseDialog
	], {

		contentString: template,

		widgetsInTemplate: true,

        // документ для которого отображаются ЭЦП
        item: null,

        // функция обратного вызова при завершении работы диалога
        callback: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(true);

			this.setResizable(true);

			this.set("title", "ЭЦП");

            this.setIntroText("Согласно статье 4 ФЗ «Об электронной цифровой подписи», ЭЦП признаётся равнозначной собственноручной подписи в документе на бумажном носителе при условии, что сертификат ключа подписи, относящийся к этой ЭЦП, не утратил силу (действует) на момент проверки или на момент подписания электронного документа при наличии доказательств, определяющих момент подписания.");

		},

		show: function(item, callback) {

            var d = this.inherited(arguments);

            this.item = item ;

            this.callback = callback;

            this.digitalSignaturesList.startup();

            this.digitalSignaturesList.setItem(item);

            this.digitalSignaturesList.retrieveData();

            return d;

		}


	});

});
