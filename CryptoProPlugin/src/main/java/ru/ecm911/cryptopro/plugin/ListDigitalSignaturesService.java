package ru.ecm911.cryptopro.plugin;

import com.filenet.api.collection.RepositoryRowSet;
import com.filenet.api.core.ObjectStore;
import com.filenet.api.property.Properties;
import com.filenet.api.query.RepositoryRow;
import com.filenet.api.query.SearchSQL;
import com.filenet.api.query.SearchScope;
import com.filenet.api.util.Id;
import com.filenet.api.util.UserContext;
import com.ibm.ecm.extension.PluginService;
import com.ibm.ecm.extension.PluginServiceCallbacks;
import java.io.PrintStream;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

public class ListDigitalSignaturesService
        extends PluginService
{
    public static final String ID = "ListDigitalSignaturesService";
    private static final String REPOSITORY_ID_PARAM_NAME = "repositoryId";
    private static final String REPOSITORY_TYPE_PARAM_NAME = "repositoryType";
    private static final String ID_PARAM_NAME = "id";
    private static final String P8_REPOSITORY_TYPE = "p8";

    public String getId()
    {
        return "ListDigitalSignaturesService";
    }

    public void execute(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response)
            throws Exception
    {
        log("-> ListDigitalSignaturesService.execute(callbacks, request, response)");

        String repositoryId = request.getParameter("repositoryId");

        String repositoryType = request.getParameter("repositoryType");

        String id = request.getParameter("id");
        if ("p8".equalsIgnoreCase(repositoryType))
        {
            JSONArray objects = listDigitalSignatures(callbacks, repositoryId, id);

            JSONObject result = new JSONObject();

            result.put("data", objects);

            PrintWriter out = response.getWriter();

            out.print(result);
        }
        else
        {
            PrintWriter out = response.getWriter();

            out.println("{message: 'Указанный тип репозитория не поддерживается'}");
        }
        log("<- ListDigitalSignaturesService.execute(callbacks, request, response)");
    }

    private JSONArray listDigitalSignatures(PluginServiceCallbacks callbacks, String repositoryId, String id)
    {
        SimpleDateFormat formatter = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss");

        JSONArray objects = new JSONArray();
        try
        {
            Subject subject = callbacks.getP8Subject(repositoryId);

            UserContext userContext = UserContext.get();

            userContext.pushSubject(subject);

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            String query = "SELECT \n  dsig.[Id],\n  dsig.[sigSigner], \n  dsig.[sigIssuer], \n  dsig.[sigValidFrom], \n  dsig.[sigValidTo], \n  dsig.[sigStatus], \n  dsig.[DateLastModified] \nFROM \n  [sigDigitalSignature] dsig \nWHERE \n  dsig.[AnnotatedObject] = OBJECT(" + id + ")";

            log("query: '" + query + "'");

            SearchSQL searchSQL = new SearchSQL();

            searchSQL.setQueryString(query);

            SearchScope searchScope = new SearchScope(objectStore);

            RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, Boolean.valueOf(false));
            if (rowSet != null)
            {
                Iterator it = rowSet.iterator();
                while (it.hasNext())
                {
                    RepositoryRow row = (RepositoryRow)it.next();

                    Properties properties = row.getProperties();

                    JSONObject object = new JSONObject();

                    object.put("id", properties.getIdValue("Id").toString());

                    object.put("signer", properties.getStringValue("sigSigner"));

                    object.put("issuer", properties.getStringValue("sigIssuer"));

                    Date date = properties.getDateTimeValue("sigValidFrom");
                    if (date != null) {
                        object.put("validFrom", formatter.format(date));
                    } else {
                        object.put("validFrom", JSONObject.NULL);
                    }
                    date = properties.getDateTimeValue("sigValidTo");
                    if (date != null) {
                        object.put("validTo", formatter.format(date));
                    } else {
                        object.put("validTo", JSONObject.NULL);
                    }
                    object.put("status", properties.getInteger32Value("sigStatus"));

                    date = properties.getDateTimeValue("DateLastModified");
                    if (date != null) {
                        object.put("date", formatter.format(date));
                    } else {
                        object.put("date", JSONObject.NULL);
                    }
                    objects.put(object);
                }
            }
            log(objects.toString());
        }
        catch (Exception e)
        {
            log(e);
        }
        return objects;
    }

    private void log(String message)
    {
        System.out.println(message);
    }

    private void log(Throwable throwable)
    {
        throwable.printStackTrace(System.out);
    }
}
