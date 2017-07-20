package kz.exe;

import javax.security.auth.Subject;
import java.util.*;

import com.filenet.api.collection.DocumentSet;
import com.filenet.api.constants.RefreshMode;
import com.filenet.api.core.Connection;
import com.filenet.api.query.SearchSQL;
import com.filenet.api.query.SearchScope;
import com.filenet.api.util.UserContext;
import com.ibm.casemgmt.api.Case;
import com.ibm.casemgmt.api.CaseType;
import com.ibm.casemgmt.api.constants.ModificationIntent;
import com.ibm.casemgmt.api.context.CaseMgmtContext;
import com.ibm.casemgmt.api.context.P8ConnectionCache;
import com.ibm.casemgmt.api.context.SimpleP8ConnectionCache;
import com.ibm.casemgmt.api.context.SimpleVWSessionCache;
import com.filenet.api.core.*;
import com.ibm.casemgmt.api.objectref.ObjectStoreReference;

import org.apache.log4j.Logger;

/**
 * Created by Nurgali.Yesmukhamedo on 16.07.2017.
 */
public class StartCases {

    final static Logger logger = Logger.getLogger(StartCases.class);

    public static void main(String args[]){

        String CE_URI = "http://localhost:9080/wsi/FNCEWS40MTOM";
        String USER_NAME = "p8admin";
        String PASSWORD = "12345Mnbvcxz";

        P8ConnectionCache connCache = new SimpleP8ConnectionCache();
        Connection conn = connCache.getP8Connection(CE_URI);
        Subject subject = UserContext.createSubject(conn, USER_NAME, PASSWORD, "FileNetP8WSI");

        UserContext uc = UserContext.get();
        uc.pushSubject(subject);

        Locale origLocale = uc.getLocale();
        uc.setLocale(new Locale("en"));

        Domain domain = Factory.Domain.fetchInstance(conn, "p8dom", null);
        ObjectStore os = Factory.ObjectStore.fetchInstance(domain, "TOS", null);
        System.out.println("Objectstore is: " + os.get_Name());
        logger.info("Objectstore is: " + os.get_Name());

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
                //newPendingCase.getProperties().putObjectValue("PPG_Year", document.getProperties().getInteger32Value("PPG_Year"));
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

                // Save it now to get access to the Case ID
                newPendingCase.save(RefreshMode.REFRESH, null, ModificationIntent.MODIFY);
                String newCaseIdentifier = newPendingCase.getIdentifier();

                System.out.println("newCaseIdentifier---> " + newCaseIdentifier);

                // Fetch a fresh copy of the case instance (not sure if this is necessary)
               /// newPendingCase = Case.fetchInstanceFromIdentifier(new ObjectStoreReference(os), newCaseIdentifier);

                //newPendingCase.save(RefreshMode.REFRESH, null, ModificationIntent.MODIFY);

            }

        }


        /*CaseMgmtContext origCmctx = CaseMgmtContext.set(new CaseMgmtContext(new SimpleVWSessionCache(), connCache));

        try {

            CaseType myCaseType = CaseType.fetchInstance(new ObjectStoreReference(os), "PPG_AssignmentCase");



            Case newPendingCase = Case.createPendingInstance(myCaseType);

            newPendingCase.getProperties().putObjectValue("PPG_UnitMeasurement", "Штука");
            newPendingCase.getProperties().putObjectValue("PPG_AssignmentText", "Тестовый текст");
            newPendingCase.getProperties().putObjectValue("PPG_CustomerName", "АО \"Банковское сервисное бюро НБК\"");

            // Save it now to get access to the Case ID
            newPendingCase.save(RefreshMode.REFRESH, null, ModificationIntent.MODIFY);
            String newCaseIdentifier = newPendingCase.getIdentifier();

            System.out.println("newCaseIdentifier---> " + newCaseIdentifier);

            // Fetch a fresh copy of the case instance (not sure if this is necessary)
            newPendingCase = Case.fetchInstanceFromIdentifier(new ObjectStoreReference(os), newCaseIdentifier);

            newPendingCase.save(RefreshMode.REFRESH, null, ModificationIntent.MODIFY);

        }
        finally {
            CaseMgmtContext.set(origCmctx);
            uc.setLocale(origLocale);
            uc.popSubject();
        }*/

        CaseMgmtContext.set(origCmctx);
        uc.setLocale(origLocale);
        uc.popSubject();

    }

}
