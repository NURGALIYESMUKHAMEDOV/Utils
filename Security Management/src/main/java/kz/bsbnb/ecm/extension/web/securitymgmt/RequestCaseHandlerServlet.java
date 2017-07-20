package kz.bsbnb.ecm.extension.web.securitymgmt;

/**
 * Created by Nurgali.Yesmukhamedo on 08.06.2017.
 */
import com.filenet.api.collection.RepositoryRowSet;
import com.filenet.api.core.Connection;
import com.filenet.api.core.Domain;
import com.filenet.api.core.Factory;
import com.filenet.api.core.ObjectStore;
import com.filenet.api.property.Properties;
import com.filenet.api.query.RepositoryRow;
import com.filenet.api.query.SearchSQL;
import com.filenet.api.query.SearchScope;
import com.filenet.api.util.UserContext;
import java.io.IOException;
import java.io.PrintStream;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

public class RequestCaseHandlerServlet
        extends HttpServlet
{
    public static final String CEURI_PARAMETER_NAME = "CEURI";
    public static final String EXTERNAL_DATA_IDENTIFIER = "externalDataIdentifier";
    public static final String APPLICATION_PROPERTY = "MAP_Application";
    public static final String SECURITY_MANAGERS_PROPERTY = "MAP_SecurityManagers";
    public static final String EMPLOYEE_CODE_PROPERTY = "MAP_EmployeeCode";
    public static final String EMPLOYEE_NAME_PROPERTY = "MAP_EmployeeName";
    public static final String EMPLOYEE_EMAIL_PROPERTY = "MAP_EmployeeEmail";

    public static class RequestCaseData
            implements Serializable
    {
        private List<Application> applications;
        private List<Application> selectedApplications;
        private Employee employee;

        public List<Application> getApplications()
        {
            return this.applications != null ? this.applications : (this.applications = new ArrayList());
        }

        public List<Application> getSelectedApplications()
        {
            return this.selectedApplications != null ? this.selectedApplications : (this.selectedApplications = new ArrayList());
        }

        public Employee getEmployee()
        {
            return this.employee;
        }

        public void setEmployee(Employee employee)
        {
            this.employee = employee;
        }
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException
    {
        log("-> RequestCaseHandlerServlet.doPost(request, response)");

        JSONObject payload = Helper.getPayload(request);

        log("\tpayload: " + payload);

        JSONObject responseObj = processPayload(payload, request);

        log("\tresponse: " + responseObj);

        Helper.setResponse(response, responseObj);

        log("<- RequestCaseHandlerServlet.doPost(request, response)");
    }

    public void log(String msg)
    {
        System.out.println(msg);
    }

    protected JSONObject processPayload(JSONObject payload, HttpServletRequest request)
    {
        String requestMode = payload.getString("requestMode");

        log("\trequestMode: '" + requestMode + "'");
        if ("initialNewObject".equalsIgnoreCase(requestMode)) {
            return initialNewObject(payload, request);
        }
        if ("initialExistingObject".equalsIgnoreCase(requestMode)) {
            return initialExistingObject(payload, request);
        }
        if ("inProgressChanges".equalsIgnoreCase(requestMode)) {
            return inProgressChanges(payload, request);
        }
        if ("finalNewObject".equalsIgnoreCase(requestMode)) {
            return finalNewObject(payload, request);
        }
        if ("finalExistingObject".equalsIgnoreCase(requestMode)) {
            return finalExistingObject(payload, request);
        }
        return null;
    }

    private void updateProperties(RequestCaseData data, JSONArray properties)
    {
        for (int index = 0; index < properties.length(); index++)
        {
            JSONObject property = properties.getJSONObject(index);

            String symbolicName = property.getString("symbolicName");
            if (symbolicName.equalsIgnoreCase("MAP_Application"))
            {
                JSONObject choiceList = new JSONObject();

                choiceList.put("displayName", "����������");

                JSONArray choices = new JSONArray();
                for (Application application : data.getApplications())
                {
                    JSONObject choice = new JSONObject();

                    choice.put("displayName", application.getCode());

                    choice.put("value", application.getCode());

                    choices.put(choice);
                }
                choiceList.put("choices", choices);

                property.put("choiceList", choiceList);

                property.put("hasDependentProperties", true);
            }
            else if (symbolicName.equalsIgnoreCase("MAP_SecurityManagers"))
            {
                JSONArray values = new JSONArray();
                for (Application application : data.getSelectedApplications()) {
                    values.put(application.getSecurityManager());
                }
                property.put("value", values);
            }
            else if (symbolicName.equalsIgnoreCase("MAP_EmployeeCode"))
            {
                property.put("hasDependentProperties", true);
            }
            else if (symbolicName.equalsIgnoreCase("MAP_EmployeeName"))
            {
                if (data.getEmployee() != null) {
                    property.put("value", data.getEmployee().getName());
                } else {
                    property.put("value", "");
                }
            }
            else if (symbolicName.equalsIgnoreCase("MAP_EmployeeEmail"))
            {
                if (data.getEmployee() != null) {
                    property.put("value", data.getEmployee().getEmail());
                } else {
                    property.put("value", "");
                }
            }
        }
    }

    protected JSONObject initialNewObject(JSONObject payload, HttpServletRequest request)
    {
        JSONObject response = new JSONObject();

        String uuid = UUID.randomUUID().toString();

        response.put("externalDataIdentifier", uuid);

        RequestCaseData data = new RequestCaseData();

        data.getApplications().addAll(retrieveApplications());

        Requests.setData(uuid, data);

        log("\tput requestData into the store, applications count is " + data.getApplications().size());

        JSONArray properties = payload.getJSONArray("properties");

        updateProperties(data, properties);

        response.put("properties", properties);

        return response;
    }

    protected JSONObject initialExistingObject(JSONObject payload, HttpServletRequest request)
    {
        JSONObject response = new JSONObject();

        String uuid = UUID.randomUUID().toString();

        response.put("externalDataIdentifier", uuid);

        JSONArray properties = payload.getJSONArray("properties");

        response.put("properties", properties);

        return response;
    }

    protected JSONObject inProgressChanges(JSONObject payload, HttpServletRequest request)
    {
        String uuid = payload.getString("externalDataIdentifier");

        RequestCaseData data = (RequestCaseData)Requests.getData(uuid);
        if (data == null)
        {
            data = new RequestCaseData();

            Requests.setData(uuid, data);
        }
        log("\tget requestData from the store, applications count is " + data.getApplications().size());

        JSONArray properties = payload.getJSONArray("properties");
        for (int index = 0; index < properties.length(); index++)
        {
            JSONObject property = properties.getJSONObject(index);

            String symbolicName = property.getString("symbolicName");
            if ("MAP_EmployeeCode".equalsIgnoreCase(symbolicName))
            {
                String employeeCode = property.getString("value");

                data.setEmployee(retrieveEmployee(employeeCode));
            }
            else if ("MAP_Application".equalsIgnoreCase(symbolicName))
            {
                log("\tvalue is array!!");
                if (!property.isNull("value"))
                {
                    JSONArray values = property.getJSONArray("value");

                    data.getSelectedApplications().clear();
                    String value;
                    for (int i = 0; i < values.length(); i++)
                    {
                        value = values.getString(i);
                        for (Application application : data.getApplications()) {
                            if (application.getCode().equals(value))
                            {
                                data.getSelectedApplications().add(application);

                                break;
                            }
                        }
                    }
                }
            }
        }
        updateProperties(data, properties);

        JSONObject response = new JSONObject();

        response.put("externalDataIdentifier", uuid);

        response.put("properties", properties);

        return response;
    }

    protected JSONObject finalNewObject(JSONObject payload, HttpServletRequest request)
    {
        String uuid = payload.getString("externalDataIdentifier");

        RequestCaseData data = (RequestCaseData)Requests.getData(uuid);

        Requests.removeData(uuid);

        JSONArray properties = payload.getJSONArray("properties");
        if (data != null) {
            updateProperties(data, properties);
        }
        JSONObject response = new JSONObject();

        response.put("externalDataIdentifier", uuid);

        response.put("properties", properties);

        return response;
    }

    protected JSONObject finalExistingObject(JSONObject payload, HttpServletRequest request)
    {
        String uuid = payload.getString("externalDataIdentifier");

        Requests.removeData(uuid);

        JSONArray properties = payload.getJSONArray("properties");

        JSONObject response = new JSONObject();

        response.put("externalDataIdentifier", uuid);

        response.put("properties", properties);

        return response;
    }

    private List<Application> retrieveApplications()
    {
        List<Application> applications = new ArrayList();

        String CEURI = getServletContext().getInitParameter("CEURI");

        log("\tCEURI: '" + CEURI + "'");

        UserContext userContext = new UserContext();

        UserContext originalUserContext = UserContext.get();

        UserContext.set(userContext);
        try
        {
            Connection connection = Factory.Connection.getConnection(CEURI);

            log("\tconnection: " + connection);

            Domain domain = Factory.Domain.fetchInstance(connection, null, null);

            log("\tdomain: " + domain);

            ObjectStore objectStore = Factory.ObjectStore.fetchInstance(domain, "TOS", null);

            log("\tobjectStore: " + objectStore);

            SearchSQL search = new SearchSQL();

            search.setQueryString("SELECT FolderName, MAP_ApplicationName, MAP_ApplicationCode, MAP_SecurityManager, MAP_SecurityAdministrator FROM MAP_ApplicationCase");

            SearchScope searchScope = new SearchScope(objectStore);

            RepositoryRowSet rowSet = searchScope.fetchRows(search, null, null, Boolean.valueOf(false));
            if (rowSet != null)
            {
                Iterator it = rowSet.iterator();
                while (it.hasNext())
                {
                    RepositoryRow row = (RepositoryRow)it.next();

                    String applicationName = row.getProperties().getStringValue("MAP_ApplicationName");

                    String applicationCode = row.getProperties().getStringValue("MAP_ApplicationCode");

                    String securityManager = row.getProperties().getStringValue("MAP_SecurityManager");

                    String securityAdministrator = row.getProperties().getStringValue("MAP_SecurityAdministrator");

                    Application application = new Application();

                    application.setCode(applicationCode);

                    application.setName(applicationName);

                    application.setSecurityManager(securityManager);

                    application.setSecurityAdministrator(securityAdministrator);

                    applications.add(application);
                }
            }
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
        finally
        {
            UserContext.set(originalUserContext);
        }
        return applications;
    }

    private Employee retrieveEmployee(String employeeCode)
    {
        String CEURI = getServletContext().getInitParameter("CEURI");

        UserContext userContext = new UserContext();

        UserContext originalUserContext = UserContext.get();

        UserContext.set(userContext);
        try
        {
            Connection connection = Factory.Connection.getConnection(CEURI);

            Domain domain = Factory.Domain.fetchInstance(connection, null, null);

            ObjectStore objectStore = Factory.ObjectStore.fetchInstance(domain, "TOS", null);

            SearchSQL search = new SearchSQL();

            search.setQueryString("SELECT FolderName, MAP_EmployeeName, MAP_EmployeeCode, MAP_EmployeeEmail FROM MAP_EmployeeCase WHERE MAP_EmployeeCode = '" + employeeCode + "'");

            SearchScope searchScope = new SearchScope(objectStore);

            RepositoryRowSet rowSet = searchScope.fetchRows(search, null, null, Boolean.valueOf(false));
            if (rowSet != null)
            {
                Iterator it = rowSet.iterator();
                if (it.hasNext())
                {
                    RepositoryRow row = (RepositoryRow)it.next();

                    String employeeName = row.getProperties().getStringValue("MAP_EmployeeName");

                    String employeeEmail = row.getProperties().getStringValue("MAP_EmployeeEmail");

                    Employee employee = new Employee();

                    employee.setCode(employeeCode);

                    employee.setName(employeeName);

                    employee.setEmail(employeeEmail);

                    return employee;
                }
            }
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
        finally
        {
            UserContext.set(originalUserContext);
        }
        return null;
    }
}
