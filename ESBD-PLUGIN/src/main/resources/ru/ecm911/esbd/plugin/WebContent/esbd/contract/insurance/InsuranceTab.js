/**
 * Компонент, отвечающий за отображения информации по
 * договору страхования во вкладке на главной странице
 *
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/date/locale",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dijit/layout/TabContainer",
    "dijit/form/Button",
    "dijit/DropDownMenu",
    "dijit/MenuItem",
    "ecm/widget/DropDownButton",
    "ecm/model/Request",
    "ecm/model/ContentItem",
    "esbd/contract/insurance/InsurancePane",
    "esbd/contract/insurance/TerminateInsuranceDialog",
    "esbd/contract/insurance/DuplicateInsuranceDialog",
    "esbd/contract/insurance/AddInsuranceDialog"
], function(
    declare,
    lang,
    locale,
    ContentPane,
    BorderContainer,
    TabContainer,
    Button,
    DropDownMenu,
    MenuItem,
    DropDownButton,
    Request,
    ContentItem,
    InsurancePane,
    TerminateInsuranceDialog,
    DuplicateInsuranceDialog,
    AddInsuranceDialog
) {

	return declare("esbd.contract.insurance.InsuranceTab", [
		BorderContainer
	], {

		value: null,
		readOnly: false,
		terminateButton: null,
		insurancePane: null,    // компонент для работы с договором страхования

		postCreate: function() {

            var buttons = new ContentPane({
                region: "top",
            });

            var menu = new DropDownMenu({style: "display: none"});

            var reissueItem = new MenuItem({
                label: "Дубликат",
                onClick: dojo.hitch(this, function(){
                    this._onReIssue();
                })
            });

            menu.addChild(reissueItem);

            var cancelItem = new MenuItem({
                label: "Ошибка оператора",
                onClick: dojo.hitch(this, function(){
                    this._onCancel();
                })
            });

            menu.addChild(cancelItem);

            var prematureItem = new MenuItem({
                label: "Досрочное расторжение",
                onClick: dojo.hitch(this, function(){
                    this._onPremature();
                })
            });

            menu.addChild(prematureItem);

            var recreateItem = new MenuItem({
                label: "С последующим оформлением",
                onClick: dojo.hitch(this, function(){
                    this._onReCreate();
                })
            });

            menu.addChild(recreateItem);

            this.terminateButton = new DropDownButton({
                label: "Рассторжение",
                disabled: this.readOnly,
                dropDown: menu
            });

            buttons.addChild(this.terminateButton);

            this.addChild(buttons);

            this.insurancePane = new InsurancePane({
                region: "center",
                readOnly: this.readOnly,
                onOpen: dojo.hitch(this, function(contentItem){
                    this.onOpen(contentItem);
                })
            });

		    this.addChild(this.insurancePane);

		},

        setValue: function(value) {

            this.value = value ;

            this._setLocalValue();

        },

        _setLocalValue: function(value) {

            if (this.value) {

                this.insurancePane.setValue(this.value);

                if (this.value.getValue("ESBD_Status") == "Действующий") {

                    this.terminateButton.set("disabled", false);

                } else {

                    this.terminateButton.set("disabled", true);

                }

            }

        },

        _onReIssue: function() {

            // создание нового полиса на основании существующего
            // создается новый полис, далее он загружается и
            // открывается в новой вкладке
            // при этом старый полис меняет статус на "Окончен"
            // а в новом полисе сохраняется ссылка на старый

            var dialog = new DuplicateInsuranceDialog({
                title: "Выпуск дубликата",
                resizable: false,
                onSubmit: dojo.hitch(this, function(){

                    var repository = ecm.model.desktop.repositories[0];

                    var data = {
                        id : this.value.getValue("Id"),
                        submitDate: dialog.getSubmitDate(),
                        certificateNumber: dialog.getCertificateNumber()
                    };

                    Request.invokePluginService("ESBDPlugin", "InsuranceContractPluginService", {
                        requestParams: {
                            name: "duplicate",
                            repositoryId: repository.id,
                            data: JSON.stringify(data)
                        },
                        requestCompleteCallback: dojo.hitch(this, dojo.hitch(this, function(response){

                            if (response && response.response && response.id) {

                                // обновить старый полис и затем загрузить новый полис

                                repository.retrieveItem(this.value.id, dojo.hitch(this, function(item){

                                    this.setValue(item);

                                    repository.retrieveItem(response.id, dojo.hitch(this, function(newItem){

                                        this.onOpen(newItem);

                                        dialog.hide();

                                    }));

                                }));

                            }

                        }))

                    });

                })

            });

            dialog.setSubmitDate(new Date());

            dialog.show();

        },

        _onCancel: function() {

            var dialog = new TerminateInsuranceDialog({
                title: "Ошибка оператора",
                resizable: false,
                hasReturnOfPremium: false,
                onSubmit: dojo.hitch(this, function(){

                    this._update(dialog, {
                        date: dialog.getDate(),
                        reason: dialog.getComment(),
                        status: "Окончен"
                    })

                })

            });

            dialog.setIntroText("Расторжение договора по причине ошибочного ввода данных оператором");

            dialog.setDate(new Date());

            dialog.setComment("Ошибка оператора");

            dialog.show();

        },

        _onPremature: function() {

            var premium = this.value.getValue("ESBD_Premium");

            var startDate = this.value.getValue("ESBD_StartDate");

            if (startDate) {

                var pattern = startDate.indexOf(".") > -1 ? "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'" : "yyyy-MM-dd'T'HH:mm:ss'Z'" ;

                startDate = locale.parse(startDate, {datePattern: pattern, selector: "date"});

            }

            var endDate = this.value.getValue("ESBD_EndDate");

            if (endDate) {

                var pattern = endDate.indexOf(".") > -1 ? "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'" : "yyyy-MM-dd'T'HH:mm:ss'Z'" ;

                endDate = locale.parse(endDate, {datePattern: pattern, selector: "date"});

            }

            var dialog = new TerminateInsuranceDialog({
                title: "Досрочное рассторжение",
                resizable: false,
                hasReturnOfPremium: true,
                premium: premium,
                startDate, startDate,
                endDate, endDate,
                onSubmit: dojo.hitch(this, function(){

                    this._update(dialog, {
                        date: dialog.getDate(),
                        reason: dialog.getComment(),
                        returnOfPremium: dialog.getReturnOfPremium(),
                        status: "Окончен"
                    })

                })
            });

            dialog.setIntroText("Досрочное рассторжение договора страхования");

            dialog.setDate(new Date());

            dialog.setComment("");

            dialog.setReturnOfPremium(0.0);

            dialog.show();

        },

        _update: function(dialog, params) {

            var repository = ecm.model.desktop.repositories[0];

            var data = {
                id : this.value.getValue("Id"),
                terminateDate : params.date,
                terminateReason : params.reason,
                status : params.status
            };

            if (params.returnOfPremium) {

                data.returnOfPremium = params.returnOfPremium ;

            }

            Request.invokePluginService("ESBDPlugin", "InsuranceContractPluginService", {
                requestParams: {
                    name: "update",
                    repositoryId: repository.id,
                    data: JSON.stringify(data)
                },
                requestCompleteCallback: dojo.hitch(this, dojo.hitch(this, function(response){

                    if (response && response.response && response.response == "success") {

                        repository.retrieveItem(this.value.id, dojo.hitch(this, function(item){

                            this.setValue(item);

                            dialog.hide();

                        }));

                    }

                }))

            });

        },

        _onReCreate: function() {

            var value = this.value.clone();

            value.setValue("Id", null);

            value.setValue("ESBD_Source", this.value.getValue("Id"));

            value.setValue("ESBD_DocumentNumber", null);

            value.setValue("ESBD_SubmitDate", new Date());

            var startDate = new Date();

            value.setValue("ESBD_StartDate", startDate);

            var endDate = new Date();

            endDate.setFullYear(endDate.getFullYear() + 1);

            value.setValue("ESBD_EndDate", endDate);

            value.setValue("ESBD_InsuranceCertificateNumber", null);

            value.setValue("ESBD_Premium", null);

            value.setValue("ESBD_CalculatedPremium", null);

            var dialog = new AddInsuranceDialog({
                readOnly: false,
                value: value,
                onSubmit: dojo.hitch(this, function(contentItem){

                    var newValue = contentItem ;

                    // обновим предыдущий документ

                    var repository = ecm.model.desktop.repositories[0];

                    repository.retrieveItem(this.value.getValue("Id"), dojo.hitch(this, function(contentItem){

                        this.setValue(contentItem);

                        // откроем новый документ

                        this.onOpen(newValue);

                        dialog.hide();

                    }));

                })
            });

            dialog.show();

        },

        onOpen: function(contentItem) {
        }

	});

});
