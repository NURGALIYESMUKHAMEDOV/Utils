package kz.bsbnb.ecm.extension.web.securitymgmt;

/**
 * Created by Nurgali.Yesmukhamedo on 08.06.2017.
 */
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.io.PrintWriter;
import java.util.StringTokenizer;
import java.util.UUID;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

public class ServiceServlet
        extends HttpServlet
{
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException
    {
        log("-> doGet(request, response)");

        String pathInfo = request.getPathInfo();
        if (pathInfo == null)
        {
            response.setStatus(200);

            return;
        }
        String[] pathElements = pathInfo.split("/");
        if (pathElements.length != 2)
        {
            log("\t{pathInfo : '" + pathInfo + "'} has invalid format");

            response.setStatus(400);

            return;
        }
        if (!pathElements[1].equalsIgnoreCase("types"))
        {
            log("\t{pathInfo : '" + pathInfo + "'} has invalid format");

            response.setStatus(400);

            return;
        }
        JSONArray types = new JSONArray();

        JSONObject type = new JSONObject();

        type.put("symbolicName", "MAP_RequestCase");

        types.put(type);

        type = new JSONObject();

        type.put("symbolicName", "MAP_ApplicationCase");

        types.put(type);

        response.setContentType("text/json");

        response.getWriter().write(types.toString());

        log("<- doGet(request, response)");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException
    {
        log("-> doPost(request, response)");

        String caseType = retrieveCaseType(request);

        log("\tcaseType: '" + caseType + "'");

        JSONObject payload = retrievePayload(request);

        log("\tpayload: " + payload);

        String requestMode = payload.getString("requestMode");

        log("\trequestMode: '" + requestMode + "'");

        JSONArray properties = payload.getJSONArray("properties");

        JSONObject jsonResponse = new JSONObject();

        jsonResponse.put("externalDataIdentifier", UUID.randomUUID().toString());

        jsonResponse.put("properties", properties);

        response.setContentType("text/json; charset=UTF-8");

        jsonResponse.write(response.getWriter());

        response.flushBuffer();

        log("<- doPost(request, response)");
    }

    public void log(String msg)
    {
        System.out.println(msg);
    }

    private String retrieveCaseType(HttpServletRequest request)
            throws ServletException
    {
        log("-> retrieveCaseType(request)");

        String pathInfo = request.getPathInfo();

        log("\tpathInfo : '" + pathInfo + "'");
        if (pathInfo == null) {
            throw new ServletException("PathInfo is invalid");
        }
        StringTokenizer tokens = new StringTokenizer(pathInfo, "/");

        log("\tcount of tokens: " + tokens.countTokens());

        log("\t1st token: '" + tokens.nextToken() + "'");

        String caseType = tokens.nextToken();

        log("\t2nd token: '" + caseType + "'");

        log("<- retrieveCaseType(request)");

        return caseType;
    }

    private JSONObject retrievePayload(HttpServletRequest request)
            throws ServletException, IOException
    {
        log("-> getPayload(request)");

        log("\tset character encoding to 'UTF-8'");

        request.setCharacterEncoding("UTF-8");

        BufferedReader reader = new BufferedReader(new InputStreamReader(request.getInputStream(), "UTF-8"));

        StringBuffer buf = new StringBuffer();

        char[] data = new char['?'];
        int position;
        while ((position = reader.read(data)) > 0) {
            buf.append(data, 0, position);
        }
        log("<- getPayload(request)");

        return new JSONObject(buf.toString());
    }
}
