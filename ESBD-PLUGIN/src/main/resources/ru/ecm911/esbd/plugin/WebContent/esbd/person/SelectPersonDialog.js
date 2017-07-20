/**
 * Диалоговое окно для выбора
 * физического лица
 *
 **/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "ecm/model/ContentItem",
    "ecm/widget/dialog/BaseDialog",
    "esbd/person/PersonDialog",
    "dojo/text!./templates/SelectPersonDialog.html"
], function(
    declare,
    lang,
    ContentItem,
    BaseDialog,
    PersonDialog,
    template)
{

	return declare("esbd.person.SelectPersonDialog", [
		BaseDialog
	], {

		contentString: template,
		widgetsInTemplate: true,
		dialog: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(true);

			this.setResizable(true);

            this.set("title", "Физическое лицо");

            this.setIntroText("Для поиска клиентов используйте информацию об ИИН, фамилии, имени или году рождения. Выберите интересующего Вас клиента в результатах поиска и нажмите \"Выбрать\". Если нужный вам клиент не найден, Вы можете его добавить нажав кнопку \"Добавить\"");

            this.addButton("Добавить", "_onAdd", false, true, "ADD");

            this.selectButton = this.addButton("Выбрать", "_onSelect", false, true, "SELECT");

            this.personList.set("onSelectionChange", dojo.hitch(this, function(selectedItems){

                if (selectedItems && selectedItems[0]) {

                    var disabled = !(selectedItems != null && selectedItems[0] != null);

                    this.selectButton.set("disabled", disabled);

                }


            }));

			this.personList.set("onSelect", dojo.hitch(this, function(selectedItem){

				this._onSelect();

			}));

		},

		show: function() {

			this.inherited(arguments);

			this.personList.reset();

		},

		_getDialog: function() {

		    if (!this.dialog) {

		        this.dialog = new PersonDialog({

		            onSelect: dojo.hitch(this, function(person){

		                this.dialog.hide();

		                this.onSelect(person);

		            })

		        });

		    }

		    return this.dialog ;

		},

		_onAdd: function() {

            var repository = ecm.model.desktop.repositories[0];

            repository.retrieveContentClassList(dojo.hitch(this, function(contentClasses){

                var contentClass = contentClasses[0];

                contentClass.retrieveAttributeDefinitions(dojo.hitch(this, function(attributeDefinitions){

                    var value = new ContentItem();

                    for (var index = 0; index < attributeDefinitions.length; index++) {

                        var attributeDefinition = attributeDefinitions[index];

                        if (attributeDefinition.system || attributeDefinition.hidden) {

                            continue ;

                        }

                        value.setValue(attributeDefinition.id, null);

                    }

					var dialog = this._getDialog();

					dialog.setValue(value);

					dialog.show();

                }))

            }), ["ESBD_Person"]);

		},

		_onSelect: function() {

		    var selectedItems = this.personList.getSelectedItems();

            if (selectedItems != null && selectedItems.length > 0) {

                var selectedItem = selectedItems[0];

				var repository = ecm.model.desktop.repositories[0];

				repository.retrieveItem(selectedItem.id, dojo.hitch(this, function(item){

					var dialog = this._getDialog();

					dialog.setValue(item);

					dialog.show();

				}));

            }

		},

		onSelect: function(item) {
		}

	});

});
