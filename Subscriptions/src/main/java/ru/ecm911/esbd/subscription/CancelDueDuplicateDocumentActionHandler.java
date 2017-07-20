package ru.ecm911.esbd.subscription;

import com.filenet.api.constants.AutoClassify;
import com.filenet.api.constants.CheckinType;
import com.filenet.api.constants.FilteredPropertyType;
import com.filenet.api.constants.RefreshMode;
import com.filenet.api.core.Document;
import com.filenet.api.core.Factory;
import com.filenet.api.engine.EventActionHandler;
import com.filenet.api.events.ObjectChangeEvent;
import com.filenet.api.exception.EngineRuntimeException;
import com.filenet.api.property.PropertyFilter;
import com.filenet.api.util.Id;

import java.util.Date;
import java.util.logging.Logger;

/**
 * Расторжение с выпуском дубликата
 *
 */
public class CancelDueDuplicateDocumentActionHandler implements EventActionHandler {

    private static final String CONTRACT_CLASS_NAME = "ESBD_InsuranceContract" ;

    private static final String OBJECT_ID_PROPERTY = "ESBD_ObjectId" ;

    private static final String COMPANY_CODE_PROPERTY = "ESBD_CompanyCode" ;

    private static final String COMPANY_PROPERTY = "ESBD_Company" ;

    private static final String INSURER_PROPERTY = "ESBD_Insurer" ;

    private static final String INSURED_CLIENTS_PROPERTY = "ESBD_InsuredClients" ;

    private static final String INSURED_VEHICLES_PROPERTY = "ESBD_InsuredVehicles" ;

    private static final String SUBMIT_DATE_PROPERTY = "ESBD_SubmitDate" ;

    private static final String START_DATE_PROPERTY = "ESBD_StartDate" ;

    private static final String END_DATE_PROPERTY = "ESBD_EndDate" ;

    private static final String INSURANCE_CERTIFICATE_NUMBER_PROPERTY = "ESBD_InsuranceCertificateNumber" ;

    private static final String BRANCH_PROPERTY = "ESBD_Branch" ;

    private static final String DOCUMENT_NUMBER_PROPERTY = "ESBD_DocumentNumber" ;

    private static final String IS_DRAFT_PROPERTY = "ESBD_IsDraft" ;

    private static final String PREMIUM_PROPERTY = "ESBD_Premium" ;

    private static final String CALCULATED_PREMIUM_PROPERTY = "ESBD_CalculatedPremium" ;

    private static final String STATUS_PROPERTY = "ESBD_Status" ;

    private static final String PAYMENT_TYPE_PROPERTY = "ESBD_PaymentType" ;

    private static final String PAYMENT_DATE_PROPERTY = "ESBD_PaymentDate" ;

    private static final String SOURCE_PROPERTY = "ESBD_Source" ;

    private static final String SUCCESSOR_PROPERTY = "ESBD_Successor" ;

    private static final String TERMINATE_DATE_PROPERTY = "ESBD_TerminateDate" ;

    private Logger logger ;

    @Override
    public void onEvent(ObjectChangeEvent event, Id subscriptionId) throws EngineRuntimeException {

        getLogger().entering(getClass().getName(), "onEvent", new Object[]{event, subscriptionId});

        getLogger().info("retrieve source object [action]");

        PropertyFilter propertyFilter = new PropertyFilter();

        propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

        Document action = Factory.Document.fetchInstance(event.getObjectStore(), event.get_SourceObjectId(), propertyFilter);

        getLogger().info("action is " + action);

        Id objectId = action.getProperties().getIdValue(OBJECT_ID_PROPERTY);

        getLogger().info("object id is " + objectId);

        Date submitDate = action.getProperties().getDateTimeValue(SUBMIT_DATE_PROPERTY);

        getLogger().info("submit date is " + submitDate);

        String certificateNumber = action.getProperties().getStringValue(INSURANCE_CERTIFICATE_NUMBER_PROPERTY);

        getLogger().info("certificate number is " + certificateNumber);

        Document document = Factory.Document.fetchInstance(event.getObjectStore(), objectId, propertyFilter);

        getLogger().info("object is " + document);

        // создаем новый объект на базе старого

        getLogger().info("create new object");

        Document newDocument = Factory.Document.createInstance(event.getObjectStore(), CONTRACT_CLASS_NAME);

        // копируем значения из старого объекта в новый

        newDocument.getProperties().putValue(COMPANY_CODE_PROPERTY, document.getProperties().getStringValue(COMPANY_CODE_PROPERTY));

        newDocument.getProperties().putValue(COMPANY_PROPERTY, document.getProperties().getEngineObjectValue(COMPANY_PROPERTY));

        newDocument.getProperties().putValue(INSURER_PROPERTY, document.getProperties().getIdValue(INSURER_PROPERTY));

        newDocument.getProperties().putValue(INSURED_CLIENTS_PROPERTY, document.getProperties().getIdListValue(INSURED_CLIENTS_PROPERTY));

        newDocument.getProperties().putValue(INSURED_VEHICLES_PROPERTY, document.getProperties().getIdListValue(INSURED_VEHICLES_PROPERTY));

        newDocument.getProperties().putValue(IS_DRAFT_PROPERTY, document.getProperties().getBooleanValue(IS_DRAFT_PROPERTY));

        newDocument.getProperties().putValue(SUBMIT_DATE_PROPERTY, submitDate);

        newDocument.getProperties().putValue(START_DATE_PROPERTY, document.getProperties().getDateTimeValue(START_DATE_PROPERTY));

        newDocument.getProperties().putValue(END_DATE_PROPERTY, document.getProperties().getDateTimeValue(END_DATE_PROPERTY));

        newDocument.getProperties().putValue(BRANCH_PROPERTY, document.getProperties().getInteger32Value(BRANCH_PROPERTY));

        newDocument.getProperties().putValue(INSURANCE_CERTIFICATE_NUMBER_PROPERTY, certificateNumber);

        newDocument.getProperties().putValue(PREMIUM_PROPERTY, document.getProperties().getFloat64Value(PREMIUM_PROPERTY));

        newDocument.getProperties().putValue(CALCULATED_PREMIUM_PROPERTY, document.getProperties().getFloat64Value(CALCULATED_PREMIUM_PROPERTY));

        newDocument.getProperties().putValue(PAYMENT_TYPE_PROPERTY, document.getProperties().getStringValue(PAYMENT_TYPE_PROPERTY));

        newDocument.getProperties().putValue(PAYMENT_DATE_PROPERTY, document.getProperties().getDateTimeValue(PAYMENT_DATE_PROPERTY));

        newDocument.getProperties().putValue(STATUS_PROPERTY, "Зарегистрирован");

        newDocument.getProperties().putValue(SOURCE_PROPERTY, document.get_Id());

        newDocument.checkin(AutoClassify.DO_NOT_AUTO_CLASSIFY, CheckinType.MAJOR_VERSION);

        newDocument.save(RefreshMode.REFRESH);

        // обновляем свойства исходного документа

        getLogger().info("update object");

        document.getProperties().putValue(STATUS_PROPERTY, "Аннулирован");

        document.getProperties().putValue(SUCCESSOR_PROPERTY, newDocument.get_Id());

        document.getProperties().putValue(TERMINATE_DATE_PROPERTY, new Date());

        document.save(RefreshMode.NO_REFRESH);

        // удаляем информацию о действии

        action.delete();

        action.save(RefreshMode.NO_REFRESH);

    }

    private Logger getLogger() {

        return logger != null ? logger : (logger = Logger.getLogger(getClass().getName()));

    }

    private void log(String message) {

        System.out.println(message);

    }

}
