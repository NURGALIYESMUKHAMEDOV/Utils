package ru.ecm911.esbd.subscription;

import com.filenet.api.collection.AccessPermissionList;
import com.filenet.api.collection.IndependentObjectSet;
import com.filenet.api.collection.StringList;
import com.filenet.api.constants.*;
import com.filenet.api.core.*;
import com.filenet.api.engine.EventActionHandler;
import com.filenet.api.events.CreationEvent;
import com.filenet.api.events.ObjectChangeEvent;
import com.filenet.api.events.UpdateEvent;
import com.filenet.api.exception.EngineRuntimeException;
import com.filenet.api.property.PropertyFilter;
import com.filenet.api.query.SearchSQL;
import com.filenet.api.query.SearchScope;
import com.filenet.api.security.AccessPermission;
import com.filenet.api.util.Id;

import java.util.Iterator;
import java.util.logging.Logger;

/**
 * Обеспечивает поддержку жизненого цикла документа "Договор страхования"
 * Поддерживает следующие состояния:
 *
 * - Черновик (доступ имеет только автор документа)
 * - Зарегистрирован (доступ имеет только соответствующая страховая компания)
 * - Аннулирован (доступ имеет только соответствующая страховая компания)
 *
 *
 */
public class DocumentLifecycleActionHandler implements EventActionHandler {

    private static final String COMPANY_CLASS_NAME = "ESBD_Company" ;


    private static final String STATUS_PROPERTY = "ESBD_Status" ;

    private static final String COMPANY_CODE_PROPERTY = "ESBD_CompanyCode" ;

    private static final String COMPANY_PROPERTY = "ESBD_Company" ;

    private static final String IS_DRAFT_PROPERTY = "ESBD_IsDraft" ;


    private static final String NEW_STATUS = "Новый" ;

    private static final String REGISTERED_STATUS = "Зарегистрирован" ;

    private Logger logger ;

    @Override
    public void onEvent(ObjectChangeEvent event, Id subscriptionId) throws EngineRuntimeException {

        logger = Logger.getLogger(getClass().getName());

        logger.entering(getClass().getName(), "onEvent", new Object[]{event, subscriptionId});

        if (event instanceof UpdateEvent) {

            logger.info("process update event");

            // проверяем, изменился ли статус документа

            UpdateEvent updateEvent = (UpdateEvent) event;

            StringList propertyNames = updateEvent.get_ModifiedProperties();

            if (propertyNames != null) {

                for (String propertyName : (Iterable<String>) propertyNames) {

                    if (propertyName.equals(IS_DRAFT_PROPERTY)) {

                        PropertyFilter propertyFilter = new PropertyFilter();

                        propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

                        Document document = Factory.Document.fetchInstance(event.getObjectStore(), event.get_SourceObjectId(), propertyFilter);

                        String status = document.getProperties().getStringValue(STATUS_PROPERTY);

                        if (status == null || status.equals(NEW_STATUS)) {

                            // обрабатываем изменение поля "Черновик" только для документов с пустым статусом или
                            // тех у которых статус равен "Новый"

                            Boolean isDraft = document.getProperties().getBooleanValue(IS_DRAFT_PROPERTY);

                            if (Boolean.FALSE.equals(isDraft)) {

                                // меняем статус на "Зарегистрирован"

                                changeStatus(REGISTERED_STATUS, document);

                            }

                            break;

                        }

                    }

                }

            }

        } else if (event instanceof CreationEvent) {

            PropertyFilter propertyFilter = new PropertyFilter();

            propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

            Document document = Factory.Document.fetchInstance(event.getObjectStore(), event.get_SourceObjectId(), propertyFilter);

            logger.info("process create event");

            Boolean isDraft = document.getProperties().getBooleanValue(IS_DRAFT_PROPERTY);

            if (Boolean.FALSE.equals(isDraft)) {

                // меняем статус на "Зарегистрирован"

                changeStatus(REGISTERED_STATUS, document);

            }

        } else {

            // завершаем обработку

            logger.info("event is not supported");

        }

        logger.exiting(getClass().getName(), "onEvent");


    }

    private void changeStatus(String newStatus, Document document) {

        try {

            if (newStatus.equals(REGISTERED_STATUS)) {

                logger.info("change status to '" + REGISTERED_STATUS + "'");

                document.getProperties().putValue(STATUS_PROPERTY, REGISTERED_STATUS);

                // меняем статус на "Зарегистрирован"
                // Для этого:
                //  - убираем доступ для #OWNER
                //  - даем доступ для страховой компании

                String companyCode = document.getProperties().getStringValue(COMPANY_CODE_PROPERTY);

                logger.info("company code is " + companyCode);

                IndependentObject company = getCompanyByCode(document.getObjectStore(), companyCode);

                logger.info("company is " + company);

                document.getProperties().putValue(COMPANY_PROPERTY, company);

                logger.info("set company permissions");

                String owner = document.get_Owner();

                logger.info("current owner is " + owner);

                AccessPermissionList permissions = document.get_Permissions();

                if (permissions != null) {

                    Iterator<AccessPermission> it = permissions.iterator();

                    while (it.hasNext()) {

                        AccessPermission permission = it.next();

                        String grantee = permission.get_GranteeName();

                        if (grantee.equals(owner)) {

                            permissions.remove(permission);

                            document.set_Permissions(permissions);

                            document.save(RefreshMode.NO_REFRESH);

                            logger.info("remove owner permissions");

                            break;

                        }

                    }

                }

                document.save(RefreshMode.NO_REFRESH);

            }

        } catch (Exception e) {

            e.printStackTrace();

            logger.throwing(getClass().getName(), "changeStatus", e);

        }

    }

    private IndependentObject getCompanyByCode(ObjectStore objectStore, String companyCode) {

        String query = "SELECT [This] FROM [" + COMPANY_CLASS_NAME + "] WHERE [" + COMPANY_CODE_PROPERTY + "] = '" + companyCode + "'" ;

        SearchSQL searchSQL = new SearchSQL();

        searchSQL.setQueryString(query);

        SearchScope searchScope = new SearchScope(objectStore);

        IndependentObjectSet objectSet = searchScope.fetchObjects(searchSQL, null, null, false);

        if (objectSet != null) {

            Iterator<IndependentObject> it = objectSet.iterator();

            if (it.hasNext()) {

                return it.next();

            }

        }

        return null ;

    }

    private void process(String previousStatus, Document newObject) {

        PropertyFilter propertyFilter = new PropertyFilter();

        propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

        String newStatus = newObject.getProperties().getStringValue(STATUS_PROPERTY);

        Folder securityFolder = newObject.get_SecurityFolder();

        if (securityFolder == null || !securityFolder.get_Name().equals(newStatus)) {

            // находим соответствующую папку

            Folder destinationFolder = Factory.Folder.fetchInstance(newObject.getObjectStore(), "/Конфигурация/Статус/" + newStatus, propertyFilter);

            if (securityFolder != null) {

                ReferentialContainmentRelationship relationship = securityFolder.unfile(newObject);

                relationship.save(RefreshMode.NO_REFRESH);

            }

            newObject.set_SecurityFolder(destinationFolder);

            newObject.save(RefreshMode.REFRESH);

            ReferentialContainmentRelationship relationship = destinationFolder.file(newObject, AutoUniqueName.AUTO_UNIQUE, newObject.get_Name(), DefineSecurityParentage.DEFINE_SECURITY_PARENTAGE);

            relationship.save(RefreshMode.NO_REFRESH);

        }

    }

}
