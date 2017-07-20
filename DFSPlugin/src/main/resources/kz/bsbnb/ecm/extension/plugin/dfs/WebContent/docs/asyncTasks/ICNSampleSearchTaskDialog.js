define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/dom-class",
	"ecm/model/Desktop",
	"ecm/widget/search/SearchBuilderDialog",
	"ecm/widget/taskManager/BaseTaskCreationDialog",
	"ecm/util/_Dialog"
], function(declare, lang, construct, style, domClass, Desktop, SearchBuilderDialog, BaseTaskCreationDialog, dialog) {

	/**
	 * @name docs.asyncTasks.ICNSampleSearchTaskDialog
	 * @class Provides a dialog that provides the capability to do searches.
	 * @augments ecm.widget.dialog.SearchBuilderDialog
	 */
	return declare("docs.asyncTasks.ICNSampleSearchTaskDialog", [
	     SearchBuilderDialog
	], {
		/** @lends ecm.widget.taskManager.BaseTaskCreationDialog.prototype */
		
		/**
		 * Creates and initializes this dialog.
		 */
		postCreate: function() {
			this.setMaximized(true);
			this.repository = Desktop.getAuthenticatingRepository();

			this.inherited(arguments);
			
			style.set(this.builder.searchResultsPane.domNode, "display", "none");
			style.set(this.builder.searchDefinition.resultsDisplayButton.domNode, "display", "none");
			style.set(this.builder.searchDefinition.resultsDisplayOptions.domNode, "display", "none");

			
			this.builder.searchDefinition.searchButton.onClick = lang.hitch(this, function(){
				this.baseTaskCreationDialog = new BaseTaskCreationDialog({
					asyncTaskType : this.asyncTaskType
				});
				this.baseTaskCreationDialog.show();
				dialog.manage(this.baseTaskCreationDialog);
				
				this.connect(this.baseTaskCreationDialog, "onBeforeScheduling", function(){
					this._setTaskParameters();
				});
				
				this.connect(this.baseTaskCreationDialog, "onSchedulingFinished", function(){
					this.onCancel();
				});
			});
			
			this.setTitle("Schedule Sample ICN Search Task");
		},
		
		_setTaskParameters: function(){
			var template = this.builder.searchDefinition.searchTemplate;
			
			this.baseTaskCreationDialog.taskParameters.desktop = Desktop.id;
			this.baseTaskCreationDialog.taskParameters.repositoryId = template.repository.id;
			this.baseTaskCreationDialog.taskParameters.criterias = template.getQueryString();
			this.baseTaskCreationDialog.taskParameters.searchJsonPost = template.toJson(true);
		}
	});
});
