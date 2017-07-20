package ru.ecm911.esbd.plugin;

import com.filenet.api.admin.Choice;
import com.filenet.api.admin.ChoiceList;
import com.filenet.api.collection.RepositoryRowSet;
import com.filenet.api.constants.ChoiceType;
import com.filenet.api.constants.FilteredPropertyType;
import com.filenet.api.constants.TypeID;
import com.filenet.api.core.Factory;
import com.filenet.api.core.ObjectStore;
import com.filenet.api.property.PropertyFilter;
import com.filenet.api.query.RepositoryRow;
import com.filenet.api.query.SearchSQL;
import com.filenet.api.query.SearchScope;
import com.filenet.api.util.Id;
import com.filenet.api.util.UserContext;
import com.ibm.ecm.extension.PluginLogger;
import com.ibm.ecm.extension.PluginResponseUtil;
import com.ibm.ecm.extension.PluginService;
import com.ibm.ecm.extension.PluginServiceCallbacks;
import com.ibm.ecm.json.JSONResponse;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Iterator;

public class DictionaryPluginService  extends PluginService {

    private static final String ID = "DictionaryPluginService" ;

    @Override
    public String getId() {

        return ID;

    }

    @Override
    public void execute(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        String methodName = "execute" ;

        PluginLogger logger = callbacks.getLogger();

        logger.logEntry(this, methodName, request);

        // наименование справочника
        String name = request.getParameter("name");

        // идентификатор объектного хранилища
        String repositoryId = request.getParameter("repositoryId");

        // ответ на запрос
        JSONResponse _response = new JSONResponse();

        Subject subject = callbacks.getP8Subject(repositoryId);

        try {

            UserContext.get().pushSubject(subject);

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            SearchSQL searchSQL = new SearchSQL();

            searchSQL.setQueryString("SELECT [Id] FROM [ChoiceList] WHERE [DisplayName] = '" + name + "'");

            SearchScope searchScope = new SearchScope(objectStore);

            RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, false);

            if (rowSet != null) {

                Iterator<RepositoryRow> it = rowSet.iterator();

                if (it.hasNext()) {

                    RepositoryRow row = it.next();

                    Id id = row.getProperties().getIdValue("Id");

                    PropertyFilter propertyFilter = new PropertyFilter();

                    propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

                    ChoiceList choiceList = Factory.ChoiceList.fetchInstance(objectStore, id, propertyFilter);

                    JSONArray _choiceList = new JSONArray();

                    _processChoiceList(_choiceList, choiceList.get_ChoiceValues());

                    _response.put("response", "success");

                    _response.put("data", _choiceList);

                } else {

                    _response.put("response", "failed");

                    _response.put("message", "Объект не найден");

                }

            } else {

                _response.put("response", "failed");

                _response.put("message", "Объект не найден");

            }

        } catch (Exception e) {

            _response.put("response", "failed");

            _response.put("message", "Ошибка на сервере: " + e.getMessage());

            logger.logError(this, methodName, request, e);

        } finally {

            UserContext.get().popSubject();

        }

        PluginResponseUtil.writeJSONResponse(request, response, _response, callbacks, ID);

    }

    private void _processChoiceList(JSONArray array, com.filenet.api.collection.ChoiceList choiceList) {

        Iterator<Choice> valuesIt = choiceList.iterator();

        while (valuesIt.hasNext()) {

            Choice choice = valuesIt.next();

            JSONObject _choice = new JSONObject();

            if (choice.get_ChoiceType().equals(ChoiceType.MIDNODE_STRING) ||
                    choice.get_ChoiceType().equals(ChoiceType.MIDNODE_INTEGER)) {

                JSONArray _subChoices = new JSONArray();

                _processChoiceList(_subChoices, choice.get_ChoiceValues());

                _choice.put("label", choice.get_DisplayName());

                _choice.put("values", _subChoices);

                array.add(_choice);

            } else {

                _choice.put("label", choice.get_DisplayName());

                if (choice.get_ChoiceType().equals(ChoiceType.STRING)) {

                    _choice.put("value", choice.get_ChoiceStringValue());

                    array.add(_choice);

                } else if (choice.get_ChoiceType().equals(ChoiceType.INTEGER)) {

                    _choice.put("value", choice.get_ChoiceIntegerValue());

                    array.add(_choice);

                }

            }

        }


    }

}
