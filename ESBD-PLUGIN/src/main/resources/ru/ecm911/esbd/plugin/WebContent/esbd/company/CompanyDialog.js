/**
 * Диалоговое окно для работы с
 * информацией о страховой компании
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "ecm/widget/dialog/BaseDialog",
    "ecm/widget/dialog/YesNoCancelDialog",
    "dojo/text!./templates/CompanyDialog.html"
], function(
    declare,
    lang,
    BaseDialog,
    YesNoCancelDialog,
    template)
{

	return declare("esbd.company.CompanyDialog", [
		BaseDialog
	], {

		contentString: template,
		widgetsInTemplate: true,
		submitButton: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(true);

			this.setResizable(true);

            this.submitButton = this.addButton("Сохранить", "_onSubmit", false, true, "ADD");

		},

        setValue: function(value) {

            this.contentItem = value ;

            this._setLocalValue();

        },

        _setLocalValue: function() {

            if (this.contentItem) {

                var properties = [];

                for (var attributeName in this.contentItem.attributes) {

                    if (!this.contentItem.isSystemProperty(attributeName)) {

                        properties.push({
                            name: attributeName,
                            type: this.contentItem.getAttributeType(attributeName),
                            value: this.contentItem.getValue(attributeName)
                        });

                    }

                }

                this.companyBox.setValue(properties);

                this.set("title", "Страховая компания");

                this.setIntroText("Информация о страховой компании");

                this.submitButton.set("label", "Сохранить");

            } else {

                this.set("title", "Новая страховая компания");

                this.setIntroText("Информация о страховой компании");

                this.submitButton.set("label", "Сохранить");

                this.companyBox.setValue(null);

            }

        },

		_onSubmit: function() {

		    if (this.contentItem) {

		        // изменение информации о юридическом лице

		        var isDirty = this.companyBox.isDirty ;

		        if (isDirty) {

                    var dialog = new YesNoCancelDialog({

                        title: "Вопрос",

                        text: "Информация о страховой компании была изменена. Сохранить?",

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

            var isValid = this.companyBox.isValid();

            if (!isValid) {

                return ;

            }

            var properties = this.companyBox.getValue();

            var repository = ecm.model.desktop.repositories[0];

            if (this.contentItem) {

                // обновление информации о транспортном средстве

                repository.lockItems([this.contentItem], dojo.hitch(this, function(result){

                    this.contentItem.checkIn(
                        this.contentItem.template,	// class name
                        properties,				    // properties
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

            } else {

                // создание транспортного средства

                repository.retrieveItem("/Страховые компании", dojo.hitch(this, function(folder){

                    repository.addDocumentItem(
                        folder,
                        repository.objectStoreName,
                        "ESBD_Company",
                        properties,
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
