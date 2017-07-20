package ru.ecm911.esbd.subscription;

import com.filenet.api.collection.FolderSet;
import com.filenet.api.constants.AutoUniqueName;
import com.filenet.api.constants.DefineSecurityParentage;
import com.filenet.api.constants.FilteredPropertyType;
import com.filenet.api.constants.RefreshMode;
import com.filenet.api.core.Document;
import com.filenet.api.core.Factory;
import com.filenet.api.core.Folder;
import com.filenet.api.core.ReferentialContainmentRelationship;
import com.filenet.api.engine.EventActionHandler;
import com.filenet.api.events.ObjectChangeEvent;
import com.filenet.api.exception.EngineRuntimeException;
import com.filenet.api.property.PropertyFilter;
import com.filenet.api.util.Id;

import java.util.Iterator;
import java.util.logging.Logger;

/**
 * Размещает документ в соответствующей папке
 *
 * Выполняется в асинхронном режими при создании документа
 *
 */
public class ClassifyDocumentActionHandler implements EventActionHandler {

    private static final String PERSON_CLASSIFICATION_PATH = "/Клиенты/Физические лица" ;

    private static final String ENTITY_CLASSIFICATION_PATH = "/Клиенты/Юридические лица" ;

    private static final String VEHICLE_CLASSIFICATION_PATH = "/Транспортные средства" ;

    private static final String CONTRACT_CLASSIFICATION_PATH = "/Договора/Договора страхования" ;

    private static final String CONTRACT_OS_RNS_CLASSIFICATION_PATH = "/Договора/Договора страхования ОС РНС" ;

    private static final String CASE_CLASSIFICATION_PATH = "/Страховые случаи" ;

    private Logger logger ;

    @Override
    public void onEvent(ObjectChangeEvent event, Id subscriptionId) throws EngineRuntimeException {

        getLogger().entering(getClass().getName(), "onEvent", new Object[]{event, subscriptionId});

        PropertyFilter propertyFilter = new PropertyFilter();

        propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

        Document document = Factory.Document.fetchInstance(event.getObjectStore(), event.get_SourceObjectId(), propertyFilter);

        getLogger().info("classified document is '" + document + "', class is '" + document.getClassName() + "'");

        String className = document.getClassName();

        String classification = null ;

        if (className.startsWith("ESBD")) {

            if (Constants.PERSON_CLASS_NAME.equalsIgnoreCase(className)) {

                classification = PERSON_CLASSIFICATION_PATH;

            } else if (Constants.ENTITY_CLASS_NAME.equalsIgnoreCase(className)) {

                classification = ENTITY_CLASSIFICATION_PATH;

            } else if (Constants.VEHICLE_CLASS_NAME.equalsIgnoreCase(className)) {

                classification = VEHICLE_CLASSIFICATION_PATH;

            } else if (Constants.CONTRACT_CLASS_NAME.equalsIgnoreCase(className)) {

                classification = CONTRACT_CLASSIFICATION_PATH;

            } else if (Constants.CONTRACT_OS_RNS_CLASS_NAME.equalsIgnoreCase(className)) {

                classification = CONTRACT_OS_RNS_CLASSIFICATION_PATH;

            } else if (Constants.CASE_CLASS_NAME.equalsIgnoreCase(className)) {

                classification = CASE_CLASSIFICATION_PATH;

            }

            getLogger().info("classification is '" + classification + "'");

            // убираем документ из всех папок

            FolderSet folders = document.get_FoldersFiledIn();

            if (folders != null) {

                Iterator<Folder> it = folders.iterator();

                while (it.hasNext()) {

                    Folder folder = it.next();

                    ReferentialContainmentRelationship relationship = folder.unfile(document);

                    relationship.save(RefreshMode.NO_REFRESH);

                    getLogger().info("\tunfile from '" + folder.get_PathName() + "'");

                }

            }

            // размещаем документ в целевой папке

            if (classification != null) {

                Folder destination = Factory.Folder.fetchInstance(event.getObjectStore(), classification, propertyFilter);

                ReferentialContainmentRelationship relationship = destination.file(document, AutoUniqueName.AUTO_UNIQUE, document.get_Name(), DefineSecurityParentage.DO_NOT_DEFINE_SECURITY_PARENTAGE);

                relationship.save(RefreshMode.NO_REFRESH);

                getLogger().info("\tfile into '" + destination.get_PathName() + "'");

            }

        }

    }

    public Logger getLogger() {

        return logger != null ? logger : (logger = Logger.getLogger(getClass().getName()));

    }

}
