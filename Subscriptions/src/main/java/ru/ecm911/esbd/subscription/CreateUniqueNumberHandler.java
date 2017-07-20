package ru.ecm911.esbd.subscription;

import com.filenet.api.action.Create;
import com.filenet.api.action.PendingAction;
import com.filenet.api.collection.RepositoryRowSet;
import com.filenet.api.constants.RefreshMode;
import com.filenet.api.core.*;
import com.filenet.api.engine.ChangePreprocessor;
import com.filenet.api.exception.EngineRuntimeException;
import com.filenet.api.exception.ExceptionCode;
import com.filenet.api.query.RepositoryRow;
import com.filenet.api.query.SearchSQL;
import com.filenet.api.query.SearchScope;

import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.logging.Logger;

/**
 * Данный объект обеспечивает генерацию уникального идентификационного
 * номера договора
 *
 * Также формируется наименование документа в виде: Договор № <уникальный номер> от <дата заключения>
 *
 * Данный обработчик выполняется в синхронном режиме при создании
 * объекта договора
 *
 */
public class CreateUniqueNumberHandler implements ChangePreprocessor {

    private static final String CASE_CLASS_NAME = "ESBD_InsuranceCase" ;


    private static final String BRANCH_PROPERTY = "ESBD_Branch" ;

    private static final String COMPANY_CODE_PROPERTY = "ESBD_CompanyCode" ;

    private static final String SEQUENCE_NUMBER_PROPERTY = "ESBD_SequenceNumber" ;

    private static final String SUBMIT_DATE_PROPERTY = "ESBD_SubmitDate" ;

    private static final String DEFAULT_COMPANY_CODE = "KZ" ;

    private static final Integer DEFAULT_BRANCH = 0 ;


    private Logger logger ;

    @Override
    public boolean preprocessObjectChange(IndependentlyPersistableObject object) throws EngineRuntimeException {

        getLogger().info("-> [CreateUniqueNumberHandler] preprocessObjectChange({object: " + object + "})");

        boolean isCreate = false ;

        PendingAction actions[] = object.getPendingActions();

        for (int index = 0; index < actions.length; index++) {

            if (actions[index] instanceof Create) {

                isCreate = true ;

                break ;

            }

        }

        if (!isCreate) {

            return false;

        }

        // если для документа опреределены параметры: код страховой компании и код региона, то

        // номер формируется:
        // - код страховой компании
        // - код региона
        // - числовая последовательность

        // так как на данный момент непонятно откуда брать код страховой компании,
        // устанавливем его в KZ

        String companyCode = DEFAULT_COMPANY_CODE ;

        if (object.getProperties().isPropertyPresent(COMPANY_CODE_PROPERTY)) {

            companyCode = object.getProperties().getStringValue(COMPANY_CODE_PROPERTY);

        }

        // код региона - это филиал, получаем его из
        // свойств объекта, если нет такого кода, устанавливаем его в 0

        Integer branchCode = DEFAULT_BRANCH ;

        if (object.getProperties().isPropertyPresent(BRANCH_PROPERTY)) {

            branchCode = object.getProperties().getInteger32Value(BRANCH_PROPERTY);

        }

        // находим объект с соответствующим кодом страховой компании и кодом региона

        String query = "SELECT [Id] FROM [ESBD_UNC] WHERE [ESBD_CompanyCode] = '" + companyCode + "' AND [ESBD_Branch] = " + branchCode ;

        SearchSQL searchSQL = new SearchSQL();

        searchSQL.setQueryString(query);

        SearchScope searchScope = new SearchScope(((Document) object).getObjectStore());

        RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, false);

        // Генератор
        CustomObject customObject ;

        if (rowSet != null) {

            Iterator<RepositoryRow> it = rowSet.iterator();

            if (it.hasNext()) {

                // Генератор найден

                RepositoryRow row = it.next();

                customObject = Factory.CustomObject.fetchInstance(((Document) object).getObjectStore(), row.getProperties().getIdValue("Id"), null);

            } else {

                customObject = createUNC(((Document) object).getObjectStore(), companyCode, branchCode);

            }

        } else {

            customObject = createUNC(((Document) object).getObjectStore(), companyCode, branchCode);

        }

        Integer sequenceNumber = getSequenceNumber(customObject);

        // Форматируем номер

        DecimalFormat decimalFormat = new DecimalFormat("000000");

        String number = companyCode + " " + String.valueOf(branchCode) + " " + decimalFormat.format(sequenceNumber);

        object.getProperties().putValue("ESBD_DocumentNumber", number);

        Date submitDate = new Date();

        if (object.getProperties().isPropertyPresent(SUBMIT_DATE_PROPERTY)) {

            submitDate = object.getProperties().getDateTimeValue(SUBMIT_DATE_PROPERTY);

        }

        SimpleDateFormat dateFormat = new SimpleDateFormat("dd.MM.yyyy");

        String type = "Договор" ;

        String className = object.get_ClassDescription().get_SymbolicName();

        if (className.equals(CASE_CLASS_NAME)) {

            type = "Страховой случай" ;

        }

        String name = type + " № " + number + " от " + dateFormat.format(submitDate);

        object.getProperties().putValue("DocumentTitle", name);

        return true ;

    }

    private CustomObject createUNC(ObjectStore objectStore, String companyCode, Integer branchCode) {

        CustomObject customObject = Factory.CustomObject.createInstance(objectStore, "ESBD_UNC");

        customObject.getProperties().putValue(COMPANY_CODE_PROPERTY, companyCode);

        customObject.getProperties().putValue(BRANCH_PROPERTY, branchCode);

        customObject.getProperties().putValue(SEQUENCE_NUMBER_PROPERTY, 0);

        customObject.save(RefreshMode.REFRESH);

        return customObject ;

    }

    private Integer getSequenceNumber(CustomObject customObject) {

        for (int count = 0; count < 10; ++count) {

            try {

                customObject.lock(15, null);

                customObject.save(RefreshMode.REFRESH);

                break ;

            } catch (EngineRuntimeException e) {

                ExceptionCode code = e.getExceptionCode();

                if (code != ExceptionCode.E_OBJECT_LOCKED) {

                    throw e ;

                }

                try { Thread.sleep(100); } catch (InterruptedException ie) { }

            }

        }

        int value = customObject.getProperties().getInteger32Value(SEQUENCE_NUMBER_PROPERTY);

        int newValue = value + 1;

        customObject.getProperties().putValue(SEQUENCE_NUMBER_PROPERTY, newValue);

        customObject.unlock();

        customObject.save(RefreshMode.NO_REFRESH);

        return newValue ;

    }

    private Logger getLogger() {

        return logger != null ? logger : (logger = Logger.getLogger(getClass().getName()));

    }

}
