package kz.bsbnb.ecm.extension.plugin.dfs.asyncTasks;

import java.io.File;
import java.io.IOException;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.Iterator;

import com.filenet.api.collection.DocumentSet;
import com.filenet.api.constants.RefreshMode;
import com.filenet.api.core.Document;
import com.filenet.api.core.Domain;
import com.filenet.api.core.ObjectStore;
import com.filenet.api.query.SearchSQL;
import com.filenet.api.query.SearchScope;
import com.filenet.api.util.UserContext;
import com.ibm.ecm.task.Constants;
import com.ibm.ecm.task.TaskLogger;
import com.ibm.ecm.task.commonj.work.BaseTask;
import com.ibm.ecm.task.commonj.work.Utils;
import com.ibm.ecm.task.entities.Task;
import com.ibm.ecm.util.p8.P8Util;
import com.ibm.json.java.JSONObject;
import kz.bsbnb.ecm.extension.plugin.dfs.asyncTasks.p8.P8FilenetUtils;
import kz.bsbnb.ecm.extension.plugin.dfs.asyncTasks.p8.P8Utils;

import com.ibm.casemgmt.api.Case;
import com.ibm.casemgmt.api.CaseType;
import com.ibm.casemgmt.api.constants.ModificationIntent;
import com.ibm.casemgmt.api.context.CaseMgmtContext;
import com.ibm.casemgmt.api.context.P8ConnectionCache;
import com.ibm.casemgmt.api.context.SimpleP8ConnectionCache;
import com.ibm.casemgmt.api.context.SimpleVWSessionCache;
import com.filenet.api.core.*;
import com.ibm.casemgmt.api.objectref.ObjectStoreReference;

public class SampleICNTask extends BaseTask {

	private File storeDir;
	private String storePath;

	public SampleICNTask(Task task, File logDirectory) throws IOException {
		super(task, logDirectory);
	}

	public void performTask() {
		try {
			TaskLogger.fine(SampleICNTask.class.toString(), "performTask", "Starting sample ICN task.");

			addAuditRecord("SampleICNTask Add", "SampleICNTask Action", "SampleICNTask Status", "Started by Administrator");
			
			//grabbing information from the task info
			JSONObject taskInfo = JSONObject.parse(task.getTaskInfo());
			JSONObject results = new JSONObject();
			results.put("results", "This task completed successfully!");

			saveTaskInfo(results, taskInfo);

			String uri = (String)taskInfo.get("uri");
			String user = (String)taskInfo.get("user");
			String pass = (String)taskInfo.get("password");
			String dom = (String)taskInfo.get("dom");
			String objStoreName = (String)taskInfo.get("objectStore");
			String folderPath = (String)taskInfo.get("folderPath");
			this.storePath = (String)taskInfo.get("storePath");

			if(this.storePath != null){

				this.storeDir = new File(this.storePath);
				if((!this.storeDir.exists()) || (!this.storeDir.isDirectory())){

					throw new RuntimeException("Store path " + this.storePath + "invalid!");

				}

			}

			getLogger().fine("URI=>" + uri + ", USER=>" + user + ", PASSWORD=>" + pass + ", DOMAIN=" + dom);

			Domain domain = P8Utils.getP8Connection(uri, user, pass, dom);
			ObjectStore os = P8Utils.fetchObjectStoreInstance(domain, objStoreName);
			P8ConnectionCache connCache = new SimpleP8ConnectionCache();

			getLogger().fine("objStoreName=" + os.get_Name());

			CaseMgmtContext origCmctx = CaseMgmtContext.set(new CaseMgmtContext(new SimpleVWSessionCache(), connCache));

			String SQLstringContract = "Select * from [PPG_Card]";
			SearchSQL sql = new SearchSQL(SQLstringContract);
			SearchScope search = new SearchScope(os);
			DocumentSet documents = (DocumentSet)search.fetchObjects(sql, null, null, Boolean.valueOf(true));



			for(Iterator it = documents.iterator(); it.hasNext();){

				Document document = (Document)it.next();

				Date currentDate = new Date();

				Date taskDate = null;

				String kvartalName = document.getProperties().getStringValue("PPG_PlannedPeriodProcurement");
				Integer yearCount = document.getProperties().getInteger32Value("PPG_Year");

				System.out.println("kvartalName = " + kvartalName);

				Calendar startCalendar = new GregorianCalendar();

				if(kvartalName.equals("1 квартал") || kvartalName.equals("1-2 квартал") || kvartalName.equals("1-3 квартал") || kvartalName.equals("1-4 квартал")){

					startCalendar.set(yearCount, Calendar.JANUARY, 1);

					taskDate = startCalendar.getTime();

				}else if(kvartalName.equals("2 квартал") ||  kvartalName.equals("2-3 квартал") || kvartalName.equals("2-4 квартал")){

					startCalendar.set(yearCount, Calendar.APRIL, 1);

					taskDate = startCalendar.getTime();

				}else if(kvartalName.equals("3 квартал") || kvartalName.equals("3-4 квартал")){

					startCalendar.set(yearCount, Calendar.JULY, 1);

					taskDate = startCalendar.getTime();

				}else if(kvartalName.equals("4 квартал")){

					startCalendar.set(yearCount, Calendar.OCTOBER, 1);

					taskDate = startCalendar.getTime();

				}

				if(taskDate.after(currentDate)){

					CaseType myCaseType = CaseType.fetchInstance(new ObjectStoreReference(os), "PPG_AssignmentCase");

					Case newPendingCase = Case.createPendingInstance(myCaseType);

					newPendingCase.getProperties().putObjectValue("PPG_PlannedPeriodProcurement", document.getProperties().getStringValue("PPG_PlannedPeriodProcurement"));
					newPendingCase.getProperties().putObjectValue("PPG_UnitMeasurement", document.getProperties().getStringValue("PPG_UnitMeasurement"));
					newPendingCase.getProperties().putObjectValue("PPG_QuantityVolume", document.getProperties().getFloat64Value("PPG_QuantityVolume"));
					newPendingCase.getProperties().putObjectValue("PPG_DeliveryAddress", document.getProperties().getStringValue("PPG_DeliveryAddress"));
					newPendingCase.getProperties().putObjectValue("PPG_CustomerName", document.getProperties().getStringValue("PPG_CustomerName"));
					newPendingCase.getProperties().putObjectValue("PPG_NamePurchasedGoods", document.getProperties().getStringValue("PPG_NamePurchasedGoods"));
					newPendingCase.getProperties().putObjectValue("PPG_TotalAmount", document.getProperties().getFloat64Value("PPG_TotalAmount"));
					newPendingCase.getProperties().putObjectValue("PPG_Responsible", document.getProperties().getInteger32Value("PPG_Responsible"));
					newPendingCase.getProperties().putObjectValue("PPG_Approver", document.getProperties().getInteger32Value("PPG_Approver"));
					newPendingCase.getProperties().putObjectValue("PPG_ForecastAmountSecondYear", document.getProperties().getFloat64Value("PPG_ForecastAmountSecondYear"));
					newPendingCase.getProperties().putObjectValue("PPG_ForecastAmountThirdYear", document.getProperties().getStringValue("PPG_ForecastAmountThirdYear"));
					newPendingCase.getProperties().putObjectValue("PPG_AmountAdvancePayment", document.getProperties().getInteger32Value("PPG_AmountAdvancePayment"));
					newPendingCase.getProperties().putObjectValue("PPG_ProcurementMethod", document.getProperties().getStringValue("PPG_ProcurementMethod"));
					newPendingCase.getProperties().putObjectValue("PPG_ApprovedAmount", document.getProperties().getFloat64Value("PPG_ApprovedAmount"));
					newPendingCase.getProperties().putObjectValue("PPG_TypePurchasedGoods", document.getProperties().getStringValue("PPG_TypePurchasedGoods"));
					newPendingCase.getProperties().putObjectValue("PPG_UnitPrice", document.getProperties().getFloat64Value("PPG_UnitPrice"));
					newPendingCase.getProperties().putObjectValue("PPG_KindSubjectProcurement", document.getProperties().getStringValue("PPG_KindSubjectProcurement"));
					newPendingCase.getProperties().putObjectValue("PPG_AssignmentText", document.getProperties().getStringValue("PPG_AssignmentText"));

					newPendingCase.save(RefreshMode.REFRESH, null, ModificationIntent.MODIFY);
					String newCaseIdentifier = newPendingCase.getIdentifier();

					getLogger().fine("newCaseIdentifier---> " + newCaseIdentifier);

				}

			}

			CaseMgmtContext.set(origCmctx);



			addAuditRecord("SampleICNTask End", "SampleICNTask Action", "SampleICNTask Status", "Task finished.");
		}
		catch(Exception exp){
			this.addError(new Long(0), Utils.captureStackTrace(exp));
			setTaskStatus(Constants.TASK_STATUS_FAILED);
		}
		finally {
			if(UserContext.get().getSubject() != null)
				UserContext.get().popSubject();
		}
		
	}
	
	public void saveTaskInfo(JSONObject results, JSONObject taskInfo) throws Exception {
		//Saves results for this task on the task's completion.  Developers should be overriding this method to provide implementation for their own task.
		//For an execution record, the result will be saved to the execution's records info.
		String resultsString = results.serialize();

		if(this.taskExecutionRecord != null && (this.task.getTaskMode() == Constants.TASK_RECURRING || this.task.getTaskMode() == Constants.TASK_CALENDAR_ACTION)){
			this.taskExecutionRecord.setTaskExecutionInfo(results.serialize());
			this.updateTaskExecutionRecord();
		}
		else
			taskInfo.put("results", resultsString);

		this.task.setTaskInfo(taskInfo.serialize());

		this.updateTask();
	}
	
	/**
	 * Retrieves the p8 entity id from the doc id string inside of Nexus.  Usually the docId is a combination of className, objectStoreId, itemId.  
	 * Document,{431087A1-82E2-4D34-967D-05DC65F135F8},{3EF43278-18B5-4762-B387-53CD9D9E25FD}
	 * @param docIdString
	 * @return
	 */
	public static String getIdFromDocIdString(String docIdString){

		if(docIdString != null){
			String[] splitFolderId = docIdString.split(",");
			if(splitFolderId.length >= 3)
				return splitFolderId[2];
		}

		return null;
	}
}