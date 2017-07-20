package kz.bsbnb.ecm.extension.web.securitymgmt;

/**
 * Created by Nurgali.Yesmukhamedo on 08.06.2017.
 */
import java.io.IOException;
import java.io.PrintStream;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

public class CaseTypeHandlerServlet
        extends HttpServlet
{
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException
    {
        log("-> CaseTypeHandlerServlet.doGet(request, response)");

        JSONArray caseTypes = new JSONArray();

        JSONObject caseType = new JSONObject();

        caseType.put("symbolicName", "MAP_RequestCase");

        caseTypes.put(caseType);

        caseType = new JSONObject();

        caseType.put("symbolicName", "MAP_ApplicationCase");

        caseTypes.put(caseType);

        Helper.setResponse(response, caseTypes);

        log("<- CaseTypeHandlerServlet.doGet(request, response)");
    }

    public void log(String msg)
    {
        System.out.println(msg);
    }
}
