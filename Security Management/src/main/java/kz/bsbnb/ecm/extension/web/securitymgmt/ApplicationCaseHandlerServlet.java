package kz.bsbnb.ecm.extension.web.securitymgmt;

/**
 * Created by Nurgali.Yesmukhamedo on 08.06.2017.
 */
import java.io.IOException;
import java.io.PrintStream;
import java.util.UUID;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

public class ApplicationCaseHandlerServlet
        extends HttpServlet
{
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException
    {
        log("-> ApplicationCaseHandlerServlet.doPost(request, response)");

        JSONObject payload = Helper.getPayload(request);

        log("\tpayload: " + payload);

        JSONArray properties = payload.getJSONArray("properties");

        JSONObject responseObj = new JSONObject();

        responseObj.put("externalDataIdentifier", UUID.randomUUID().toString());

        responseObj.put("properties", properties);

        log("\tresponse: " + responseObj);

        Helper.setResponse(response, responseObj);

        log("<- ApplicationCaseHandlerServlet.doPost(request, response)");
    }

    public void log(String msg)
    {
        System.out.println(msg);
    }
}
