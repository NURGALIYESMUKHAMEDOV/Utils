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


public class InOutDocsService extends PluginService {
    public static final String Id = "InOutDocsService";
    private static final String REPOSITORY_ID = "repositoryId";
    private static final String REPOSITORY_TYPE = "repositoryType";
    private static final String P8_REPOSITORY_TYPE = "p8";
    private static final String LIST_OP = "list";
    private static final String OP_PARAM = "op";
    private static final String GET_OP = "get";
    private static final String ID = "id";
    private static final String CODE = "code";
    private static final String NAME = "name";
    String ISO_FORMAT = "dd.MM.yyyy";

    SimpleDateFormat sdf = new SimpleDateFormat(this.ISO_FORMAT);

    public String getId() {
        return "InOutDocsService";
    }

    public void execute(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {
        log("-> InOutDocs.execute({callbacks : '" + callbacks + "', request: '" + request + "', response: '" + response + "'})");

        JSONObject result = new JSONObject();

        String repositoryType = request.getParameter("repositoryType");

        String op = request.getParameter("op");

        if ("p8".equalsIgnoreCase(repositoryType)) {
            if ("list".equals(op)) {
                doList(callbacks, request, response);

                return;
            }
            if ("get".equals(op)) {
                doGet(callbacks, request, response);

                return;
            }


            result.put("errorMessage", "Unsupported operation '" + op + "'");

        } else {

            result.put("errorMessage", "Unsupported type of repository '" + repositoryType + "'");
        }


        PrintWriter out = response.getWriter();

        out.print(result);
    }

    protected void doList(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response)
            throws Exception {
        log("-> InOutDocs.doList({callbacks : '" + callbacks + "', request: '" + request + "', response: '" + response + "'})");

        String repositoryId = request.getParameter("repositoryId");

        String code = request.getParameter("code");

        String name = request.getParameter("name");

        String CaseTitle = null;

        String CreatorName = null;

        Date RegistrationDate = null;

        String DivisionName = null;

        String EmployeeName = null;

        JSONObject result = new JSONObject();

        log("\t process {repositoryId: '" + repositoryId + "', code: '" + code + "', name: '" + name + "'}");

        Subject subject = callbacks.getP8Subject(repositoryId);

        UserContext userContext = UserContext.get();

        userContext.pushSubject(subject);

        ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

        SearchSQL searchSQL = new SearchSQL();

        String query = "SELECT \n  c.[FolderName], \n  c.[LastModifier], \n  c.[DateLastModified], \n  c.[CmAcmCaseTypeFolder], \n  c.[CmAcmCaseState], \n  c.[CmAcmCaseIdentifier] AS \"CmAcmCaseIdentifier\", \n  c.[DateCreated], \n  c.[Creator], \n  c.[Id], \n  c.[ClassDescription], \n  c.[DMS_CaseTitle], \n  c.[DMS_RegistrationDate], \n  c.[DMS_Status], \n  c.[DMS_CreatorName], \n  c.[DMS_DivisionName], \n  c.[DMS_EmployeeName] \nFROM \n  [DMS_InboxDocument] c \nWHERE \n  c.[DMS_Status] IS NOT NULL \nORDER BY \n  c.[DMS_CaseTitle]";

        log("query: '" + query + "'");

        searchSQL.setQueryString(query);

        SearchScope searchScope = new SearchScope(objectStore);

        RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, Boolean.valueOf(false));

        JSONArray objects = new JSONArray();

        if (rowSet != null) {
            Iterator it = rowSet.iterator();

            while (it.hasNext()) {
                RepositoryRow row = (RepositoryRow) it.next();

                Id id = row.getProperties().getIdValue("Id");


                CaseTitle = row.getProperties().getStringValue("DMS_CaseTitle");

                CreatorName = row.getProperties().getStringValue("DMS_CreatorName");

                RegistrationDate = row.getProperties().getDateTimeValue("DMS_RegistrationDate");

                DivisionName = row.getProperties().getStringValue("DMS_DivisionName");

                EmployeeName = row.getProperties().getStringValue("DMS_EmployeeName");


                JSONObject object = new JSONObject();

                object.put("id", id.toString());


                object.put("CaseTitle", CaseTitle);

                object.put("CreatorName", CreatorName);

                object.put("RegistrationDate", this.sdf.format(RegistrationDate));

                object.put("DivisionName", DivisionName);

                object.put("EmployeeName", EmployeeName);


                objects.put(object);
            }
        }


        result.put("data", objects);

        PrintWriter out = response.getWriter();

        out.print(result);
    }

    protected void doGet(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response)
            throws Exception {
        log("-> DirectoryService.doGet({callbacks : '" + callbacks + "', request: '" + request + "', response: '" + response + "'})");

        String repositoryId = request.getParameter("repositoryId");

        String id = request.getParameter("id");

        JSONObject result = new JSONObject();

        log("\t process {repositoryId: '" + repositoryId + "', id: '" + id + "'}");

        Subject subject = callbacks.getP8Subject(repositoryId);

        UserContext userContext = UserContext.get();

        userContext.pushSubject(subject);

        ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

        try {
            PropertyFilter propertyFilter = new PropertyFilter();

            propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

            Folder inoudocsyEntry = Factory.Folder.fetchInstance(objectStore, new Id(id), propertyFilter);

            result.put("id", inoudocsyEntry.get_Id().toString());

            result.put("CaseTitle", inoudocsyEntry.getProperties().getStringValue("DMS_CaseTitle"));

            result.put("CreatorName", inoudocsyEntry.getProperties().getStringValue("DMS_CreatorName"));

            result.put("RegistrationDate", this.sdf.format(inoudocsyEntry.getProperties().getDateTimeValue("DMS_RegistrationDate")));

            result.put("DivisionName", inoudocsyEntry.getProperties().getStringValue("DMS_DivisionName"));

            result.put("EmployeeName", inoudocsyEntry.getProperties().getStringValue("DMS_EmployeeName"));

        } catch (Exception e) {
            log(e);

            result.put("errorMessage", "Входящий документ не найден");
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
