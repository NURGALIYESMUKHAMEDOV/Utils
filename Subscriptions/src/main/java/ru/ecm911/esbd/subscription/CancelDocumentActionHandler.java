package ru.ecm911.esbd.subscription;

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

public class CancelDocumentActionHandler implements EventActionHandler {

    private static final String OBJECT_ID_PROPERTY = "ESBD_ObjectId" ;

    private static final String STATUS_PROPERTY = "ESBD_Status" ;

    private static final String TERMINATE_DATE_PROPERTY = "ESBD_TerminateDate" ;

    private static final String TERMINATE_REASON_PROPERTY = "ESBD_TerminateReason" ;

    private static final String RETURN_OF_PREMIUM_PROPERTY = "ESBD_ReturnOfPremium" ;

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

        Date terminateDate = action.getProperties().getDateTimeValue(TERMINATE_DATE_PROPERTY);

        getLogger().info("terminate date is " + terminateDate);

        String terminateReason = action.getProperties().getStringValue(TERMINATE_REASON_PROPERTY);

        getLogger().info("terminate reason is " + terminateReason);

        Double returnOfPremium = action.getProperties().getFloat64Value(RETURN_OF_PREMIUM_PROPERTY);

        getLogger().info("return of premium is " + returnOfPremium);

        Document document = Factory.Document.fetchInstance(event.getObjectStore(), objectId, propertyFilter);

        getLogger().info("object is " + document);

        // обновляем свойства исходного документа

        getLogger().info("update object");

        document.getProperties().putValue(STATUS_PROPERTY, "Аннулирован");

        document.getProperties().putValue(TERMINATE_DATE_PROPERTY, terminateDate);

        document.save(RefreshMode.NO_REFRESH);

        // удаляем информацию о действии

        action.delete();

        action.save(RefreshMode.NO_REFRESH);

    }

    private Logger getLogger() {

        return logger != null ? logger : (logger = Logger.getLogger(getClass().getName()));

    }

}
