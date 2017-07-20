package kz.bsbnb.ecm.extension.plugin.dfs;

import com.filenet.api.collection.RepositoryRowSet;
import com.filenet.api.core.ObjectStore;
import com.filenet.api.property.Properties;
import com.filenet.api.query.RepositoryRow;
import com.filenet.api.query.SearchSQL;
import com.filenet.api.query.SearchScope;
import com.filenet.api.util.UserContext;
import com.ibm.ecm.extension.PluginService;
import com.ibm.ecm.extension.PluginServiceCallbacks;
import org.json.JSONArray;
import org.json.JSONObject;

import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

public class ResolutionService extends PluginService {

    public static final String Id = "ResolutionService" ;

    private static final String REPOSITORY_ID_PARAM_NAME = "repositoryId" ;

    private static final String REPOSITORY_TYPE_PARAM_NAME = "repositoryType" ;

    private static final String OPERATION_PARAM_NAME = "op" ;

    private static final String LIST_OPERATION = "list" ;

    private static final String GET_OPERATION = "get" ;

    private static final String ID_PARAM_NAME = "id" ;

    @Override
    public String getId() {
        return ResolutionService.Id;
    }

    @Override
    public void execute(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        log("-> ResolutionService.execute({callbacks : '" + callbacks + "', request: '" + request + "', response: '" + response + "'})");

        String repositoryType = request.getParameter(REPOSITORY_TYPE_PARAM_NAME);

        String op = request.getParameter(OPERATION_PARAM_NAME);

        JSONObject result = new JSONObject();

        log("\t process {repositoryType: '" + repositoryType + "', op: '" + op + "'}");

        if ("p8".equalsIgnoreCase(repositoryType)) {

            if (LIST_OPERATION.equalsIgnoreCase(op)) {

                doList(callbacks, request, response);

                return ;

            } else if (GET_OPERATION.equalsIgnoreCase(op)) {

                // doGet(callbacks, request, response);

                return ;

            } else {

                result.put("errorMessage", "Unsupported op '" + op + "'");

            }

        } else {

            result.put("errorMessage", "Unsupported repository type '" + repositoryType + "'");

        }

        PrintWriter out = response.getWriter();

        out.print(result);

    }

    private void doList(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        log("-> ResolutionService.doList({callbacks : '" + callbacks + "', request: '" + request + "', response: '" + response + "'})");

        String repositoryId = request.getParameter(REPOSITORY_ID_PARAM_NAME);

        String id = request.getParameter(ID_PARAM_NAME);

        log("\t process {repositoryId: '" + repositoryId + "', id: '" + id + "'}");

        JSONObject result = new JSONObject();

        try {

            SimpleDateFormat formatter = new SimpleDateFormat("dd.MM.yyyy");

            Subject subject = callbacks.getP8Subject(repositoryId);

            UserContext userContext = UserContext.get();

            userContext.pushSubject(subject);

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            SearchSQL searchSQL = new SearchSQL();

            String query = "SELECT \n" +
                    "  r.[" + DmConstants.RESOLUTION_ID_PROPERTY_NAME + "],\n" +
                    "  r.[" + DmConstants.RESOLUTION_TEXT_PROPERTY_NAME + "],\n" +
                    "  r.[" + DmConstants.RESOLUTION_DEADLINE_DATE_PROPERTY_NAME + "], \n" +
                    "  r.[" + DmConstants.RESOLUTION_MILESTONE_DATE_PROPERTY_NAME + "], \n" +
                    "  r.[" + DmConstants.RESOLUTION_STATUS_PROPERTY_NAME + "], \n" +
                    "  e.[" + DmConstants.EMPLOYEE_NAME_PROPERTY_NAME + "] AS \"PerformerName\", \n" +
                    "  c.[" + DmConstants.EMPLOYEE_NAME_PROPERTY_NAME + "] AS \"SupervisorName\" \n" +
                    "FROM \n" +
                    "  ([" + DmConstants.RESOLUTION_CLASS_NAME + "] r \n" +
                    "    INNER JOIN [" + DmConstants.EMPLOYEE_CLASS_NAME + "] e ON e.[" + DmConstants.EMPLOYEE_ID_PROPERTY_NAME + "] = r.[" + DmConstants.RESOLUTION_PERFORMER_PROPERTY_NAME + "]) \n" +
                    "      LEFT OUTER JOIN [" + DmConstants.EMPLOYEE_CLASS_NAME + "] c ON c.[" + DmConstants.EMPLOYEE_ID_PROPERTY_NAME + "] = r.[" + DmConstants.RESOLUTION_SUPERVISOR_PROPERTY_NAME + "]\n" +
                    "WHERE \n" +
                    "  r.[" + DmConstants.RESOLUTION_INBOX_DOCUMENT_PROPERTY_NAME + "] = '" + id + "'";

            log("query: '" + query + "'");

            searchSQL.setQueryString(query);

            SearchScope searchScope = new SearchScope(objectStore);

            RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, false);

            JSONArray objects = new JSONArray();

            if (rowSet != null) {

                Iterator it = rowSet.iterator();

                while (it.hasNext()) {

                    RepositoryRow row = (RepositoryRow) it.next();

                    Properties properties = row.getProperties();

                    JSONObject object = new JSONObject();

                    object.put("id", properties.getIdValue(DmConstants.RESOLUTION_ID_PROPERTY_NAME).toString());

                    object.put("text", properties.getStringValue(DmConstants.RESOLUTION_TEXT_PROPERTY_NAME));

                    Date date = properties.getDateTimeValue(DmConstants.RESOLUTION_DEADLINE_DATE_PROPERTY_NAME);

                    if (date != null) {

                        object.put("deadline", formatter.format(date));

                    } else {

                        object.put("deadline", JSONObject.NULL);

                    }

                    date = properties.getDateTimeValue(DmConstants.RESOLUTION_MILESTONE_DATE_PROPERTY_NAME);

                    if (date != null) {

                        object.put("milestone", formatter.format(date));

                    } else {

                        object.put("milestone", JSONObject.NULL);

                    }

                    object.put("performer", properties.getStringValue("PerformerName"));

                    object.put("supervisor", properties.getStringValue("SupervisorName"));

                    object.put("status", properties.getStringValue(DmConstants.RESOLUTION_STATUS_PROPERTY_NAME));

                    objects.put(object);

                }

            }

            result.put("data", objects);

        } catch (Exception e) {

            result.put("errorMessage", "Ошибка получения информации о сотрудниках");

            log(e);

        }

        PrintWriter out = response.getWriter();

        out.print(result);

    }

    private void log(String message) {

        System.out.println(message);

    }

    private void log(Throwable throwable) {

        throwable.printStackTrace();

    }

}
