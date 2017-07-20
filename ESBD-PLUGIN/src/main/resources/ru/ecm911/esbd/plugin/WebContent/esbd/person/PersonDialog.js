/**
 * Диалоговое окно для работы с
 * информацией о физическом лице
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "ecm/widget/dialog/BaseDialog",
    "ecm/widget/dialog/YesNoCancelDialog",
    "esbd/Utils",
    "dojo/text!./templates/PersonDialog.html"
], function(
    declare,
    lang,
    BaseDialog,
    YesNoCancelDialog,
    Utils,
    template)
{

	return declare("esbd.person.PersonDialog", [
		BaseDialog
	], {

		contentString: template,
		widgetsInTemplate: true,
		submitButton: null,
		contentItem: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(true);

			this.setResizable(true);

            this.submitButton = this.addButton("Добавить", "_onSubmit", false, true, "ADD");

		},

        setValue: function(contentItem) {

            this.contentItem = contentItem ;

            this._setLocalValue();

        },

        _setLocalValue: function() {

            this.personBox.setValue(this.contentItem);

            if (this.contentItem.getValue("Id")) {

                this.set("title", "Физическое лицо");

                this.setIntroText("При необходимости обновите информацию о физическом лице");

                this.submitButton.set("label", "Далее");

            } else {

                this.set("title", "Новый клиент");

                this.setIntroText("Укажите информацию о новом клиенте");

                this.submitButton.set("label", "Сохранить");

            }

        },

		_onSubmit: function() {

		    if (this.contentItem.getValue("Id")) {

		        // изменение информации о клиенте

		        var isDirty = this.personBox.isDirty ;

		        if (isDirty) {

                    var dialog = new YesNoCancelDialog({

                        title: "Вопрос",

                        text: "Информация о клиенте была изменена. Сохранить?",

                        onYes: dojo.hitch(this, function() {

                            dialog.hide();

                            // сохранить сделанные изменения

                            this._update();

                        }),

                        onNo: dojo.hitch(this, function() {

                            dialog.hide();

                            // изменения не требуют сохранения идем далее

                            this.onSelect(this.contentItem);

                        })

		            });

		            dialog.show();

                } else {

                    // ничего не было изменено, идем далее

                    this.onSelect(this.contentItem);

                }

		    } else {

                // добавление нового клиента

                this._update();

		    }

		},

        // создает объект или сохраняет изменения
        // в хранилище
        _update: function() {

            var isValid = this.personBox.isValid();

            if (!isValid) {

                return ;

            }

            var value = this.personBox.getValue();

            var repository = ecm.model.desktop.repositories[0];

            var name = value.getValue("ESBD_LastName") + " " + value.getValue("ESBD_FirstName") + " " + value.getValue("ESBD_MiddleName");

            value.setValue("DocumentTitle", name.trim());

            if (value.getValue("Id")) {

                // обновление информации

                var birthday = value.getValue("ESBD_Birthday");

                var newDate = new Date(birthday.getTime() - birthday.getTimezoneOffset() * 60 * 1000);

                value.setValue("ESBD_Birthday", newDate);

                repository.retrieveItem(this.contentItem.id, dojo.hitch(this, function(item){

                    repository.lockItems([item], dojo.hitch(this, function(result){

                        item.checkIn(
                            item.template,	                        // class name
                            Utils.getCriterias(value),	            // properties
                            "Item",					                // content source type, "Item" - no content
                            null,					                // mime type
                            null,					                // filename
                            null,					                // content
                            null,					                // childComponentValues
                            null,					                // permissions
                            null,					                // securityPolicyId
                            null,					                // newVersion
                            false,					                // checkInAsMinorVersion
                            false,					                // autoClassify
                            dojo.hitch(this, function(item){
                                this.contentItem = item;
                                this.onSelect(this.contentItem);
                            })
                        );

                    }));

                }));

            } else {

                // создание объекта "Физическое лицо"

                repository.retrieveItem("/Клиенты/Физические лица", dojo.hitch(this, function(folder){

                    repository.addDocumentItem(
                        folder,
                        repository.objectStoreName,
                        "ESBD_Person",
                        Utils.getCriterias(value),
                        "Item",
                        null, // mimeType
                        null, // filename
                        null, // content
                        null, // childComponentValues
                        null, // permissions
                        null, // securityPolicyId
                        false, // addAsMinorVersion
                        false, // autoClassify
                        true, // allowDuplicateFileNames
                        true, // setSecurityParent
                        null, // teamspaceId
                        dojo.hitch(this, function (item){
                            this.contentItem = item;
                            this.onSelect(this.contentItem);
                        })
                    );

                }));

            }

        },

		onSelect: function(item) {
		}

	});

});
