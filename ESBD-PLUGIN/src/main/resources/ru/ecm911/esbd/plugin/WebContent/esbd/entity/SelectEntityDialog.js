define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "ecm/model/ContentItem",
    "ecm/widget/dialog/BaseDialog",
    "esbd/entity/EntityDialog",
    "dojo/text!./templates/SelectEntityDialog.html"
], function(
    declare,
    lang,
    ContentPane,
    ContentItem,
    BaseDialog,
    EntityDialog,
    template)
{

	return declare("esbd.entity.SelectEntityDialog", [
		BaseDialog
	], {

		contentString: template,
		widgetsInTemplate: true,
		dialog: null,

		postCreate: function() {

			this.inherited(arguments);

			this.setMaximized(true);

			this.setResizable(true);

            this.set("title", "Юридическое лицо");

            this.setIntroText("Поиск юридического лица");

            this.addButton("Добавить", "_onAdd", false, true, "ADD");

            this.selectButton = this.addButton("Выбрать", "_onSelect", false, true, "SELECT");

            this.entityList.set("onSelectionChange", dojo.hitch(this, function(selectedItems){

                if (selectedItems && selectedItems[0]) {

                    var disabled = !(selectedItems != null && selectedItems[0] != null);

                    this.selectButton.set("disabled", disabled);

                }


            }));

			this.entityList.set("onSelect", dojo.hitch(this, function(selectedItem){

				this._onSelect();

			}));

		},

		show: function() {

			this.inherited(arguments);

			this.entityList.reset();

		},

		_getDialog: function() {

		    if (!this.dialog) {

		        this.dialog = new EntityDialog({

		            onSelect: dojo.hitch(this, function(entity){

		                this.dialog.hide();

		                this.onSelect(entity);

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

            }), ["ESBD_Entity"]);

		},

		_onSelect: function() {

		    var selectedItems = this.entityList.getSelectedItems();

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
