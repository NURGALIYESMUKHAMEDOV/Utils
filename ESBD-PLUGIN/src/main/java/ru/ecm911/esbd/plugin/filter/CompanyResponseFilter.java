package ru.ecm911.esbd.plugin.filter;

import com.ibm.ecm.extension.PluginResponseFilter;
import com.ibm.ecm.extension.PluginServiceCallbacks;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.logging.Logger;

public class CompanyResponseFilter extends PluginResponseFilter {

    private static String COMPANY_CODE = "ESBD_CompanyCode" ;

    private Logger logger ;

    @Override
    public String[] getFilteredServices() {

        return new String[]{"/p8/openContentClass", "/p8/openSearchTemplate"};

    }

    @Override
    public void filter(String serverType, PluginServiceCallbacks callbacks, HttpServletRequest request, JSONObject responseObject) throws Exception {

        HttpSession session = request.getSession();

        JSONObject selectedCompany = (JSONObject)session.getAttribute("selectedCompany");

        getLogger().info("company is '" + (selectedCompany != null ? selectedCompany.get("code") : "none") + "'");

        if (selectedCompany == null) {

            return ;

        }

        if (serverType.equals("/p8/openContentClass")) {

            processOpenContentClass(callbacks, request, responseObject);

        } else if (serverType.equals("/p8/openSearchTemplate")) {

            processOpenSearchTemplate(callbacks, request, responseObject);

        }

    }

    private void processOpenContentClass(PluginServiceCallbacks callbacks, HttpServletRequest request, JSONObject responseObject) {

        HttpSession session = request.getSession();

        JSONObject selectedCompany = (JSONObject)session.getAttribute("selectedCompany");

        JSONArray _properties = (JSONArray) responseObject.get("criterias");

        for (int index = 0; index < _properties.size(); index++) {

            JSONObject _property = (JSONObject) _properties.get(index);

            if (_property.get("name").equals(COMPANY_CODE)) {

                _property.put("value", selectedCompany.get("code"));

                _property.put("updatedValue", true);

            }

        }

    }

    private void processOpenSearchTemplate(PluginServiceCallbacks callbacks, HttpServletRequest request, JSONObject responseObject) {

        HttpSession session = request.getSession();

        JSONObject selectedCompany = (JSONObject)session.getAttribute("selectedCompany");

        JSONArray _properties = (JSONArray) responseObject.get("criterias");

        for (int index = 0; index < _properties.size(); index++) {

            JSONObject _property = (JSONObject) _properties.get(index);

            if (_property.get("name").equals(COMPANY_CODE)) {

                JSONArray _values = new JSONArray();

                _values.add(selectedCompany.get("code"));

                _property.put("values", _values);

                _property.put("updatedValues", true);

            }

        }

    }

    private Logger getLogger() {

        return logger != null ? logger : ( logger = Logger.getLogger(getClass().getName()) );

    }

}
