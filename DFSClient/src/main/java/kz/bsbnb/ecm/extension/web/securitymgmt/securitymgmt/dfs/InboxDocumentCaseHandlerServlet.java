package kz.bsbnb.ecm.extension.web.securitymgmt.securitymgmt.dfs;

/**
 * Created by Nurgali.Yesmukhamedo on 08.06.2017.
 */
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

public class InboxDocumentCaseHandlerServlet
        extends HttpServlet
{
    public static final String EXTERNAL_DATA_IDENTIFIER = "externalDataIdentifier";
    public static final String DOCUMENT_REGISTRATION_DATE = "DFS_DocumentRegistrationDate";
    public static final String DOCUMENT_NUMBER = "DFS_DocumentNumber";

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException
    {
        log("-> InboxDocumentCaseHandlerServlet.doPost(request, response)");

        JSONObject payload = Helper.getPayload(request);

        log("\tpayload: " + payload);

        JSONObject responseObj = processPayload(payload, request);

        log("\tresponse: " + responseObj);

        Helper.setResponse(response, responseObj);

        log("<- InboxDocumentCaseHandlerServlet.doPost(request, response)");
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

    protected JSONObject initialNewObject(JSONObject payload, HttpServletRequest request)
    {
        JSONObject response = new JSONObject();

        String uuid = UUID.randomUUID().toString();

        response.put("externalDataIdentifier", uuid);

        JSONArray properties = payload.getJSONArray("properties");
        for (int index = 0; index < properties.length(); index++)
        {
            JSONObject property = properties.getJSONObject(index);

            String symbolicName = property.getString("symbolicName");
            if ("DFS_DocumentRegistrationDate".equalsIgnoreCase(symbolicName))
            {
                SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");

                property.put("value", formatter.format(new Date()));
            }
            else if ("DFS_DocumentNumber".equalsIgnoreCase(symbolicName))
            {
                property.put("value", Helper.retrieveDocumentNumber());
            }
        }
        response.put("properties", properties);

        return response;
    }

    protected JSONObject initialExistingObject(JSONObject payload, HttpServletRequest request)
    {
        return null;
    }

    protected JSONObject inProgressChanges(JSONObject payload, HttpServletRequest request)
    {
        return null;
    }

    protected JSONObject finalNewObject(JSONObject payload, HttpServletRequest request)
    {
        return null;
    }

    protected JSONObject finalExistingObject(JSONObject payload, HttpServletRequest request)
    {
        return null;
    }
}
