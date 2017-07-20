package ru.ecm911.esbd.subscription;

import com.filenet.api.constants.*;
import com.filenet.api.core.Document;
import com.filenet.api.core.Factory;
import com.filenet.api.core.IndependentlyPersistableObject;
import com.filenet.api.core.VersionSeries;
import com.filenet.api.engine.HandlerCallContext;
import com.filenet.api.engine.SweepActionHandler;
import com.filenet.api.engine.SweepItemOutcome;
import com.filenet.api.property.PropertyFilter;
import com.filenet.api.sweep.CmSweep;
import com.filenet.api.sweep.CmSweepPolicy;
import com.filenet.api.util.Id;
import com.ibm.casemgmt.api.Case;
import com.ibm.casemgmt.api.CaseType;
import com.ibm.casemgmt.api.constants.ModificationIntent;
import com.ibm.casemgmt.api.objectref.ObjectStoreReference;

import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.concurrent.TimeUnit;
import org.apache.log4j.Logger;

/**
 * Created by Nurgali.Yesmukhamedo on 12.07.2017.
 */
public class PPG_CreationNewCaseSweepActionHandler implements SweepActionHandler {

    private Logger logger = Logger.getLogger(PPG_CreationNewCaseSweepActionHandler.class);

    @Override
    public void onSweep(CmSweep cmSweep, SweepItem[] sweepItems) {

        //logger.entering(getClass().getName(), "onSweep", new Object[]{cmSweep, sweepItems});

        logger.info("onSweep is not supported");

        //logger.exiting(getClass().getName(), "onSweep");

        System.out.println("JASA");

    }

    @Override
    public void onPolicySweep(CmSweep cmSweep, CmSweepPolicy cmSweepPolicy, SweepItem[] sweepItems) {



        System.out.println("JASA");

        //logger.entering(getClass().getName(), "onPolicySweep", new Object[]{cmSweep, cmSweepPolicy, sweepItems});

        logger.info("sweep is '" + cmSweep + "'");
        System.out.println("sweep is '" + cmSweep + "'");

        logger.info("sweepPolicy is '" + cmSweepPolicy + "'");
        System.out.println("sweepPolicy is '" + cmSweepPolicy + "'");


        HandlerCallContext context = HandlerCallContext.getInstance();

        logger.info("context is '" + context + "'");
        System.out.println("context is '" + context + "'");

        for (SweepItem sweepItem : sweepItems) {

            sweepItem.setOutcome(SweepItemOutcome.FAILED, "Класс водителя рассчитан + newCaseIdentifier" );

            logger.info("sweepItem is '" + sweepItem + "'");
            System.out.println("sweepItem is '" + sweepItem + "'");

            IndependentlyPersistableObject object = sweepItem.getTarget();

            logger.info("\tobject is '" + object + "'");
            System.out.println("\tobject is '" + object + "'");

            Date currentDate = new Date();

            Date taskDate = null;

            String kvartalName = object.getProperties().getStringValue("PPG_PlannedPeriodProcurement");
            Integer yearCount = object.getProperties().getInteger32Value("PPG_Year");

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

                CaseType myCaseType = CaseType.fetchInstance(new ObjectStoreReference(cmSweepPolicy.getObjectStore()), "PPG_AssignmentCase");

                Case newPendingCase = Case.createPendingInstance(myCaseType);

                newPendingCase.getProperties().putObjectValue("PPG_PlannedPeriodProcurement", object.getProperties().getStringValue("PPG_PlannedPeriodProcurement"));
                newPendingCase.getProperties().putObjectValue("PPG_UnitMeasurement", object.getProperties().getStringValue("PPG_UnitMeasurement"));
                newPendingCase.getProperties().putObjectValue("PPG_Year", object.getProperties().getInteger32Value("PPG_Year"));
                newPendingCase.getProperties().putObjectValue("PPG_QuantityVolume", object.getProperties().getFloat64Value("PPG_QuantityVolume"));
                newPendingCase.getProperties().putObjectValue("PPG_DeliveryAddress", object.getProperties().getStringValue("PPG_DeliveryAddress"));
                newPendingCase.getProperties().putObjectValue("PPG_CustomerName", object.getProperties().getStringValue("PPG_CustomerName"));
                newPendingCase.getProperties().putObjectValue("PPG_NamePurchasedGoods", object.getProperties().getStringValue("PPG_NamePurchasedGoods"));
                newPendingCase.getProperties().putObjectValue("PPG_TotalAmount", object.getProperties().getFloat64Value("PPG_TotalAmount"));
                newPendingCase.getProperties().putObjectValue("PPG_Responsible", object.getProperties().getInteger32Value("PPG_Responsible"));
                newPendingCase.getProperties().putObjectValue("PPG_Approver", object.getProperties().getInteger32Value("PPG_Approver"));
                newPendingCase.getProperties().putObjectValue("PPG_ForecastAmountSecondYear", object.getProperties().getFloat64Value("PPG_ForecastAmountSecondYear"));
                newPendingCase.getProperties().putObjectValue("PPG_ForecastAmountThirdYear", object.getProperties().getStringValue("PPG_ForecastAmountThirdYear"));
                newPendingCase.getProperties().putObjectValue("PPG_AmountAdvancePayment", object.getProperties().getInteger32Value("PPG_AmountAdvancePayment"));
                newPendingCase.getProperties().putObjectValue("PPG_ProcurementMethod", object.getProperties().getStringValue("PPG_ProcurementMethod"));
                newPendingCase.getProperties().putObjectValue("PPG_ApprovedAmount", object.getProperties().getFloat64Value("PPG_ApprovedAmount"));
                newPendingCase.getProperties().putObjectValue("PPG_TypePurchasedGoods", object.getProperties().getStringValue("PPG_TypePurchasedGoods"));
                newPendingCase.getProperties().putObjectValue("PPG_UnitPrice", object.getProperties().getFloat64Value("PPG_UnitPrice"));
                newPendingCase.getProperties().putObjectValue("PPG_KindSubjectProcurement", object.getProperties().getStringValue("PPG_KindSubjectProcurement"));
                newPendingCase.getProperties().putObjectValue("PPG_AssignmentText", object.getProperties().getStringValue("PPG_AssignmentText"));

                // Save it now to get access to the Case ID
                newPendingCase.save(RefreshMode.REFRESH, null, ModificationIntent.MODIFY);
                String newCaseIdentifier = newPendingCase.getIdentifier();

                System.out.println("newCaseIdentifier---> " + newCaseIdentifier);

                // Fetch a fresh copy of the case instance (not sure if this is necessary)
                newPendingCase = Case.fetchInstanceFromIdentifier(new ObjectStoreReference(cmSweepPolicy.getObjectStore()), newCaseIdentifier);

                newPendingCase.save(RefreshMode.REFRESH, null, ModificationIntent.MODIFY);

            }
                // фиксируем информацию в задаче

            sweepItem.setOutcome(SweepItemOutcome.PROCESSED, "Класс водителя рассчитан + newCaseIdentifier" );


        }

    }

    @Override
    public String[] getRequiredProperties() {
        return new String[0];
    }
}
