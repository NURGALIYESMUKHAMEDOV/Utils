package kz.bsbnb.ecm.extension.plugin.dfs;

import com.filenet.api.collection.RepositoryRowSet;
import com.filenet.api.core.*;
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
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class EmployeeService extends PluginService {

    public static final String Id = "EmployeeService" ;

    private static final String REPOSITORY_ID_PARAM_NAME = "repositoryId" ;

    private static final String REPOSITORY_TYPE_PARAM_NAME = "repositoryType" ;

    private static final String OPERATION_PARAM_NAME = "op" ;

    private static final String LIST_OPERATION = "list" ;

    private static final String GET_OPERATION = "get" ;

    private static final String GET_BY_USERNAME_OPERATION = "getByUsername" ;

    private static final String ID_PARAM_NAME = "id" ;

    private static final String USERNAME_PARAM_NAME = "username" ;

    private static final String CODE_PARAM_NAME = "code" ;

    private static final String NAME_PARAM_NAME = "name" ;

    private static final String POSITION_PARAM_NAME = "position" ;

    private static final String DIVISION_ID_PARAM_NAME = "divisionId" ;

    private static final String DIVISION_PARAM_NAME = "division" ;

    @Override
    public String getId() {
        return EmployeeService.Id;
    }

    @Override
    public void execute(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        log("-> EmployeeService.execute({callbacks : '" + callbacks + "', request: '" + request + "', response: '" + response + "'})");

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

            } else if (GET_BY_USERNAME_OPERATION.equalsIgnoreCase(op)) {

                doGetByUsername(callbacks, request, response);

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

        log("-> EmployeeService.doList({callbacks : '" + callbacks + "', request: '" + request + "', response: '" + response + "'})");

        String repositoryId = request.getParameter(REPOSITORY_ID_PARAM_NAME);

        String code = request.getParameter(CODE_PARAM_NAME);

        String name = request.getParameter(NAME_PARAM_NAME);

        String position = request.getParameter(POSITION_PARAM_NAME);

        String divisionId = request.getParameter(DIVISION_ID_PARAM_NAME);

        String division = request.getParameter(DIVISION_PARAM_NAME);

        log("\t process {repositoryId: '" + repositoryId + "', code: '" + code + "', name: '" + name + "', position: '" + position + "', divisionId: '" + divisionId + "', division: '" + division + "'}");

        JSONObject result = new JSONObject();

        try {

            Subject subject = callbacks.getP8Subject(repositoryId);

            log("\t subject is " + subject);

            UserContext userContext = UserContext.get();

            userContext.pushSubject(subject);

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            SearchSQL searchSQL = new SearchSQL();

            List<String> expressions = new ArrayList<String>();

            if (code != null && !code.isEmpty()) {

                expressions.add("e.[" + DmConstants.EMPLOYEE_CODE_PROPERTY_NAME + "] LIKE '%" + code + "%'");

            }

            if (name != null && !name.isEmpty()) {

                expressions.add("e.[" + DmConstants.EMPLOYEE_NAME_PROPERTY_NAME + "] LIKE '%" + name + "%'");

            }

            if (position != null && !position.isEmpty()) {

                expressions.add("p.[" + DmConstants.POSITION_NAME_PROPERTY_NAME + "] LIKE '%" + position + "%'");

            }

            if (divisionId != null && !divisionId.isEmpty()) {

                expressions.add("d.[" + DmConstants.DIVISION_ID_PROPERTY_NAME + "] = " + divisionId + "");

            }

            if (division != null && !division.isEmpty()) {

                expressions.add("d.[" + DmConstants.DIVISION_NAME_PROPERTY_NAME + "] LIKE '%" + division + "%'");

            }

            String query = "SELECT \n" +
                    "  e.[" + DmConstants.EMPLOYEE_ID_PROPERTY_NAME + "],\n" +
                    "  e.[" + DmConstants.EMPLOYEE_CODE_PROPERTY_NAME + "], \n" +
                    "  e.[" + DmConstants.EMPLOYEE_NAME_PROPERTY_NAME + "], \n" +
                    "  p.[" + DmConstants.POSITION_NAME_PROPERTY_NAME + "], \n" +
                    "  d.[" + DmConstants.DIVISION_NAME_PROPERTY_NAME + "] \n" +
                    "FROM \n" +
                    "  (([" + DmConstants.EMPLOYEE_CLASS_NAME + "] e \n" +
                    "    INNER JOIN [" + DmConstants.REFERENTIAL_CONTAINMENT_RELATIONSHIP_CLASS_NAME + "] er ON er.[Head] = e.[This]) \n" +
                    "      INNER JOIN [" + DmConstants.POSITION_CLASS_NAME + "] p ON p.[This] = er.[Tail])\n" +
                    "        INNER JOIN [" + DmConstants.DIVISION_CLASS_NAME + "] d ON d.[This] = p.[Parent]\n";

            if (!expressions.isEmpty()) {

                query = query + "WHERE \n";

                for (int index = 0; index < expressions.size(); index++) {

                    query = query + (index != 0 ? " AND\n  " : "  ") + expressions.get(index);

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

                    object.put("id", properties.getInteger32Value(DmConstants.EMPLOYEE_ID_PROPERTY_NAME));

                    object.put("code", properties.getStringValue(DmConstants.EMPLOYEE_CODE_PROPERTY_NAME));

                    object.put("name", properties.getStringValue(DmConstants.EMPLOYEE_NAME_PROPERTY_NAME));

                    object.put("position", properties.getStringValue(DmConstants.POSITION_NAME_PROPERTY_NAME));

                    object.put("division", properties.getStringValue(DmConstants.DIVISION_NAME_PROPERTY_NAME));

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

    public void doGet(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        log("-> EmployeeService.doGet({callbacks : '" + callbacks + "', request: '" + request + "', response: '" + response + "'})");

        String repositoryId = request.getParameter(REPOSITORY_ID_PARAM_NAME);

        String id = request.getParameter(ID_PARAM_NAME);

        log("\t process {repositoryId: '" + repositoryId + "', id: '" + id + "'}");

        JSONObject result = new JSONObject();

        try {

            Subject subject = callbacks.getP8Subject(repositoryId);

            log("\t subject is " + subject);

            UserContext userContext = UserContext.get();

            userContext.pushSubject(subject);

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            String query = "SELECT \n" +
                    "  e.[" + DmConstants.EMPLOYEE_ID_PROPERTY_NAME + "],\n" +
                    "  e.[" + DmConstants.EMPLOYEE_CODE_PROPERTY_NAME + "], \n" +
                    "  e.[" + DmConstants.EMPLOYEE_NAME_PROPERTY_NAME + "], \n" +
                    "  p.[" + DmConstants.POSITION_NAME_PROPERTY_NAME + "], \n" +
                    "  d.[" + DmConstants.DIVISION_NAME_PROPERTY_NAME + "] \n" +
                    "FROM \n" +
                    "  (([" + DmConstants.EMPLOYEE_CLASS_NAME + "] e \n" +
                    "    INNER JOIN [" + DmConstants.REFERENTIAL_CONTAINMENT_RELATIONSHIP_CLASS_NAME + "] er ON er.[Head] = e.[This]) \n" +
                    "      INNER JOIN [" + DmConstants.POSITION_CLASS_NAME + "] p ON p.[This] = er.[Tail])\n" +
                    "        INNER JOIN [" + DmConstants.DIVISION_CLASS_NAME + "] d ON d.[This] = p.[Parent]\n" +
                    "WHERE \n" +
                    "  e.[" + DmConstants.EMPLOYEE_ID_PROPERTY_NAME + "] = " + id + "";

            log("query: '" + query + "'");

            SearchSQL searchSQL = new SearchSQL();

            searchSQL.setQueryString(query);

            SearchScope searchScope = new SearchScope(objectStore);

            RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, false);

            if (rowSet != null) {

                Iterator it = rowSet.iterator();

                if(it.hasNext()) {

                    RepositoryRow row = (RepositoryRow)it.next();

                    Properties properties = row.getProperties();

                    result.put("id", properties.getInteger32Value(DmConstants.EMPLOYEE_ID_PROPERTY_NAME));

                    result.put("code", properties.getStringValue(DmConstants.EMPLOYEE_CODE_PROPERTY_NAME));

                    result.put("name", properties.getStringValue(DmConstants.EMPLOYEE_NAME_PROPERTY_NAME));

                    result.put("position", properties.getStringValue(DmConstants.POSITION_NAME_PROPERTY_NAME));

                    result.put("division", properties.getStringValue(DmConstants.DIVISION_NAME_PROPERTY_NAME));

                }

            }

        } catch (Exception e) {

            log(e);

            result.put("errorMessage", "Сотрудник не найден");

        }

        PrintWriter out = response.getWriter();

        out.print(result);

    }

    public void doGetByUsername(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        log("-> EmployeeService.doGetByUsername({callbacks : '" + callbacks + "', request: '" + request + "', response: '" + response + "'})");

        String repositoryId = request.getParameter(REPOSITORY_ID_PARAM_NAME);

        String username = request.getParameter(USERNAME_PARAM_NAME);

        log("\t process {repositoryId: '" + repositoryId + "', username: '" + username + "'}");

        JSONObject result = new JSONObject();

        try {

            Subject subject = callbacks.getP8Subject(repositoryId);

            UserContext userContext = UserContext.get();

            userContext.pushSubject(subject);

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            String query = "SELECT \n" +
                    "  e.[" + DmConstants.EMPLOYEE_ID_PROPERTY_NAME + "],\n" +
                    "  e.[" + DmConstants.EMPLOYEE_CODE_PROPERTY_NAME + "], \n" +
                    "  e.[" + DmConstants.EMPLOYEE_NAME_PROPERTY_NAME + "], \n" +
                    "  p.[" + DmConstants.POSITION_NAME_PROPERTY_NAME + "], \n" +
                    "  d.[" + DmConstants.DIVISION_NAME_PROPERTY_NAME + "] \n" +
                    "FROM \n" +
                    "  (([" + DmConstants.EMPLOYEE_CLASS_NAME + "] e \n" +
                    "    INNER JOIN [" + DmConstants.REFERENTIAL_CONTAINMENT_RELATIONSHIP_CLASS_NAME + "] er ON er.[Head] = e.[This]) \n" +
                    "      INNER JOIN [" + DmConstants.POSITION_CLASS_NAME + "] p ON p.[This] = er.[Tail])\n" +
                    "        INNER JOIN [" + DmConstants.DIVISION_CLASS_NAME + "] d ON d.[This] = p.[Parent]\n" +
                    "WHERE \n" +
                    "  e.[" + DmConstants.EMPLOYEE_USERNAME_PROPERTY_NAME + "] = '" + username + "'";

            log("query: '" + query + "'");

            SearchSQL searchSQL = new SearchSQL();

            searchSQL.setQueryString(query);

            SearchScope searchScope = new SearchScope(objectStore);

            RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, false);

            if (rowSet != null) {

                Iterator it = rowSet.iterator();

                if(it.hasNext()) {

                    RepositoryRow row = (RepositoryRow)it.next();

                    Properties properties = row.getProperties();

                    result.put("id", properties.getInteger32Value(DmConstants.EMPLOYEE_ID_PROPERTY_NAME));

                    result.put("code", properties.getStringValue(DmConstants.EMPLOYEE_CODE_PROPERTY_NAME));

                    result.put("name", properties.getStringValue(DmConstants.EMPLOYEE_NAME_PROPERTY_NAME));

                    result.put("position", properties.getStringValue(DmConstants.POSITION_NAME_PROPERTY_NAME));

                    result.put("division", properties.getStringValue(DmConstants.DIVISION_NAME_PROPERTY_NAME));

                }

            }

        } catch (Exception e) {

            log(e);

            result.put("errorMessage", "Сотрудник не найден");

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
