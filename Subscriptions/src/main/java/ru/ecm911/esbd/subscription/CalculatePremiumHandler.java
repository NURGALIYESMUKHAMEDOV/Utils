package ru.ecm911.esbd.subscription;

import com.filenet.api.action.Create;
import com.filenet.api.action.PendingAction;
import com.filenet.api.collection.IdList;
import com.filenet.api.collection.RepositoryRowSet;
import com.filenet.api.constants.FilteredPropertyType;
import com.filenet.api.core.*;
import com.filenet.api.engine.ChangePreprocessor;
import com.filenet.api.exception.EngineRuntimeException;
import com.filenet.api.property.PropertyFilter;
import com.filenet.api.query.RepositoryRow;
import com.filenet.api.query.SearchSQL;
import com.filenet.api.query.SearchScope;
import com.filenet.api.util.Id;

import java.util.Calendar;
import java.util.Date;
import java.util.Iterator;
import java.util.logging.Logger;

public class CalculatePremiumHandler implements ChangePreprocessor {

    private Logger logger ;

    private static class VehicleDependentRates {

        private Double registrationRegionRate ;

        private Double registrationCityRate ;

        private Double typeRate ;

        private Double ageRate ;

        private Boolean ignoreBonusMalusRate ;

        public Double getRegistrationRegionRate() {

            return registrationRegionRate != null ? registrationRegionRate : 1.0 ;

        }

        public void setRegistrationRegionRate(Double registrationRegionRate) {

            if (registrationRegionRate != null) {

                if (this.registrationRegionRate == null) {

                    this.registrationRegionRate = registrationRegionRate ;

                } else if (this.registrationRegionRate < registrationRegionRate) {

                    this.registrationRegionRate = registrationRegionRate ;

                }

            }

        }

        public Double getRegistrationCityRate() {

            return registrationCityRate != null ? registrationCityRate : 1.0 ;

        }

        public void setRegistrationCityRate(Double registrationCityRate) {

            if (registrationCityRate != null) {

                if (this.registrationCityRate == null) {

                    this.registrationCityRate = registrationCityRate ;

                } else if (this.registrationCityRate < registrationCityRate) {

                    this.registrationCityRate = registrationCityRate ;

                }

            }

        }

        public Double getTypeRate() {

            return typeRate != null ? typeRate : 1.0 ;

        }

        public void setTypeRate(Double typeRate) {

            if (typeRate != null) {

                if (this.typeRate == null) {

                    this.typeRate = typeRate ;

                } else if (this.typeRate < typeRate) {

                    this.typeRate = typeRate ;

                }

            }

        }

        public Double getAgeRate() {

            return ageRate != null ? ageRate : 1.0;

        }

        public void setAgeRate(Double ageRate) {

            if (ageRate != null) {

                if (this.ageRate == null) {

                    this.ageRate = ageRate ;

                } else if (this.ageRate < ageRate) {

                    this.ageRate = ageRate ;

                }

            }

        }

        public Boolean getIgnoreBonusMalusRate() {

            return ignoreBonusMalusRate != null ? ignoreBonusMalusRate : Boolean.FALSE ;

        }

        public void setIgnoreBonusMalusRate(Boolean ignoreBonusMalusRate) {

            if (ignoreBonusMalusRate != null) {

                if (this.ignoreBonusMalusRate == null) {

                    this.ignoreBonusMalusRate = ignoreBonusMalusRate ;

                } else if (this.ignoreBonusMalusRate.equals(Boolean.FALSE)) {

                    this.ignoreBonusMalusRate = ignoreBonusMalusRate ;

                }

            }

            this.ignoreBonusMalusRate = ignoreBonusMalusRate;

        }

    }

    private static class ClientDependentRates {

        private Double ageAndDrivingExperienceRate ;

        private Double bonusMalusRate ;

        private Double privilegeRate ;

        public Double getAgeAndDrivingExperienceRate() {

            return ageAndDrivingExperienceRate != null ? ageAndDrivingExperienceRate : 1.0 ;

        }

        public void setAgeAndDrivingExperienceRate(Double ageAndDrivingExperienceRate) {

            if (ageAndDrivingExperienceRate != null) {

                if (this.ageAndDrivingExperienceRate == null) {

                    this.ageAndDrivingExperienceRate = ageAndDrivingExperienceRate ;

                } else if (this.ageAndDrivingExperienceRate < ageAndDrivingExperienceRate) {

                    this.ageAndDrivingExperienceRate = ageAndDrivingExperienceRate ;

                }

            }

        }

        public Double getBonusMalusRate() {

            return bonusMalusRate != null ? bonusMalusRate : 1.0 ;

        }

        public void setBonusMalusRate(Double bonusMalusRate) {

            if (bonusMalusRate != null) {

                if (this.bonusMalusRate == null) {

                    this.bonusMalusRate = bonusMalusRate ;

                } else if (this.bonusMalusRate < bonusMalusRate) {

                    this.bonusMalusRate = bonusMalusRate ;

                }

            }

        }

        public Double getPrivilegeRate() {

            return privilegeRate != null ? privilegeRate : 1.0 ;

        }

        public void setPrivilegeRate(Double privilegeRate) {

            if (privilegeRate != null) {

                if (this.privilegeRate == null) {

                    this.privilegeRate = privilegeRate ;

                } else if (this.privilegeRate < privilegeRate) {

                    this.privilegeRate = privilegeRate ;

                }

            }

        }

    }

    private Logger getLogger() {

        return logger != null ? logger : (logger = Logger.getLogger(getClass().getName()));

    }

    @Override
    public boolean preprocessObjectChange(IndependentlyPersistableObject object) throws EngineRuntimeException {

        getLogger().entering(getClass().getName(), "preprocessObjectChange", object);

        boolean isCreate = false ;

        PendingAction actions[] = object.getPendingActions();

        for (int index = 0; index < actions.length; index++) {

            if (actions[index] instanceof Create) {

                isCreate = true ;

                break ;

            }

        }

        if (!isCreate) {

            getLogger().info("don't process no create action");

            return false;

        }

        ObjectStore objectStore = ((RepositoryObject)object).getObjectStore() ;

        double baseRate = getBaseRate(objectStore);

        getLogger().info("base rate - " + baseRate);

        StringBuilder comment = new StringBuilder();

        comment.append("МРП - ").append(baseRate);

        baseRate = baseRate * 1.9 ;

        comment.append(", МРП в премии - ").append(baseRate);

        VehicleDependentRates vehicleDependentRates = getVehicleDependentRates(object);

        comment.append(", К по территории регистрации ТС - ").append(vehicleDependentRates.getRegistrationRegionRate())
                .append(", Игнорировать бонус-малус? - ").append(vehicleDependentRates.getIgnoreBonusMalusRate())
                .append(", К по городу регистрации ТС - ").append(vehicleDependentRates.getRegistrationCityRate())
                .append(", К по типу ТС - ").append(vehicleDependentRates.getTypeRate())
                .append(", К по сроку эксплуатации - ").append(vehicleDependentRates.getAgeRate());

        ClientDependentRates clientDependentRates = getClientDependentRates(object);

        comment.append(", К по возрасту и стажу - ").append(clientDependentRates.getAgeAndDrivingExperienceRate())
                .append(", К бонус-малус - ").append(clientDependentRates.getBonusMalusRate())
                .append(", К льготы - ").append(clientDependentRates.getPrivilegeRate());

        double premium = baseRate
                * vehicleDependentRates.getRegistrationRegionRate()
                * vehicleDependentRates.getRegistrationCityRate()
                * vehicleDependentRates.getAgeRate()
                * vehicleDependentRates.getTypeRate()
                * clientDependentRates.getAgeAndDrivingExperienceRate()
                * (vehicleDependentRates.getIgnoreBonusMalusRate().equals(Boolean.TRUE) ? 1.0 : clientDependentRates.getBonusMalusRate())
                * clientDependentRates.getPrivilegeRate() ;

        comment.append(", премия - ").append(premium);

        getLogger().info("premium - " + comment);

        object.getProperties().putValue("ESBD_CalculatedPremium", premium);

        return true ;

    }

    private VehicleDependentRates getVehicleDependentRates(IndependentlyPersistableObject object) {

        ObjectStore objectStore = ((RepositoryObject)object).getObjectStore();

        VehicleDependentRates rates = new VehicleDependentRates();

        IdList ids = object.getProperties().getIdListValue("ESBD_InsuredVehicles");

        if (ids != null) {

            for (Id id : (Iterable<Id>) ids) {

                Document document = Factory.Document.fetchInstance(objectStore, id, null);

                String registrationRegion = document.getProperties().getStringValue("ESBD_VehicleRegistrationRegion");

                String registrationCity = document.getProperties().getStringValue("ESBD_VehicleRegistrationCity");

                String type = document.getProperties().getStringValue("ESBD_VehicleType");

                Integer issueYear = document.getProperties().getInteger32Value("ESBD_VehicleIssueYear");

                Calendar today = Calendar.getInstance();

                Integer age = issueYear != null ? today.get(Calendar.YEAR) - issueYear : null;

                retrieveVehicleRegistrationRegionRate(objectStore, rates, registrationRegion, registrationCity);

                double typeRate = getVehicleTypeRate(objectStore, type);

                double ageRate = getVehicleAgeRate(objectStore, age);

                rates.setTypeRate(typeRate);

                rates.setAgeRate(ageRate);

            }

        }

        return rates ;

    }

    private ClientDependentRates getClientDependentRates(IndependentObject object) {

        ObjectStore objectStore = ((RepositoryObject)object).getObjectStore();

        ClientDependentRates rates = new ClientDependentRates();

        PropertyFilter propertyFilter = new PropertyFilter();

        propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

        IdList ids = object.getProperties().getIdListValue("ESBD_InsuredClients");

        if (ids != null) {

            for (Id id : (Iterable<Id>) ids) {

                Document document = Factory.Document.fetchInstance(objectStore, id, propertyFilter);

                if (document.get_ClassDescription().get_SymbolicName().equals("ESBD_Person")) {

                    Date birthday = document.getProperties().getDateTimeValue("ESBD_Birthday");

                    Integer age = getAge(birthday);

                    Integer drivingExperience = document.getProperties().getInteger32Value("ESBD_DrivingExperience");

                    double ageAndDrivingExperienceRate = getAgeAndDrivingExperienceRate(objectStore, age, drivingExperience);

                    rates.setAgeAndDrivingExperienceRate(ageAndDrivingExperienceRate);

                    String driverRating = document.getProperties().getStringValue("ESBD_DriverRating");

                    rates.setBonusMalusRate(getBonusMalusRate(objectStore, driverRating));

                    String privilegeType = document.getProperties().getStringValue("ESBD_PrivilegeDocumentType");

                    if (privilegeType != null) {

                        rates.setPrivilegeRate(0.5);

                    } else {

                        rates.setPrivilegeRate(1.0);

                    }

                } else {

                    rates.setPrivilegeRate(1.0);

                    rates.setBonusMalusRate(1.0);

                    rates.setAgeAndDrivingExperienceRate(1.2);

                }

            }

        }

        return rates ;

    }

    private Integer getAge(Date date) {

        if (date == null) {

            return null ;

        }

        Calendar calendar = Calendar.getInstance();

        calendar.setTime(date);

        Calendar today = Calendar.getInstance();

        int age = today.get(Calendar.YEAR) - calendar.get(Calendar.YEAR);

        if (today.get(Calendar.DAY_OF_YEAR) < calendar.get(Calendar.DAY_OF_YEAR)) {

            age--;

        }

        return age;

    }

    private double getBaseRate(ObjectStore objectStore) {

        Calendar calendar = Calendar.getInstance();

        int currentYear = calendar.get(Calendar.YEAR);

        String query = "SELECT [ESBD_Rate] FROM [ESBD_BaseRate] WHERE [ESBD_Year] = " + currentYear + "";

        SearchSQL searchSQL = new SearchSQL();

        searchSQL.setQueryString(query);

        SearchScope searchScope = new SearchScope(objectStore);

        RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, false);

        if (rowSet != null) {

            Iterator<RepositoryRow> it = rowSet.iterator();

            if (it.hasNext()) {

                RepositoryRow row = it.next();

                Double rate = row.getProperties().getFloat64Value("ESBD_Rate");

                return rate != null ? rate : 0.0 ;

            }

        }

        return 0.0 ;

    }

    private void retrieveVehicleRegistrationRegionRate(ObjectStore objectStore, VehicleDependentRates rates, String registrationRegion, String registrationCity) {

        if (registrationRegion == null || registrationRegion.isEmpty()) {

            getLogger().info("registration region is not defined. use 1.0 as rate");

            rates.setRegistrationCityRate(1.0);

            return ;

        }

        String query = "SELECT [ESBD_Rate], [ESBD_IgnoreBonusMalusRate], [ESBD_CityRegistrationRate] FROM [ESBD_VehicleRegistrationRegionRate] WHERE [ESBD_VehicleRegistrationRegion] = '" + registrationRegion + "'";

        getLogger().info("registration region rate query: '" + query + "'");

        SearchSQL searchSQL = new SearchSQL();

        searchSQL.setQueryString(query);

        SearchScope searchScope = new SearchScope(objectStore);

        RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, false);

        if (rowSet != null) {

            Iterator<RepositoryRow> it = rowSet.iterator();

            if (it.hasNext()) {

                RepositoryRow row = it.next();

                Double rate = row.getProperties().getFloat64Value("ESBD_Rate");

                Boolean ignoreBonusMalusRate = row.getProperties().getBooleanValue("ESBD_IgnoreBonusMalusRate");

                rates.setRegistrationRegionRate(rate != null ? rate : 1.0);

                rates.setIgnoreBonusMalusRate(ignoreBonusMalusRate);

                if (registrationCity == null) {

                    rate = row.getProperties().getFloat64Value("ESBD_CityRegistrationRate");

                    rates.setRegistrationCityRate(rate);

                } else {

                    rates.setRegistrationCityRate(1.0);

                }

            }

        }

    }

    private double getVehicleRegistrationRegionRate(ObjectStore objectStore, String registrationRegion) {

        String query = "SELECT [ESBD_Rate] FROM [ESBD_VehicleRegistrationRegionRate] WHERE [ESBD_VehicleRegistrationRegion] = '" + registrationRegion + "'";

        SearchSQL searchSQL = new SearchSQL();

        searchSQL.setQueryString(query);

        SearchScope searchScope = new SearchScope(objectStore);

        RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, false);

        if (rowSet != null) {

            Iterator<RepositoryRow> it = rowSet.iterator();

            if (it.hasNext()) {

                RepositoryRow row = it.next();

                Double rate = row.getProperties().getFloat64Value("ESBD_Rate");

                return rate != null ? rate : 1.0 ;

            }

        }

        return 1.0 ;

    }

    private double getVehicleTypeRate(ObjectStore objectStore, String vehicleType) {

        if (vehicleType == null || vehicleType.isEmpty()) {

            getLogger().info("vehicle type is not defined. use 1.0 as vehicle type rate");

            return 1.0 ;

        }

        String query = "SELECT [ESBD_Rate] FROM [ESBD_VehicleTypeRate] WHERE [ESBD_VehicleType] = '" + vehicleType + "'";

        SearchSQL searchSQL = new SearchSQL();

        searchSQL.setQueryString(query);

        SearchScope searchScope = new SearchScope(objectStore);

        RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, false);

        if (rowSet != null) {

            Iterator<RepositoryRow> it = rowSet.iterator();

            if (it.hasNext()) {

                RepositoryRow row = it.next();

                Double rate = row.getProperties().getFloat64Value("ESBD_Rate");

                return rate != null ? rate : 1.0 ;

            }

        }

        return 1.0 ;

    }

    private double getAgeAndDrivingExperienceRate(ObjectStore objectStore, Integer age, Integer drivingExperience) {

        if (age == null || drivingExperience == null) {

            getLogger().info("age or driving experience is not defined. use 1.0 as rate");

            return 1.0 ;

        }

        String query = "SELECT [ESBD_Rate] FROM [ESBD_AgeAndDrivingExperienceRate] WHERE [ESBD_AgeLessThan] >= " + age + " AND [ESBD_AgeMoreThan] < " + age + " AND [ESBD_DrivingExperienceLessThan] >= " + drivingExperience + " AND [ESBD_DrivingExperienceMoreThan] < " + drivingExperience;

        getLogger().info("age and driving experience rate query: '" + query + "'");

        SearchSQL searchSQL = new SearchSQL();

        searchSQL.setQueryString(query);

        SearchScope searchScope = new SearchScope(objectStore);

        RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, false);

        if (rowSet != null) {

            Iterator<RepositoryRow> it = rowSet.iterator();

            if (it.hasNext()) {

                RepositoryRow row = it.next();

                Double rate = row.getProperties().getFloat64Value("ESBD_Rate");

                return rate != null ? rate : 1.0 ;

            }

        }

        return 1.0 ;

    }

    private double getBonusMalusRate(ObjectStore objectStore, String driverRating) {

        if (driverRating == null || driverRating.isEmpty()) {

            getLogger().info("driver rating is not defined. use 1.0 as bonus malus");

            return 1.0 ;

        }

        String query = "SELECT [ESBD_Rate] FROM [ESBD_BonusMalusRate] WHERE [ESBD_DriverRating] = '" + driverRating + "'";

        getLogger().info("bonus malus rate query: '" + query + "'");

        SearchSQL searchSQL = new SearchSQL();

        searchSQL.setQueryString(query);

        SearchScope searchScope = new SearchScope(objectStore);

        RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, false);

        if (rowSet != null) {

            Iterator<RepositoryRow> it = rowSet.iterator();

            if (it.hasNext()) {

                RepositoryRow row = it.next();

                Double rate = row.getProperties().getFloat64Value("ESBD_Rate");

                return rate != null ? rate : 1.0 ;

            }

        }

        return 1.0 ;

    }

    private double getVehicleAgeRate(ObjectStore objectStore, Integer age) {

        if (age == null) {

            getLogger().info("vehicle age is not defined. use 1.0 as vehicle age rate");

            return 1.0 ;

        }

        String query = "SELECT [ESBD_Rate] FROM [ESBD_VehicleAgeRate] WHERE [ESBD_AgeLessThan] >= " + age + " AND [ESBD_AgeMoreThan] < " + age;

        getLogger().info("vehicle age rate query: '" + query + "'");

        SearchSQL searchSQL = new SearchSQL();

        searchSQL.setQueryString(query);

        SearchScope searchScope = new SearchScope(objectStore);

        RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, false);

        if (rowSet != null) {

            Iterator<RepositoryRow> it = rowSet.iterator();

            if (it.hasNext()) {

                RepositoryRow row = it.next();

                Double rate = row.getProperties().getFloat64Value("ESBD_Rate");

                return rate != null ? rate : 1.0 ;

            }

        }

        return 1.0 ;

    }

}
