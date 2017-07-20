package ru.ecm911.esbd.subscription;

import com.filenet.api.collection.IndependentObjectSet;
import com.filenet.api.constants.AutoUniqueName;
import com.filenet.api.constants.DefineSecurityParentage;
import com.filenet.api.constants.FilteredPropertyType;
import com.filenet.api.constants.RefreshMode;
import com.filenet.api.core.*;
import com.filenet.api.engine.EventActionHandler;
import com.filenet.api.events.ObjectChangeEvent;
import com.filenet.api.exception.EngineRuntimeException;
import com.filenet.api.exception.ExceptionCode;
import com.filenet.api.property.PropertyFilter;
import com.filenet.api.query.SearchSQL;
import com.filenet.api.query.SearchScope;
import com.filenet.api.util.Id;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;

/**
 * Данное событие срабатывает при сохранении информации об объекте
 * в синхронном режиме
 *
 */
@Deprecated
public class PlaceContractHandler implements EventActionHandler {

    @Override
    public void onEvent(ObjectChangeEvent event, Id subscriptionId) throws EngineRuntimeException {

        System.out.println("[PlaceContractHandler] onEvent [3]");

        Document document = (Document)event.get_SourceObject();

        System.out.println("[PlaceContractHandler] onEvent, document: " + document);

        String name = document.getProperties().getStringValue("DocumentTitle");

        System.out.println("[PlaceContractHandler] onEvent, name: " + name);

        String companyCode = document.getProperties().getStringValue("ESBD_CompanyCode");

        System.out.println("[PlaceContractHandler] onEvent, companyCode: " + companyCode);

        // на основании информации о коде компании, определяем где необходимо разместить объект

        Folder companyFolder = getCompanyFolder(event.getObjectStore(), companyCode);

        if (companyFolder == null) {

            System.out.println("[PlaceContractHandler] onEvent, companyFolder not found");

        }

        System.out.println("[PlaceContractHandler] onEvent, companyFolder: " + companyFolder);

        // формируем путь к папке для размещения документа относительно папки компании

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd/HH");

        String folderPath = "Договора/" + dateFormat.format(new Date());

        System.out.println("[PlaceContractHandler] onEvent, folderPath: " + folderPath);

        Folder destinationFolder = getDestinationFolder(companyFolder, folderPath);

        System.out.println("[PlaceContractHandler] onEvent, destinationFolder: " + destinationFolder);

        if (destinationFolder != null) {

            ReferentialContainmentRelationship relationship = destinationFolder.file(document, AutoUniqueName.AUTO_UNIQUE, name, DefineSecurityParentage.DEFINE_SECURITY_PARENTAGE);

            relationship.save(RefreshMode.NO_REFRESH);

        }

    }

    private Folder getCompanyFolder(ObjectStore objectStore, String companyCode) {

        SearchSQL searchSQL = new SearchSQL("SELECT [This] FROM [ESBD_Company] WHERE [ESBD_CompanyCode] = '" + companyCode + "'");

        SearchScope searchScope = new SearchScope(objectStore);

        PropertyFilter propertyFilter = new PropertyFilter();

        propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

        IndependentObjectSet objectSet = searchScope.fetchObjects(searchSQL, null, propertyFilter, false);

        if (objectSet != null) {

            Iterator it = objectSet.iterator();

            if (it.hasNext()) {

                Folder folder = (Folder)it.next();

                folder.refresh(new String[]{"PathName"});

                return folder ;

            }

        }

        return null ;

    }

    private Folder getDestinationFolder(Folder companyFolder, String folderPath) {

        Folder destinationFolder = companyFolder ;

        String[] tokens = folderPath.split("/");

        for (int index = 0; index < tokens.length; index++) {

            destinationFolder = getSubFolder(destinationFolder, tokens[index]);

            if (destinationFolder == null) {

                break ;

            }

        }

        return destinationFolder ;

    }

    private Folder getSubFolder(Folder parent, String name) {

        System.out.println("[PlaceContractHandler] getSubFolder, parent: " + parent + ", name: " + name);

        String subFolderPath = parent.get_PathName() + "/" + name ;

        System.out.println("[PlaceContractHandler] getSubFolder, subFolderPath: " + subFolderPath);

        try {

            Folder subFolder = Factory.Folder.createInstance(parent.getObjectStore(), "Folder");

            subFolder.set_FolderName(name);

            subFolder.set_Parent(parent);

            subFolder.save(RefreshMode.REFRESH);

            return subFolder ;

        } catch (EngineRuntimeException e) {

            System.out.println("[PlaceContractHandler] getSubFolder, can't create, code : " + e.getExceptionCode());

            if (e.getExceptionCode().equals(ExceptionCode.E_NOT_UNIQUE)) {

                PropertyFilter propertyFilter = new PropertyFilter();

                propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

                System.out.println("[PlaceContractHandler] getSubFolder, fetch by subFolderPath: " + subFolderPath);

                return Factory.Folder.fetchInstance(parent.getObjectStore(), subFolderPath, propertyFilter);

            } else {

                throw e ;

            }


        }

    }

}
