package kz.bsbnb.ecm.extension.plugin.dfs;

import com.filenet.api.collection.RepositoryRowSet;
import com.filenet.api.constants.FilteredPropertyType;
import com.filenet.api.core.Factory;
import com.filenet.api.core.Folder;
import com.filenet.api.core.ObjectStore;
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

public class DirectoryService extends PluginService {

    public static final String Id = "DirectoryService" ;

    private static final String REPOSITORY_ID = "repositoryId" ;

    private static final String REPOSITORY_TYPE = "repositoryType" ;

    private static final String P8_REPOSITORY_TYPE = "p8" ;

    private static final String LIST_OP = "list" ;

    private static final String OP_PARAM = "op" ;

    private static final String GET_OP = "get" ;

    private static final String ID = "id" ;

    private static final String CODE = "code" ;

    private static final String NAME = "name" ;

    @Override
    public String getId() {
        return DirectoryService.Id;
    }

    @Override
    public void execute(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        log("-> DirectoryService.execute({callbacks : '" + callbacks + "', request: '" + request + "', response: '" + response + "'})");

        JSONObject result = new JSONObject();

        String repositoryType = request.getParameter(REPOSITORY_TYPE);

        String op = request.getParameter(OP_PARAM);

        if (P8_REPOSITORY_TYPE.equalsIgnoreCase(repositoryType)) {

            if (LIST_OP.equals(op)) {

                doList(callbacks, request, response);

                return;

            } else if (GET_OP.equals(op)) {

                doGet(callbacks, request, response);

                return;

            } else {

                result.put("errorMessage", "Unsupported operation '" + op + "'");

            }

        } else {

            result.put("errorMessage", "Unsupported type of repository '" + repositoryType + "'");

        }

        PrintWriter out = response.getWriter();

        out.print(result);

    }

    protected void doList(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        log("-> DirectoryService.doList({callbacks : '" + callbacks + "', request: '" + request + "', response: '" + response + "'})");

        String repositoryId = request.getParameter(REPOSITORY_ID);

        String code = request.getParameter(CODE);

        String name = request.getParameter(NAME);

        JSONObject result = new JSONObject();

        log("\t process {repositoryId: '" + repositoryId + "', code: '" + code + "', name: '" + name + "'}");

        Subject subject = callbacks.getP8Subject(repositoryId);

        UserContext userContext = UserContext.get();

        userContext.pushSubject(subject);

        ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

        SearchSQL searchSQL = new SearchSQL();

        String query = "SELECT \n" +
                "  [Id], \n" +
                "  [FolderName], \n" +
                "  [DmFolderCode], \n" +
                "  [DmRetentionPeriod], \n" +
                "  [DmRetentionClause] \n" +
                "FROM \n" +
                "  [DmFolder] \n" +
                "WHERE \n" +
                "  [This] INSUBFOLDER '/Электронный документооборот/Номенклатура дел/2017'";

        List<String> expressions = new ArrayList<String>();

        if (code != null && !code.isEmpty()) {

            expressions.add("[DmFolderCode] LIKE '%" + code + "%'");

        }

        if (name != null && !name.isEmpty()) {

            expressions.add("[FolderName] LIKE '%" + name + "%'");

        }

        if (!expressions.isEmpty()) {

            for (String expression : expressions) {

                query = query + " AND\n  " + expression ;

            }

        }

        query = query + "\nORDER BY \n  [DmFolderCode]";

        log("query: '" + query + "'");

        searchSQL.setQueryString(query);

        SearchScope searchScope = new SearchScope(objectStore);

        RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, false);

        JSONArray objects = new JSONArray();

        if (rowSet != null) {

            Iterator it = rowSet.iterator();

            while(it.hasNext()) {

                RepositoryRow row = (RepositoryRow)it.next();

                com.filenet.api.util.Id id = row.getProperties().getIdValue("Id");

                code = row.getProperties().getStringValue("DmFolderCode");

                name = row.getProperties().getStringValue("FolderName");

                String retentionPeriod = row.getProperties().getStringValue("DmRetentionPeriod");

                String retentionClause = row.getProperties().getStringValue("DmRetentionClause");

                JSONObject object = new JSONObject();

                object.put("id", id.toString());

                object.put("code", code);

                object.put("name", name);

                object.put("retentionPeriod", retentionPeriod);

                object.put("retentionClause", retentionClause);

                objects.put(object);

            }

        }

        result.put("data", objects);

        PrintWriter out = response.getWriter();

        out.print(result);

    }

    protected void doGet(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        log("-> DirectoryService.doGet({callbacks : '" + callbacks + "', request: '" + request + "', response: '" + response + "'})");

        String repositoryId = request.getParameter(REPOSITORY_ID);

        String id = request.getParameter(ID);

        JSONObject result = new JSONObject();

        log("\t process {repositoryId: '" + repositoryId + "', id: '" + id + "'}");

        Subject subject = callbacks.getP8Subject(repositoryId);

        UserContext userContext = UserContext.get();

        userContext.pushSubject(subject);

        ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

        try {

            PropertyFilter propertyFilter = new PropertyFilter();

            propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

            Folder directoryEntry = Factory.Folder.fetchInstance(objectStore, new com.filenet.api.util.Id(id), propertyFilter);

            result.put("id", directoryEntry.get_Id().toString());

            result.put("code", directoryEntry.getProperties().getStringValue("DmFolderCode"));

            result.put("name", directoryEntry.getProperties().getStringValue("FolderName"));

            result.put("retentionPeriod", directoryEntry.getProperties().getStringValue("DmRetentionPeriod"));

            result.put("retentionClause", directoryEntry.getProperties().getStringValue("DmRetentionClause"));


        } catch (Exception e) {

            log(e);

            result.put("errorMessage", "Индекс дела не найден");

        }

        PrintWriter out = response.getWriter();

        out.print(result);

    }

    private void log(String message) {

        System.out.println(message);

    }

    private void log(Throwable t) {

        t.printStackTrace();

    }

}
