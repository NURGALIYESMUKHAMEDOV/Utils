/**
 * Диалоговое окно для работы с
 * информацией о юридическом лице
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "ecm/widget/dialog/BaseDialog",
    "ecm/widget/dialog/YesNoCancelDialog",
    "esbd/Utils",
    "dojo/text!./templates/EntityDialog.html"
], function(
    declare,
    lang,
    BaseDialog,
    YesNoCancelDialog,
    Utils,
    template)
{

	return declare("esbd.entity.EntityDialog", [
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

            this.entityBox.setValue(this.contentItem);

            if (this.contentItem.getValue("Id")) {

                this.set("title", "Юридическое лицо");

                this.setIntroText("При необходимости обновите информацию о клиенте");

                this.submitButton.set("label", "Далее");

            } else {

                this.set("title", "Новый клиент");

                this.setIntroText("Укажите информацию о новом клиенте");

                this.submitButton.set("label", "Сохранить");

            }

        },

		_onSubmit: function() {

		    if (this.contentItem.getValue("Id")) {

		        // изменение информации о юридическом лице

		        var isDirty = this.entityBox.isDirty ;

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

            var isValid = this.entityBox.isValid();

            if (!isValid) {

                return ;

            }

            var value = this.entityBox.getValue();

            var name = value.getValue("ESBD_Name");

            value.setValue("DocumentTitle", name);

            var repository = ecm.model.desktop.repositories[0];

            if (value.getValue("Id")) {

                // обновление информации о транспортном средстве

                repository.retrieveItem(this.contentItem.id, dojo.hitch(this, function(item){

                    repository.lockItems([item], dojo.hitch(this, function(result){

                        item.checkIn(
                            item.template,	// class name
                            Utils.getCriterias(value),	// properties
                            "Item",					    // content source type, "Item" - no content
                            null,					    // mime type
                            null,					    // filename
                            null,					    // content
                            null,					    // childComponentValues
                            null,					    // permissions
                            null,					    // securityPolicyId
                            null,					    // newVersion
                            false,					    // checkInAsMinorVersion
                            false,					    // autoClassify
                            dojo.hitch(this, function(item){
                                this.contentItem = item;
                                this.onSelect(this.contentItem);
                            })
                        );

                    }));

                }));

            } else {

                // создание транспортного средства

                repository.retrieveItem("/Клиенты/Юридические лица", dojo.hitch(this, function(folder){

                    repository.addDocumentItem(
                        folder,
                        repository.objectStoreName,
                        "ESBD_Entity",
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
