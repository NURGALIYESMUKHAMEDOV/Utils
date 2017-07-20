package kz.bsbnb.ecm.extension.plugin.dfs;

import com.filenet.api.collection.RepositoryRowSet;
import com.filenet.api.constants.FilteredPropertyType;
import com.filenet.api.core.Factory;
import com.filenet.api.core.Folder;
import com.filenet.api.core.ObjectStore;
import com.filenet.api.property.Properties;
import com.filenet.api.property.PropertyFilter;
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
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class DivisionService extends PluginService {

    public static final String Id = "DivisionService" ;

    private static final String REPOSITORY_ID_PARAM_NAME = "repositoryId" ;

    private static final String REPOSITORY_TYPE_PARAM_NAME = "repositoryType" ;

    private static final String OPERATION_PARAM_NAME = "op" ;

    private static final String LIST_OPERATION = "list" ;

    private static final String GET_OPERATION = "get" ;

    private static final String ID_PARAM_NAME = "id" ;

    private static final String CODE_PARAM_NAME = "code" ;

    private static final String NAME_PARAM_NAME = "name" ;

    @Override
    public String getId() {
        return DivisionService.Id;
    }

    @Override
    public void execute(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        log("-> DivisionService.execute({callbacks : '" + callbacks + "', request: '" + request + "', response: '" + response + "'})");

        String repositoryType = request.getParameter(REPOSITORY_TYPE_PARAM_NAME);

        String op = request.getParameter(OPERATION_PARAM_NAME);

        JSONObject result = new JSONObject();

        log("\t process {repositoryType: '" + repositoryType + "', op: '" + op + "'}");

        if ("p8".equalsIgnoreCase(repositoryType)) {

            if (LIST_OPERATION.equalsIgnoreCase(op)) {

                doList(callbacks, request, response);

                return ;

            } else if (GET_OPERATION.equalsIgnoreCase(op)) {

                doGet(callbacks, request, response);

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

        log("-> DivisionService.doList({callbacks : '" + callbacks + "', request: '" + request + "', response: '" + response + "'})");

        String repositoryId = request.getParameter(REPOSITORY_ID_PARAM_NAME);

        String code = request.getParameter(CODE_PARAM_NAME);

        String name = request.getParameter(NAME_PARAM_NAME);

        log("\t process {repositoryId: '" + repositoryId + "', code: '" + code + "', name: '" + name + "'}");

        JSONObject result = new JSONObject();

        try {

            Subject subject = callbacks.getP8Subject(repositoryId);

            UserContext userContext = UserContext.get();

            userContext.pushSubject(subject);

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            SearchSQL searchSQL = new SearchSQL();

            List<String> expressions = new ArrayList<String>();

            if (code != null && !code.isEmpty()) {

                expressions.add("d.[" + DmConstants.DIVISION_CODE_PROPERTY_NAME + "] LIKE '%" + code + "%'");

            }

            if (name != null && !name.isEmpty()) {

                expressions.add("d.[" + DmConstants.DIVISION_NAME_PROPERTY_NAME + "] LIKE '%" + name + "%'");

            }

            String query = "SELECT\n" +
                    "  d.[" + DmConstants.DIVISION_ID_PROPERTY_NAME + "],\n" +
                    "  d.[" + DmConstants.DIVISION_CODE_PROPERTY_NAME + "],\n" +
                    "  d.[" + DmConstants.DIVISION_NAME_PROPERTY_NAME + "],\n" +
                    "  p.[" + DmConstants.DIVISION_NAME_PROPERTY_NAME + "] AS \"" + DmConstants.DIVISION_PARENT_NAME_PROPERTY_NAME + "\"\n" +
                    "FROM\n" +
                    "  [" + DmConstants.DIVISION_CLASS_NAME + "] d\n" +
                    "  LEFT OUTER JOIN [" + DmConstants.DIVISION_CLASS_NAME + "] p ON p.[This] = d.[Parent]\n" +
                    "WHERE\n" +
                    "  d.[This] INSUBFOLDER '/Электронный документооборот'";

            if (!expressions.isEmpty()) {

                for (String expression : expressions) {

                    query = query + " AND\n  " + expression;

                }

            }

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

                    object.put("id", properties.getInteger32Value(DmConstants.DIVISION_ID_PROPERTY_NAME));

                    object.put("code", properties.getStringValue(DmConstants.DIVISION_CODE_PROPERTY_NAME));

                    object.put("name", properties.getStringValue(DmConstants.DIVISION_NAME_PROPERTY_NAME));

                    object.put("parent", properties.getStringValue(DmConstants.DIVISION_PARENT_NAME_PROPERTY_NAME));

                    objects.put(object);

                }

            }

            result.put("data", objects);

        } catch (Exception e) {

            result.put("errorMessage", "Ошибка получения информации о структурных подразделениях");

            log(e);

        }

        log("result: " + result);

        PrintWriter out = response.getWriter();

        out.print(result);

    }

    public void doGet(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        log("-> DivisionService.doGet({callbacks : '" + callbacks + "', request: '" + request + "', response: '" + response + "'})");

        String repositoryId = request.getParameter(REPOSITORY_ID_PARAM_NAME);

        String id = request.getParameter(ID_PARAM_NAME);

        log("\t process {repositoryId: '" + repositoryId + "', id: '" + id + "'}");

        JSONObject result = new JSONObject();

        try {

            Subject subject = callbacks.getP8Subject(repositoryId);

            UserContext userContext = UserContext.get();

            userContext.pushSubject(subject);

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            SearchSQL searchSQL = new SearchSQL();

            String query = "SELECT\n" +
                    "  d.[" + DmConstants.DIVISION_ID_PROPERTY_NAME + "],\n" +
                    "  d.[" + DmConstants.DIVISION_CODE_PROPERTY_NAME + "],\n" +
                    "  d.[" + DmConstants.DIVISION_NAME_PROPERTY_NAME + "],\n" +
                    "  p.[" + DmConstants.DIVISION_NAME_PROPERTY_NAME + "] AS \"" + DmConstants.DIVISION_PARENT_NAME_PROPERTY_NAME + "\"\n" +
                    "FROM\n" +
                    "  [" + DmConstants.DIVISION_CLASS_NAME + "] d\n" +
                    "  LEFT OUTER JOIN [" + DmConstants.DIVISION_CLASS_NAME + "] p ON p.[This] = d.[Parent]\n" +
                    "WHERE\n" +
                    "  d.[This] INSUBFOLDER '/Электронный документооборот' AND \n" +
                    "  d.[" + DmConstants.DIVISION_ID_PROPERTY_NAME + "] = " + id;

            log("query: '" + query + "'");

            searchSQL.setQueryString(query);

            SearchScope searchScope = new SearchScope(objectStore);

            RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, false);

            if (rowSet != null) {

                Iterator it = rowSet.iterator();

                if (it.hasNext()) {

                    RepositoryRow row = (RepositoryRow) it.next();

                    Properties properties = row.getProperties();

                    result.put("id", properties.getInteger32Value(DmConstants.DIVISION_ID_PROPERTY_NAME));

                    result.put("code", properties.getStringValue(DmConstants.DIVISION_CODE_PROPERTY_NAME));

                    result.put("name", properties.getStringValue(DmConstants.DIVISION_NAME_PROPERTY_NAME));

                    result.put("parent", properties.getStringValue(DmConstants.DIVISION_PARENT_NAME_PROPERTY_NAME));

                }

            }

        } catch (Exception e) {

            result.put("errorMessage", "Ошибка получения информации о структурном подразделении");

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

