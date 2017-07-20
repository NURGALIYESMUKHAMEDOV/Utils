package ru.ecm911.esbd.plugin.service;

import com.filenet.api.collection.RepositoryRowSet;
import com.filenet.api.core.ObjectStore;
import com.filenet.api.query.RepositoryRow;
import com.filenet.api.query.SearchSQL;
import com.filenet.api.query.SearchScope;
import com.filenet.api.util.UserContext;
import com.ibm.ecm.extension.PluginService;
import com.ibm.ecm.extension.PluginServiceCallbacks;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Iterator;

public class CaseService extends PluginService {

    public static final String Id = "CaseService" ;

    @Override
    public String getId() {

        return CaseService.Id;

    }

    @Override
    public void execute(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        String methodName = "execute" ;

        callbacks.getLogger().logEntry(this, methodName, request);

        String repositoryId = request.getParameter("repositoryId");

        Subject subject = callbacks.getP8Subject(repositoryId);

        try {

            UserContext.get().pushSubject(subject);

            String action = request.getParameter("subAction");

            if ("getEntryTemplate".equals(action)) {

                getEntryTemplate(callbacks, request, response);

            } else {

                throw new Exception("not supported");

            }

        } finally {

            UserContext.get().popSubject();

        }

    }

    private void getEntryTemplate(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        String methodName = "getEntryTemplate" ;

        callbacks.getLogger().logEntry(this, methodName, request);

        JSONArray ids = new JSONArray();

        String repositoryId = callbacks.getRepositoryId();

        String contentClass = request.getParameter("contentClass");

        try {

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            String queryString = "SELECT\n" +
                    "  et.[Id] \n" +
                    "FROM\n" +
                    "  [EntryTemplate] et INNER JOIN [ClassDefinition] cd ON et.[TargetObjectClassId] = cd.[Id]\n" +
                    "WHERE \n" +
                    "  cd.[SymbolicName] = '" + contentClass + "'";

            SearchSQL searchSQL = new SearchSQL();

            searchSQL.setQueryString(queryString);

            SearchScope searchScope = new SearchScope(objectStore);

            RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, false);

            if (rowSet != null) {

                Iterator it = rowSet.iterator();

                while (it.hasNext()) {

                    RepositoryRow row = (RepositoryRow)it.next();

                    com.filenet.api.util.Id entryTemplateId = row.getProperties().getIdValue("Id");

                    ids.add("EntryTemplate," + objectStore.get_Id().toString() + "," + entryTemplateId.toString());

                }

            }

        } catch (Exception e) {

            e.printStackTrace();

            throw e ;

        }

        JSONObject result = new JSONObject();

        result.put("items", ids);

        response.setContentType("text/plain");

        response.getWriter().print(result.toString());

        response.flushBuffer();

    }

}
