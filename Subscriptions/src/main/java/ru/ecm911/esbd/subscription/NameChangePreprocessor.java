package ru.ecm911.esbd.subscription;

import com.filenet.api.core.IndependentlyPersistableObject;
import com.filenet.api.engine.ChangePreprocessor;
import com.filenet.api.exception.EngineRuntimeException;
import com.filenet.api.property.Properties;

import java.util.logging.Logger;

public class NameChangePreprocessor implements ChangePreprocessor {

    public static final String PERSON_CLASS_NAME = "ESBD_Person" ;

    public static final String ENTITY_CLASS_NAME = "ESBD_Entity" ;

    public static final String VEHICLE_CLASS_NAME = "ESBD_Vehicle" ;

    public static final String OS_RNS_CONTRACT_CLASS_NAME = "ESBD_InsuranceContract_OS_RNS" ;


    public static final String DOCUMENT_TITLE_PROPERTY = "DocumentTitle" ;


    public static final String LAST_NAME_PROPERTY = "ESBD_LastName" ;

    public static final String FIRST_NAME_PROPERTY = "ESBD_FirstName" ;

    public static final String MIDDLE_NAME_PROPERTY = "ESBD_MiddleName" ;

    public static final String NAME_PROPERTY = "ESBD_Name" ;

    public static final String VEHICLE_BRAND_PROPERTY = "ESBD_VehicleBrand" ;

    public static final String VEHICLE_MODEL_PROPERTY = "ESBD_VehicleModel" ;

    public static final String VEHICLE_ISSUE_YEAR_PROPERTY = "ESBD_VehicleIssueYear" ;

    public static final String VIN_PROPERTY = "ESBD_VIN" ;


    private Logger logger ;

    @Override
    public boolean preprocessObjectChange(IndependentlyPersistableObject object) throws EngineRuntimeException {

        getLogger().entering(getClass().getName(), "preprocessObjectChange", object);

        String className = object.getClassName();

        boolean result = false ;

        if (PERSON_CLASS_NAME.equals(className)) {

            result = processPerson(object);

        } else if (ENTITY_CLASS_NAME.equals(className)) {

            result = processEntity(object);

        } else if (VEHICLE_CLASS_NAME.equals(className)) {

            result = processVehicle(object);

        } else if (OS_RNS_CONTRACT_CLASS_NAME.equals(className)) {

            result = processOSRNSContract(object);

        }

        getLogger().exiting(getClass().getName(), "preprocessObjectChange", object);

        return result ;

    }

    private boolean processPerson(IndependentlyPersistableObject object) throws EngineRuntimeException {

        Properties properties = object.getProperties();

        String lastName = properties.isPropertyPresent(LAST_NAME_PROPERTY) ? properties.getStringValue(LAST_NAME_PROPERTY) : "" ;

        String firstName = properties.isPropertyPresent(FIRST_NAME_PROPERTY) ? properties.getStringValue(FIRST_NAME_PROPERTY) : "" ;

        String middleName = properties.isPropertyPresent(MIDDLE_NAME_PROPERTY) ? properties.getStringValue(MIDDLE_NAME_PROPERTY) : "" ;

        String name = (lastName != null ? lastName : "") + " " + (firstName != null ? firstName : "") + " " + (middleName != null ? middleName : "") ;

        name = name.trim();

        properties.putValue(DOCUMENT_TITLE_PROPERTY, name);

        return true ;

    }

    private boolean processEntity(IndependentlyPersistableObject object) throws EngineRuntimeException {

        Properties properties = object.getProperties();

        String name = properties.isPropertyPresent(NAME_PROPERTY) ? properties.getStringValue(NAME_PROPERTY) : "" ;

        name = name != null ? name.trim() : "";

        properties.putValue(DOCUMENT_TITLE_PROPERTY, name);

        return true ;

    }

    private boolean processVehicle(IndependentlyPersistableObject object) throws EngineRuntimeException {

        Properties properties = object.getProperties();

        String brand = properties.isPropertyPresent(VEHICLE_BRAND_PROPERTY) ? properties.getStringValue(VEHICLE_BRAND_PROPERTY) : "" ;

        String model = properties.isPropertyPresent(VEHICLE_MODEL_PROPERTY) ? properties.getStringValue(VEHICLE_MODEL_PROPERTY) : "" ;

        Integer issueYear = properties.isPropertyPresent(VEHICLE_ISSUE_YEAR_PROPERTY) ? properties.getInteger32Value(VEHICLE_ISSUE_YEAR_PROPERTY) : null ;

        String VIN = properties.isPropertyPresent(VIN_PROPERTY) ? properties.getStringValue(VIN_PROPERTY) : "" ;

        String name = (brand != null ? brand : "") + " " + (model != null ? model : "") + " " + (issueYear != null ? String.valueOf(issueYear) : "") + " " + (VIN != null ? VIN : "") ;

        name = name.trim();

        properties.putValue(DOCUMENT_TITLE_PROPERTY, name);

        return true ;

    }

    private boolean processOSRNSContract(IndependentlyPersistableObject object) throws EngineRuntimeException {

        // properties.putValue(DOCUMENT_TITLE_PROPERTY, name);

        return true ;

    }

    private Logger getLogger() {

        return logger != null ? logger : (logger = Logger.getLogger(getClass().getName()));

    }

}
