package ru.ecm911.esbd.plugin;

import com.filenet.api.collection.IdList;
import com.filenet.api.collection.RepositoryRowSet;
import com.filenet.api.constants.*;
import com.filenet.api.core.*;
import com.filenet.api.property.PropertyFilter;
import com.filenet.api.query.RepositoryRow;
import com.filenet.api.query.SearchSQL;
import com.filenet.api.query.SearchScope;
import com.filenet.api.util.Id;
import com.filenet.api.util.UserContext;
import com.ibm.ecm.extension.PluginLogger;
import com.ibm.ecm.extension.PluginResponseUtil;
import com.ibm.ecm.extension.PluginService;
import com.ibm.ecm.extension.PluginServiceCallbacks;
import com.ibm.ecm.json.JSONResponse;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Iterator;

public class InsuranceContractPluginService extends PluginService {

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

    private static final String ID = "InsuranceContractPluginService" ;

    @Override
    public String getId() {

        return ID ;

    }

    @Override
    public void execute(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        // наименование операции (сейчас только create)
        String name = request.getParameter("name");

        if (name.equals("create")) {

            create(callbacks, request, response);

        } else if (name.equals("update")) {

            update(callbacks, request, response);

        } else if (name.equals("duplicate")) {

            duplicate(callbacks, request, response);

        } else if (name.equals("retrieveOrigin")) {

            retrieveOrigin(callbacks, request, response);

        } else if (name.equals("calculate")) {

            calculate(callbacks, request, response);

        }

    }

    private void create(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        String methodName = "create" ;

        PluginLogger logger = callbacks.getLogger();

        logger.logEntry(this, methodName, request);

        // идентификатор объектного хранилища
        String repositoryId = request.getParameter("repositoryId");

        // ответ на запрос
        JSONResponse _response = new JSONResponse();

        Subject subject = callbacks.getP8Subject(repositoryId);

        try {

            UserContext.get().pushSubject(subject);

            // данные запроса в формате JSON объекта:
            //
            // {
            //   "company" : "<код страховой компании>",
            //   "insurer": "<идентификатор страхователя>",
            //   "insuredClients": [
            //     {
            //       "client" : "<идентификатор клиента>",
            //       "driverRating" : "<класс водителя>",
            //       "driverLicenseNumber" : "<номер вод. уд-я>",
            //       "driverLicenseIssueDate" : "<дата выдачи вод. уд-я>",
            //       "drivingExperience" : <стаж вождения>,
            //       "privilegeDocumentType" : "<льгота>",
            //       "privilegeDocumentNumber" : "<номер док-а льготы>",
            //       "privilegeDocumentIssueDate" : "<дата выдачи док-а льготы>",
            //       "privilegeDocumentValidTo" : "<срок действия док-а льготы>"
            //     }
            //   ],
            //   "insuredVehicles": [
            //     {
            //       "vehicle" : "<идентификатор ТС>",
            //       "registrationRegion" : "<район регистрации>",
            //       "registrationCity" : "<город регистрации>",
            //       "VRN" : "<гос номер>",
            //       "certificateNumber" : "<номер ПТС>",
            //       "certificateIssueDate" : "<дата выдачи ПТС>",
            //       "certificateValidTo" : "<срок действия ПТС>"
            //     }
            //   ],
            //   "submitDate" : "<дата заключения>",
            //   "startDate" : "<дата начала действия>",
            //   "endDate" : "<дата окончания действия>",
            //   "branch" : "<филиал>",
            //   "certificateNumber" : "<номер полиса>",
            //   "premium" : <страховая премия>
            //   "source" : "<ид документа основания>",
            //   "paymentType" : "<тип оплаты>",
            //   "paymentDate" : "<дата оплаты>"
            // }
            //
            String data = request.getParameter("data");

            System.out.println("data: " + data);

            JSONObject _contract = JSONObject.parse(data);

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            // дата регистрации полиса, относительно этой
            // даты формируется структура папок

            Date date = new Date();

            // получение информации о страховой компании

            String companyCode = (String)_contract.get("company");

            Folder company = getCompany(objectStore, companyCode);

            // создание вспомогательных объектов "Застрахованные лица"

            IdList insuredClientIdList = Factory.IdList.createList();

            JSONArray _insuredClients = (JSONArray)_contract.get("insuredClients");

            for (int index = 0; index < _insuredClients.size(); index++) {

                JSONObject _insured = (JSONObject)_insuredClients.get(index);

                CustomObject insured = Factory.CustomObject.createInstance(objectStore, "ESBD_Insured");

                insured.getProperties().putValue("ESBD_Client", new Id((String)_insured.get("client")));

                insured.getProperties().putValue("ESBD_DriverRating", (String)_insured.get("driverRating"));

                insured.getProperties().putValue("ESBD_DriverLicenseNumber", (String)_insured.get("driverLicenseNumber"));

                insured.getProperties().putValue("ESBD_DriverLicenseIssueDate", Utils.getDate((Long) _insured.get("driverLicenseIssueDate")));

                insured.getProperties().putValue("ESBD_DrivingExperience", _insured.get("drivingExperience") != null ? ((Long)_insured.get("drivingExperience")).intValue() : null);

                insured.getProperties().putValue("ESBD_PrivilegeDocumentType", (String)_insured.get("privilegeDocumentType"));

                insured.getProperties().putValue("ESBD_PrivilegeDocumentNumber", (String)_insured.get("privilegeDocumentNumber"));

                insured.getProperties().putValue("ESBD_PrivilegeDocumentIssueDate", Utils.getDate((Long) _insured.get("privilegeDocumentIssueDate")));


                insured.getProperties().putValue("ESBD_PrivilegeDocumentValidTo", Utils.getDate((Long) _insured.get("privilegeDocumentValidTo")));
                insured.save(RefreshMode.REFRESH);

                insuredClientIdList.add(insured.get_Id());

            }

            // создание вспомогательных объектов "Застрахованное транспортное средство"

            IdList insuredVehicleIdList = Factory.IdList.createList();

            JSONArray _insuredVehicleList = (JSONArray)_contract.get("insuredVehicles");

            for (int index = 0; index < _insuredVehicleList.size(); index++) {

                JSONObject _insuredVehicle = (JSONObject)_insuredVehicleList.get(index);

                CustomObject insuredVehicle = Factory.CustomObject.createInstance(objectStore, "ESBD_InsuredVehicle");

                insuredVehicle.getProperties().putValue("ESBD_Vehicle", new Id((String)_insuredVehicle.get("vehicle")));

                insuredVehicle.getProperties().putValue("ESBD_VehicleRegistrationRegion", (String)_insuredVehicle.get("registrationRegion"));

                insuredVehicle.getProperties().putValue("ESBD_VehicleRegistrationCity", (String)_insuredVehicle.get("registrationCity"));

                insuredVehicle.getProperties().putValue("ESBD_VRN", (String)_insuredVehicle.get("VRN"));

                insuredVehicle.getProperties().putValue("ESBD_VehicleCertificateNumber", (String)_insuredVehicle.get("certificateNumber"));

                insuredVehicle.getProperties().putValue("ESBD_VehicleCertificateIssueDate", Utils.getDate((Long) _insuredVehicle.get("certificateIssueDate")));

                insuredVehicle.save(RefreshMode.REFRESH);

                insuredVehicleIdList.add(insuredVehicle.get_Id());

            }

            // документ основание

            Document source = null ;

            // создание объекта "Договор страхования"

            Document contract = Factory.Document.createInstance(objectStore, "ESBD_InsuranceContract");

            contract.getProperties().putValue("ESBD_CompanyCode", companyCode);

            contract.getProperties().putValue("ESBD_Insurer", new Id((String)_contract.get("insurer")));

            contract.getProperties().putValue("ESBD_InsuredClients", insuredClientIdList);

            contract.getProperties().putValue("ESBD_InsuredVehicles", insuredVehicleIdList);

            contract.getProperties().putValue("ESBD_SubmitDate", Utils.getDate((Long)_contract.get("submitDate")));

            contract.getProperties().putValue("ESBD_StartDate", Utils.getDate((Long)_contract.get("startDate")));

            contract.getProperties().putValue("ESBD_EndDate", Utils.getDate((Long) _contract.get("endDate")));

            contract.getProperties().putValue("ESBD_Branch", _contract.get("branch") != null ? ((Long)_contract.get("branch")).intValue() : null);

            contract.getProperties().putValue("ESBD_InsuranceCertificateNumber", (String) _contract.get("certificateNumber"));

            contract.getProperties().putValue("ESBD_PaymentType", (String) _contract.get("paymentType"));

            contract.getProperties().putValue("ESBD_PaymentDate", Utils.getDate((Long) _contract.get("paymentDate")));

            contract.getProperties().putValue("ESBD_Status", "Действующий");

            Object value = _contract.get("premium");

            Double premium = value instanceof Long ? ((Long)value).doubleValue() : value instanceof Double ? (Double)value : null ;

            contract.getProperties().putValue("ESBD_Premium", premium);

            if (_contract.containsKey("source") && _contract.get("source") != null) {

                Id sourceId = new Id((String) _contract.get("source"));

                PropertyFilter propertyFilter = new PropertyFilter();

                propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

                source = Factory.Document.fetchInstance(objectStore, sourceId, propertyFilter);

                contract.getProperties().putValue("ESBD_Source", sourceId);

            }

            contract.getProperties().putValue("DocumentTitle", (String) _contract.get("certificateNumber"));

            contract.checkin(AutoClassify.DO_NOT_AUTO_CLASSIFY, CheckinType.MAJOR_VERSION);

            contract.save(RefreshMode.REFRESH);

            Folder destination = Factory.Folder.fetchInstance(objectStore, "/Договора/Договора страхования", null);

            ReferentialContainmentRelationship relationship = destination.file(contract, AutoUniqueName.AUTO_UNIQUE, contract.get_Name(), DefineSecurityParentage.DO_NOT_DEFINE_SECURITY_PARENTAGE);

            relationship.save(RefreshMode.NO_REFRESH);

            Folder folder = getFolder(company, date);

            relationship = folder.file(contract, AutoUniqueName.AUTO_UNIQUE, contract.get_Name(), DefineSecurityParentage.DEFINE_SECURITY_PARENTAGE);

            relationship.save(RefreshMode.NO_REFRESH);

            // если при создании указан документ-предшественник, то
            // данный документ-предшественник должен прекратить
            // действие с указанием документа-потомка

            if (source != null) {

                source.getProperties().putValue("ESBD_Status", "Окончен");

                source.getProperties().putValue("ESBD_TerminateDate", new Date());

                source.getProperties().putValue("ESBD_TerminateReason", "Расторгнут с последующим оформлением");

                source.getProperties().putValue("ESBD_Successor", contract.get_Id());

                source.save(RefreshMode.NO_REFRESH);

            }


            _response.put("response", "success");

            _response.put("id", contract.get_Id().toString());

        } catch (Exception e) {

            logger.logError(this, methodName, request, e);

            _response.put("response", "failed");

            _response.put("message", e.getMessage());

        } finally {

            UserContext.get().popSubject();

        }

        PluginResponseUtil.writeJSONResponse(request, response, _response, callbacks, ID);

    }

    private void update(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        String methodName = "update" ;

        PluginLogger logger = callbacks.getLogger();

        logger.logEntry(this, methodName, request);

        // идентификатор объектного хранилища
        String repositoryId = request.getParameter("repositoryId");

        // ответ на запрос
        JSONResponse _response = new JSONResponse();

        Subject subject = callbacks.getP8Subject(repositoryId);

        try {

            UserContext.get().pushSubject(subject);

            // данные запроса в формате JSON объекта:
            //
            // {
            //   "id" : "<идентификатор объекта>",
            //   "terminateDate" : "<дата расторжения>",
            //   "terminateReasons": "<причина расторжения>",
            //   "returnOfPremium": <возврат части страховой премии>,
            //   "status": "<статус>"
            // }
            //
            String data = request.getParameter("data");

            System.out.println("data: " + data);

            JSONObject _data = JSONObject.parse(data);

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            PropertyFilter propertyFilter = new PropertyFilter();

            propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

            Document document = Factory.Document.fetchInstance(objectStore, new Id((String) _data.get("id")), propertyFilter);

            if (_data.containsKey("terminateDate")) {

                document.getProperties().putValue("ESBD_TerminateDate", Utils.getDateTime((Long) _data.get("terminateDate")));

            }

            if (_data.containsKey("terminateReason")) {

                document.getProperties().putValue("ESBD_TerminateReason", (String) _data.get("terminateReason"));

            }

            if (_data.containsKey("returnOfPremium")) {

                Object value = _data.get("returnOfPremium");

                Double returnOfPremium = value instanceof Double ? (Double)value : value instanceof Long ? ((Long)value).doubleValue() : null ;

                document.getProperties().putValue("ESBD_ReturnOfPremium", returnOfPremium);

            }

            if (_data.containsKey("status")) {

                document.getProperties().putValue("ESBD_Status", (String) _data.get("status"));

            }

            document.save(RefreshMode.NO_REFRESH);

            _response.put("response", "success");

        } catch (Exception e) {

            logger.logError(this, methodName, request, e);

            _response.put("response", "failed");

            _response.put("message", e.getMessage());

        } finally {

            UserContext.get().popSubject();

        }

        PluginResponseUtil.writeJSONResponse(request, response, _response, callbacks, ID);

    }

    private void duplicate(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        String methodName = "duplicate" ;

        PluginLogger logger = callbacks.getLogger();

        logger.logEntry(this, methodName, request);

        // идентификатор объектного хранилища
        String repositoryId = request.getParameter("repositoryId");

        // ответ на запрос
        JSONResponse _response = new JSONResponse();

        Subject subject = callbacks.getP8Subject(repositoryId);

        try {

            UserContext.get().pushSubject(subject);

            String data = request.getParameter("data");

            JSONObject _data = JSONObject.parse(data);

            System.out.println("data: " + _data.toString());

            logger.logInfo(this, methodName, _data.toString());

            String id = (String)_data.get("id");

            Date submitDate = Utils.getDateTime((Long) _data.get("submitDate"));

            String certificateNumber = (String)_data.get("certificateNumber");

            if (submitDate == null) {

                throw new Exception("ee");

            }

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            PropertyFilter propertyFilter = new PropertyFilter();

            propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

            Document document = Factory.Document.fetchInstance(objectStore, new Id(id), propertyFilter);

            Document newDocument = Factory.Document.createInstance(objectStore, "ESBD_InsuranceContract");

            String companyCode = document.getProperties().getStringValue("ESBD_CompanyCode");

            newDocument.getProperties().putValue("ESBD_CompanyCode", companyCode);

            newDocument.getProperties().putValue("ESBD_Insurer", document.getProperties().getIdValue("ESBD_Insurer"));

            newDocument.getProperties().putValue("ESBD_InsuredClients", document.getProperties().getIdListValue("ESBD_InsuredClients"));

            newDocument.getProperties().putValue("ESBD_InsuredVehicles", document.getProperties().getIdListValue("ESBD_InsuredVehicles"));

            newDocument.getProperties().putValue("ESBD_SubmitDate", submitDate);

            newDocument.getProperties().putValue("ESBD_StartDate", document.getProperties().getDateTimeValue("ESBD_StartDate"));

            newDocument.getProperties().putValue("ESBD_EndDate", document.getProperties().getDateTimeValue("ESBD_EndDate"));

            newDocument.getProperties().putValue("ESBD_Branch", document.getProperties().getInteger32Value("ESBD_Branch"));

            newDocument.getProperties().putValue("ESBD_InsuranceCertificateNumber", certificateNumber);

            newDocument.getProperties().putValue("ESBD_Premium", document.getProperties().getFloat64Value("ESBD_Premium"));

            newDocument.getProperties().putValue("ESBD_CalculatedPremium", document.getProperties().getFloat64Value("ESBD_CalculatedPremium"));

            newDocument.getProperties().putValue("ESBD_Status", "Действующий");

            newDocument.getProperties().putValue("ESBD_Source", document.get_Id());

            newDocument.getProperties().putValue("DocumentTitle", document.getProperties().getStringValue("DocumentTitle"));

            newDocument.checkin(AutoClassify.DO_NOT_AUTO_CLASSIFY, CheckinType.MAJOR_VERSION);

            newDocument.save(RefreshMode.REFRESH);

            Folder destination = Factory.Folder.fetchInstance(objectStore, "/Договора/Договора страхования", null);

            ReferentialContainmentRelationship relationship = destination.file(newDocument, AutoUniqueName.AUTO_UNIQUE, newDocument.get_Name(), DefineSecurityParentage.DO_NOT_DEFINE_SECURITY_PARENTAGE);

            relationship.save(RefreshMode.NO_REFRESH);

            Folder company = getCompany(objectStore, companyCode);

            Folder folder = getFolder(company, submitDate);

            relationship = folder.file(newDocument, AutoUniqueName.AUTO_UNIQUE, newDocument.get_Name(), DefineSecurityParentage.DEFINE_SECURITY_PARENTAGE);

            relationship.save(RefreshMode.NO_REFRESH);

            // обновляем статус старого документа

            document.getProperties().putValue("ESBD_Successor", newDocument.get_Id());

            document.getProperties().putValue("ESBD_Status", "Окончен");

            document.getProperties().putValue("ESBD_TerminateDate", submitDate);

            document.getProperties().putValue("ESBD_TerminateReason", "Выпущен дубликат");

            document.save(RefreshMode.REFRESH);

            _response.put("response", "success");

            _response.put("id", newDocument.get_Id().toString());

        } catch (Exception e) {

            logger.logError(this, methodName, request, e);

            _response.put("response", "failed");

            _response.put("message", e.getMessage());

        } finally {

            UserContext.get().popSubject();

        }

        PluginResponseUtil.writeJSONResponse(request, response, _response, callbacks, ID);

    }

    private void retrieveOrigin(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        String methodName = "retrieveOrigin" ;

        PluginLogger logger = callbacks.getLogger();

        logger.logEntry(this, methodName, request);

        // идентификатор объектного хранилища
        String repositoryId = request.getParameter("repositoryId");

        // идентификатор документа
        String id = request.getParameter("id");

        // ответ на запрос
        JSONResponse _response = new JSONResponse();

        Subject subject = callbacks.getP8Subject(repositoryId);

        try {

            UserContext.get().pushSubject(subject);

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            SearchSQL searchSQL = new SearchSQL();

            searchSQL.setQueryString("SELECT\n" +
                    "  o.[Id],\n" +
                    "  o.[DocumentTitle],\n" +
                    "  o.[ESBD_DocumentNumber],\n" +
                    "  o.[ESBD_InsuranceCertificateNumber],\n" +
                    "  o.[ESBD_SubmitDate],\n" +
                    "  o.[ESBD_Status]\n" +
                    "FROM\n" +
                    "  ([ESBD_InsuranceContract] s INNER JOIN [ESBD_OriginLink] l ON l.[Tail] = s.[This]) INNER JOIN [ESBD_InsuranceContract] o ON l.[Head] = o.[This]\n" +
                    "WHERE\n" +
                    "  s.[Id] = " + id);

            SearchScope searchScope = new SearchScope(objectStore);

            RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, false);

            if (rowSet != null) {

                Iterator<RepositoryRow> it = rowSet.iterator();

                while (it.hasNext()) {

                    RepositoryRow row = it.next();

                    JSONObject _data = new JSONObject();

                    _data.put("Id", row.getProperties().getIdValue("Id").toString());

                    _data.put("ESBD_DocumentNumber", row.getProperties().getStringValue("ESBD_DocumentNumber"));

                    _data.put("ESBD_InsuranceCertificateNumber", row.getProperties().getStringValue("ESBD_InsuranceCertificateNumber"));

                    _data.put("ESBD_SubmitDate", Utils.getDate(row.getProperties().getDateTimeValue("ESBD_SubmitDate")));

                    _data.put("ESBD_Status", row.getProperties().getStringValue("ESBD_Status"));

                    _response.put("response", "success");

                    _response.put("data", _data);

                    break ;

                }

            } else {

                _response.put("response", "success");

            }

        } catch (Exception e) {

            logger.logError(this, methodName, request, e);

            _response.put("response", "failed");

            _response.put("message", e.getMessage());

        } finally {

            UserContext.get().popSubject();

        }

        PluginResponseUtil.writeJSONResponse(request, response, _response, callbacks, ID);

    }

    private void calculate(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        String methodName = "calculate" ;

        PluginLogger logger = callbacks.getLogger();

        logger.logEntry(this, methodName, request);

        // идентификатор объектного хранилища
        String repositoryId = request.getParameter("repositoryId");

        // ответ на запрос
        JSONResponse _response = new JSONResponse();

        Subject subject = callbacks.getP8Subject(repositoryId);

        try {

            UserContext.get().pushSubject(subject);

            // данные запроса в формате JSON объекта:
            //
            // {
            //   "company" : "<страховая компания>",
            //   "insurer": "<идентификатор страхователя>",
            //   "insuredClients": [
            //     {
            //       "client" : "<идентификатор клиента>",
            //       "driverRating" : "<класс водителя>",
            //       "driverLicenseNumber" : "<номер вод. уд-я>",
            //       "driverLicenseIssueDate" : "<дата выдачи вод. уд-я>",
            //       "drivingExperience" : <стаж вождения>,
            //       "privilegeDocumentType" : "<льгота>",
            //       "privilegeDocumentNumber" : "<номер док-а льготы>",
            //       "privilegeDocumentIssueDate" : "<дата выдачи док-а льготы>",
            //       "privilegeDocumentValidTo" : "<срок действия док-а льготы>"
            //     }
            //   ],
            //   "insuredVehicles": [
            //     {
            //       "vehicle" : "<идентификатор ТС>",
            //       "registrationRegion" : "<район регистрации>",
            //       "registrationCity" : "<город регистрации>",
            //       "VRN" : "<гос номер>",
            //       "certificateNumber" : "<номер ПТС>",
            //       "certificateIssueDate" : "<дата выдачи ПТС>",
            //       "certificateValidTo" : "<срок действия ПТС>"
            //     }
            //   ],
            //   "submitDate" : "<дата заключения>",
            //   "startDate" : "<дата начала действия>",
            //   "endDate" : "<дата окончания действия>",
            //   "branch" : "<филиал>",
            //   "certificateNumber" : "<номер полиса>",
            //   "premium" : <страховая премия>
            // }
            //
            String data = request.getParameter("data");

            System.out.println("data: " + data);

            JSONObject _document = JSONObject.parse(data);

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            double baseRate = getBaseRate(objectStore);

            StringBuilder comment = new StringBuilder();

            comment.append("МРП - ").append(baseRate);

            baseRate = baseRate * 1.9 ;

            comment.append(", МРП в премии - ").append(baseRate);

            VehicleDependentRates vehicleDependentRates = getVehicleDependentRates(objectStore, _document);

            comment.append(", К по территории регистрации ТС - ").append(vehicleDependentRates.getRegistrationRegionRate())
                    .append(", Игнорировать бонус-малус? - ").append(vehicleDependentRates.getIgnoreBonusMalusRate())
                    .append(", К по городу регистрации ТС - ").append(vehicleDependentRates.getRegistrationCityRate())
                    .append(", К по типу ТС - ").append(vehicleDependentRates.getTypeRate())
                    .append(", К по сроку эксплуатации - ").append(vehicleDependentRates.getAgeRate());

            ClientDependentRates clientDependentRates = getClientDependentRates(objectStore, _document);

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

            // округляем до 2-х знаков после запятой

            BigDecimal value = new BigDecimal(premium);

            BigDecimal roundOff = value.setScale(2, BigDecimal.ROUND_HALF_EVEN);

            premium = roundOff.doubleValue();

            comment.append(", премия - ").append(premium);

            _response.put("response", "success");

            _response.put("premium", premium);

            _response.put("message", comment.toString());

        } catch (Exception e) {

            logger.logError(this, methodName, request, e);

            _response.put("response", "failed");

            _response.put("message", e.getMessage());

        } finally {

            UserContext.get().popSubject();

        }

        PluginResponseUtil.writeJSONResponse(request, response, _response, callbacks, ID);

    }

    private Folder getCompany(ObjectStore objectStore, String code) {

        SearchSQL searchSQL = new SearchSQL();

        searchSQL.setQueryString("SELECT [Id] FROM [ESBD_Company] WHERE [ESBD_CompanyCode] = '" + code + "'");

        SearchScope searchScope = new SearchScope(objectStore);

        RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, false);

        RepositoryRow row = (RepositoryRow)rowSet.iterator().next();

        Id id = row.getProperties().getIdValue("Id");

        PropertyFilter propertyFilter = new PropertyFilter();

        propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

        return Factory.Folder.fetchInstance(objectStore, id, propertyFilter);

    }

    private Folder getFolder(Folder parent, Date date) {

        Calendar calendar = Calendar.getInstance();

        calendar.setTime(date);

        String[] names = new String[5];

        names[0] = (new DecimalFormat("0000")).format(calendar.get(Calendar.YEAR));

        names[1] = (new DecimalFormat("00")).format(calendar.get(Calendar.MONTH));

        names[2] = (new DecimalFormat("00")).format(calendar.get(Calendar.DAY_OF_MONTH));

        names[3] = (new DecimalFormat("00")).format(calendar.get(Calendar.HOUR_OF_DAY));

        names[4] = (new DecimalFormat("00")).format(calendar.get(Calendar.MINUTE));

        for (String name : names) {

            parent = getFolder(parent, name);

        }

        return parent;

    }

    private Folder getFolder(Folder parent, String name) {

        try {

            PropertyFilter propertyFilter = new PropertyFilter();

            propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

            return Factory.Folder.fetchInstance(parent.getObjectStore(), parent.get_PathName() + "/" + name, propertyFilter);

        } catch (Exception e) {

            Folder folder = Factory.Folder.createInstance(parent.getObjectStore(), "Folder");

            folder.set_FolderName(name);

            folder.set_Parent(parent);

            folder.set_InheritParentPermissions(true);

            folder.save(RefreshMode.REFRESH);

            return folder ;

        }

    }

    private VehicleDependentRates getVehicleDependentRates(ObjectStore objectStore, JSONObject _document) {

        VehicleDependentRates rates = new VehicleDependentRates();

        //   "insuredVehicles": [
        //     {
        //       "vehicle" : "<идентификатор ТС>",
        //       "registrationRegion" : "<район регистрации>",
        //       "registrationCity" : "<город регистрации>",
        //       "VRN" : "<гос номер>",
        //       "certificateNumber" : "<номер ПТС>",
        //       "certificateIssueDate" : "<дата выдачи ПТС>",
        //       "certificateValidTo" : "<срок действия ПТС>"
        //     }
        //   ],

        if (!_document.containsKey("insuredVehicles")) {

            return rates ;

        }

        JSONArray _insuredVehicles = (JSONArray)_document.get("insuredVehicles");

        for (int index = 0; index < _insuredVehicles.size(); index++) {

            JSONObject _insuredVehicle = (JSONObject)_insuredVehicles.get(index);

            if (_insuredVehicle.containsKey("registrationRegion")) {

                String registrationRegion = (String) _insuredVehicle.get("registrationRegion");

                String registrationCity = (String) _insuredVehicle.get("registrationCity");

                retrieveVehicleRegistrationRegionRate(objectStore, rates, registrationRegion, registrationCity);

            }

            if (_insuredVehicle.containsKey("vehicle")) {

                String vehicleId = (String) _insuredVehicle.get("vehicle");

                PropertyFilter propertyFilter = new PropertyFilter();

                propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

                Document vehicle = Factory.Document.fetchInstance(objectStore, new Id(vehicleId), propertyFilter);

                String type = vehicle.getProperties().getStringValue("ESBD_VehicleType");

                Integer issueYear = vehicle.getProperties().getInteger32Value("ESBD_VehicleIssueYear");

                Calendar today = Calendar.getInstance();

                Integer age = issueYear != null ? today.get(Calendar.YEAR) - issueYear : null;

                double typeRate = getVehicleTypeRate(objectStore, type);

                double ageRate = getVehicleAgeRate(objectStore, age);

                rates.setTypeRate(typeRate);

                rates.setAgeRate(ageRate);

            }

        }


        return rates ;

    }

    private ClientDependentRates getClientDependentRates(ObjectStore objectStore, JSONObject _document) {

        ClientDependentRates rates = new ClientDependentRates();

        //   "insuredClients": [
        //     {
        //       "client" : "<идентификатор клиента>",
        //       "driverRating" : "<класс водителя>",
        //       "driverLicenseNumber" : "<номер вод. уд-я>",
        //       "driverLicenseIssueDate" : "<дата выдачи вод. уд-я>",
        //       "drivingExperience" : <стаж вождения>,
        //       "privilegeDocumentType" : "<льгота>",
        //       "privilegeDocumentNumber" : "<номер док-а льготы>",
        //       "privilegeDocumentIssueDate" : "<дата выдачи док-а льготы>",
        //       "privilegeDocumentValidTo" : "<срок действия док-а льготы>"
        //     }
        //   ],

        if (!_document.containsKey("insuredClients")) {

            return rates ;

        }

        JSONArray _insuredClients = (JSONArray)_document.get("insuredClients");

        for (int index = 0; index < _insuredClients.size(); index++) {

            JSONObject _insuredClient = (JSONObject)_insuredClients.get(index);

            if (_insuredClient.containsKey("client")) {

                String clientId = (String)_insuredClient.get("client");

                PropertyFilter propertyFilter = new PropertyFilter();

                propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

                Document client = Factory.Document.fetchInstance(objectStore, new Id(clientId), propertyFilter);

                if (client.get_ClassDescription().get_SymbolicName().equals("ESBD_Person")) {

                    if (_insuredClient.containsKey("drivingExperience")) {

                        Integer drivingExperience = ((Long) _insuredClient.get("drivingExperience")).intValue();

                        Date birthday = client.getProperties().getDateTimeValue("ESBD_Birthday");

                        Integer age = getAge(birthday);

                        double ageAndDrivingExperienceRate = getAgeAndDrivingExperienceRate(objectStore, age, drivingExperience);

                        rates.setAgeAndDrivingExperienceRate(ageAndDrivingExperienceRate);

                    }

                    if (_insuredClient.containsKey("privilegeDocumentType") && _insuredClient.get("privilegeDocumentType") != null) {

                        rates.setPrivilegeRate(0.5);

                    } else {

                        rates.setPrivilegeRate(1.0);

                    }

                    if (_insuredClient.containsKey("driverRating")) {

                        String driverRating = (String) _insuredClient.get("driverRating");

                        rates.setBonusMalusRate(getBonusMalusRate(objectStore, driverRating));

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

        String query = "SELECT [ESBD_Rate], [ESBD_IgnoreBonusMalusRate], [ESBD_CityRegistrationRate] FROM [ESBD_VehicleRegistrationRegionRate] WHERE [ESBD_VehicleRegistrationRegion] = '" + registrationRegion + "'";

        System.out.println("VehicleRegistrationRegionRate: " + query);

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

    private double getVehicleTypeRate(ObjectStore objectStore, String vehicleType) {

        String query = "SELECT [ESBD_Rate] FROM [ESBD_VehicleTypeRate] WHERE [ESBD_VehicleType] = '" + vehicleType + "'";

        System.out.println("VehicleTypeRate: " + query);

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

        String query = "SELECT [ESBD_Rate] FROM [ESBD_AgeAndDrivingExperienceRate] WHERE [ESBD_AgeLessThan] >= " + age + " AND [ESBD_AgeMoreThan] < " + age + " AND [ESBD_DrivingExperienceLessThan] >= " + drivingExperience + " AND [ESBD_DrivingExperienceMoreThan] < " + drivingExperience;

        System.out.println("AgeAndDrivingExperienceRate: " + query);

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

        String query = "SELECT [ESBD_Rate] FROM [ESBD_BonusMalusRate] WHERE [ESBD_DriverRating] = '" + driverRating + "'";

        System.out.println("BonusMalusRate: " + query);

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

        String query = "SELECT [ESBD_Rate] FROM [ESBD_VehicleAgeRate] WHERE [ESBD_AgeLessThan] >= " + age + " AND [ESBD_AgeMoreThan] < " + age;

        System.out.println("VehicleAgeRate: " + query);

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
