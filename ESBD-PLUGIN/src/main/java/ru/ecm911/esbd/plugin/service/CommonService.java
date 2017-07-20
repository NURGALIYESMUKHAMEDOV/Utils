package ru.ecm911.esbd.plugin.service;

import com.filenet.api.collection.IdList;
import com.filenet.api.constants.FilteredPropertyType;
import com.filenet.api.constants.RefreshMode;
import com.filenet.api.core.CustomObject;
import com.filenet.api.core.Factory;
import com.filenet.api.core.Folder;
import com.filenet.api.core.ObjectStore;
import com.filenet.api.property.PropertyFilter;
import com.filenet.api.util.UserContext;
import com.ibm.ecm.extension.PluginService;
import com.ibm.ecm.extension.PluginServiceCallbacks;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.util.Date;
import java.util.logging.Logger;

public class CommonService extends PluginService {

    public static final String Id = "CommonService" ;

    private Logger logger ;

    @Override
    public String getId() {

        return CommonService.Id;

    }

    @Override
    public void execute(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        getLogger().entering(getClass().getName(), "execute", new Object[]{callbacks, request, response});

        String repositoryId = request.getParameter("repositoryId");

        Subject subject = callbacks.getP8Subject(repositoryId);

        try {

            UserContext.get().pushSubject(subject);

            String name = request.getParameter("name");

            getLogger().info("name: " + name);

            if ("selectCompany".equals(name)) {

                selectCompany(callbacks, request, response);

            } else if ("calculatePremium".equals(name)) {

                calculatePremium(callbacks, request, response);

            } else {

                JSONObject responseObject = new JSONObject();

                responseObject.put("error", true);

                responseObject.put("errorMessage", "Указанный метод не поддерживается");

                response.setContentType("text/json");

                response.getWriter().print(responseObject.toString());

                response.flushBuffer();

            }

        } finally {

            UserContext.get().popSubject();

        }
    }

    private void selectCompany(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        String methodName = "selectCompany" ;

        callbacks.getLogger().logEntry(this, methodName, request);

        JSONObject responseObject = new JSONObject();

        String id = request.getParameter("id");

        String repositoryId = callbacks.getRepositoryId();

        try {

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            PropertyFilter propertyFilter = new PropertyFilter();

            propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

            Folder company = Factory.Folder.fetchInstance(objectStore, new com.filenet.api.util.Id(id), propertyFilter);

            responseObject.put("id", company.get_Id().toString());

            responseObject.put("name", company.getProperties().getStringValue("ESBD_CompanyName"));

            responseObject.put("code", company.getProperties().getStringValue("ESBD_CompanyCode"));

            JSONObject selectedCompany = new JSONObject();

            selectedCompany.put("id", company.get_Id().toString());

            selectedCompany.put("name", company.getProperties().getStringValue("ESBD_CompanyName"));

            selectedCompany.put("code", company.getProperties().getStringValue("ESBD_CompanyCode"));

            HttpSession session = request.getSession();

            session.setAttribute("selectedCompany", selectedCompany);

            System.out.println("select company : " + selectedCompany.toString());

        } catch (Exception e) {

            responseObject.put("error", true);

            responseObject.put("errorMessage", e.getMessage());

        }

        response.setContentType("text/plain");

        response.getWriter().print(responseObject.toString());

        response.flushBuffer();

    }

    private void calculatePremium(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        getLogger().entering(getClass().getName(), "calculatePremium", new Object[]{callbacks, request, response});

        JSONObject responseObject = new JSONObject();

        String propertiesJson = request.getParameter("properties");

        logger.info("properties: " + propertiesJson);

        String repositoryId = callbacks.getRepositoryId();

        try {

            IdList insuredClients = Factory.IdList.createList();

            IdList insuredVehicles = Factory.IdList.createList();

            String item = "null";
            String ESBD_Amount = "null";
            String ESBD_Tarif = "null";
            String ESBD_PassengerType = "null";
            String ESBD_CorrectionFactor = "null";
            String ESBD_ProfRiskClass = "null";
            Date ESBD_StartDate = null;
            Date ESBD_EndDate = null;




            JSONArray properties = JSONArray.parse(propertiesJson);

            for (int index = 0; index < properties.size(); index++) {

                JSONObject property = (JSONObject)properties.get(index);

                getLogger().info("property: " + property);

                if (property.get("name").equals("ESBD_InsuredClients")) {

                    JSONArray value = (JSONArray)property.get("value");

                    for (int j = 0; j < value.size(); j++) {

                        insuredClients.add(new com.filenet.api.util.Id((String)value.get(j)));

                    }

                } else if (property.get("name").equals("ESBD_InsuredVehicles")) {

                    JSONArray value = (JSONArray)property.get("value");

                    for (int j = 0; j < value.size(); j++) {

                        insuredVehicles.add(new com.filenet.api.util.Id((String)value.get(j)));

                    }

                }else if(property.get("name").equals("ESBD_Amount")){

                    ESBD_Amount = property.get("value").toString();

                }else if(property.get("name").equals("ESBD_Tarif")){

                    ESBD_Tarif = property.get("value").toString();

                }else if(property.get("name").equals("ESBD_PassengerType")){

                    ESBD_PassengerType = property.get("value").toString();

                }else if(property.get("name").equals("ESBD_CorrectionFactor")){

                    ESBD_CorrectionFactor = property.get("value").toString();

                }else if(property.get("name").equals("ESBD_ProfRiskClass")){

                    ESBD_ProfRiskClass = property.get("value").toString();

                }else if(property.get("name").equals("ESBD_StartDate")){

                    //ESBD_CorrectionFactor = property.get("value").toString();
                    System.out.println(property.get("value").toString());

                }else if(property.get("name").equals("ESBD_EndDate")){

                    System.out.println(property.get("value").toString());

                    //ESBD_ProfRiskClass = property.get("value").toString();
                }
            }

            item = request.getParameter("item");
            getLogger().info("Item: " + item);
            getLogger().info("ESBD_Tarif: " + ESBD_Tarif);
            getLogger().info("ESBD_Amount: " + ESBD_Amount);
            getLogger().info("ESBD_PassengerType: " + ESBD_PassengerType);
            getLogger().info("ESBD_CorrectionFactor: " + ESBD_CorrectionFactor);
            getLogger().info("ESBD_ProfRiskClass: " + ESBD_ProfRiskClass);

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            PropertyFilter propertyFilter = new PropertyFilter();

            propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

            getLogger().info("Begining Object create");

            CustomObject object = Factory.CustomObject.createInstance(objectStore, "ESBD_CalculatePremium");

            getLogger().info("Begining Object after create");

            object.getProperties().putValue("ESBD_InsuredClients", insuredClients);

            object.getProperties().putValue("ESBD_InsuredVehicles", insuredVehicles);

            object.getProperties().putValue("ESBD_ObjectName",item);

            getLogger().info("Begining Object after create properties");

            if(!ESBD_Amount.equals("null"))
                object.getProperties().putValue("ESBD_Amount",Float.parseFloat(ESBD_Amount));

            if(!ESBD_Tarif.equals("null"))
                object.getProperties().putValue("ESBD_Tarif",Float.parseFloat(ESBD_Tarif));

            if(!ESBD_PassengerType.equals("null"))
                object.getProperties().putValue("ESBD_PassengerType",Integer.parseInt(ESBD_PassengerType));

            if(!ESBD_CorrectionFactor.equals("null"))
                object.getProperties().putValue("ESBD_CorrectionFactor",Float.parseFloat(ESBD_CorrectionFactor));

            if(!ESBD_ProfRiskClass.equals("null"))
                object.getProperties().putValue("ESBD_ProfRiskClass",Integer.parseInt(ESBD_ProfRiskClass));

            getLogger().info("Begining Object befure save");

            object.save(RefreshMode.REFRESH);

            getLogger().info("Object created");

            Double calculatedPremium = object.getProperties().getFloat64Value("ESBD_CalculatedPremium");

            getLogger().info("Premium created");

            getLogger().info("calculated premium: " + calculatedPremium);

            getLogger().info("Item: " + item);


            object.delete();

            object.save(RefreshMode.NO_REFRESH);

            responseObject.put("calculatedPremium", calculatedPremium);

        } catch (Exception e) {

            responseObject.put("error", true);

            responseObject.put("errorMessage", e.getMessage());

        }

        response.setContentType("application/json");

        response.getWriter().print(responseObject.toString());

        response.flushBuffer();

    }

    private Logger getLogger() {

        return logger != null ? logger : (logger = Logger.getLogger(getClass().getName()));

    }

}
