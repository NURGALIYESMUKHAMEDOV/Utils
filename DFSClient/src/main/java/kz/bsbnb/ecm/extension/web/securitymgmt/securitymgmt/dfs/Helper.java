package kz.bsbnb.ecm.extension.web.securitymgmt.securitymgmt.dfs;

/**
 * Created by Nurgali.Yesmukhamedo on 08.06.2017.
 */
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Random;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

public class Helper
{
    public static JSONObject getPayload(HttpServletRequest request)
            throws ServletException, IOException
    {
        request.setCharacterEncoding("UTF-8");

        BufferedReader reader = new BufferedReader(new InputStreamReader(request.getInputStream(), "UTF-8"));

        StringBuffer buf = new StringBuffer();

        char[] data = new char['?'];
        int position;
        while ((position = reader.read(data)) > 0) {
            buf.append(data, 0, position);
        }
        return new JSONObject(buf.toString());
    }

    public static void setResponse(HttpServletResponse response, JSONObject responseObj)
            throws ServletException, IOException
    {
        response.setContentType("text/json; charset=UTF-8");

        responseObj.write(response.getWriter());

        response.flushBuffer();
    }

    public static void setResponse(HttpServletResponse response, JSONArray responseObj)
            throws ServletException, IOException
    {
        response.setContentType("text/json; charset=UTF-8");

        responseObj.write(response.getWriter());

        response.flushBuffer();
    }

    public static String retrieveDocumentNumber()
    {
        Random random = new Random(System.currentTimeMillis());

        return String.valueOf(random.nextInt(1000));
    }
}

