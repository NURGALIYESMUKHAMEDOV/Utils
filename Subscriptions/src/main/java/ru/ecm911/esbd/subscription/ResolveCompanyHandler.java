package ru.ecm911.esbd.subscription;

import com.filenet.api.action.Create;
import com.filenet.api.action.PendingAction;
import com.filenet.api.collection.IndependentObjectSet;
import com.filenet.api.core.IndependentObject;
import com.filenet.api.core.IndependentlyPersistableObject;
import com.filenet.api.core.ObjectStore;
import com.filenet.api.core.RepositoryObject;
import com.filenet.api.engine.ChangePreprocessor;
import com.filenet.api.exception.EngineRuntimeException;
import com.filenet.api.exception.ExceptionCode;
import com.filenet.api.query.SearchSQL;
import com.filenet.api.query.SearchScope;

import java.util.Iterator;

/**
 * При создании документа, используется переданные в параметрах
 * создания код компании, для того чтобы найти компанию по этому
 * коду и указать ее качестве параметра при создании документа
 */
@Deprecated
public class ResolveCompanyHandler implements ChangePreprocessor {

    private static final String COMPANY_CODE = "ESBD_CompanyCode" ;

    private static final String COMPANY = "ESBD_Company" ;

    private static final String COMPANY_CLASS_NAME = "ESBD_Company" ;

    @Override
    public boolean preprocessObjectChange(IndependentlyPersistableObject object) throws EngineRuntimeException {

        boolean isCreate = false ;

        PendingAction pendingActions[] = object.getPendingActions();

        for (PendingAction pendingAction : pendingActions) {

            if (pendingAction instanceof Create) {

                isCreate = true ;

                break ;

            }

        }

        if (!isCreate) {

            return false;

        }

        // получаем код страховой компании

        String companyCode = object.getProperties().getStringValue(COMPANY_CODE) ;

        if (companyCode == null) {

            // если код не указан - ошибка создания документа

            throw new EngineRuntimeException(ExceptionCode.E_INVALID_ARGUMENT);

        }

        ObjectStore objectStore = ((RepositoryObject)object).getObjectStore();

        // находим объект с соответствующим кодом страховой компании и кодом региона

        boolean found = false ;

        String query = "SELECT [This] FROM [" + COMPANY_CLASS_NAME + "] WHERE [" + COMPANY_CODE + "] = '" + companyCode + "'" ;

        SearchSQL searchSQL = new SearchSQL();

        searchSQL.setQueryString(query);

        SearchScope searchScope = new SearchScope(objectStore);

        IndependentObjectSet objectSet = searchScope.fetchObjects(searchSQL, null, null, false);

        if (objectSet != null) {

            Iterator<IndependentObject> it = objectSet.iterator();

            if (it.hasNext()) {

                IndependentObject company = it.next();

                object.getProperties().putValue(COMPANY, company);

                found = true ;

            }

        }

        if (!found) {

            throw new EngineRuntimeException(ExceptionCode.E_OBJECT_NOT_FOUND);

        }

        return true ;

    }

}
