package ru.ecm911.esbd.plugin.filter;

import com.ibm.ecm.extension.PluginLogger;
import com.ibm.ecm.extension.PluginResponseFilter;
import com.ibm.ecm.extension.PluginServiceCallbacks;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import ru.ecm911.esbd.plugin.ESBDPlugin;

import javax.servlet.http.HttpServletRequest;

public class ExtendCaseResponseFilter extends PluginResponseFilter {

    @Override
    public String[] getFilteredServices() {

        return new String[]{"/p8/openContentClass"};

    }

    @Override
    public void filter(String serverType, PluginServiceCallbacks callbacks, HttpServletRequest request, JSONObject responseObject) throws Exception {

        // PluginLogger logger = new PluginLogger(ESBDPlugin.ID);

        // logger.logEntry(this, "filter", request);

        // logger.logInfo(this, "filter", responseObject.toString());

        System.out.println("filter, response: " + responseObject.toString());

        String templateName = (String)responseObject.get("template_name");

        if (templateName.equalsIgnoreCase("ESBD_InsuranceCase")) {

            System.out.println("process insurance contract");

            JSONArray criterias = (JSONArray)responseObject.get("criterias");

            JSONObject newProperty = new JSONObject();

            newProperty.put("readOnly", false);

            newProperty.put("searchable", true);

            newProperty.put("dataType", "xs:string");

            newProperty.put("defaultOperator", "EQUAL");

            JSONArray availableOperators = new JSONArray();

            availableOperators.add("NULL");

            availableOperators.add("NOTNULL");

            availableOperators.add("EQUAL");

            availableOperators.add("NOTEQUAL");

            newProperty.put("availableOperators", availableOperators);

            newProperty.put("orderable", false);

            newProperty.put("hidden", false);

            newProperty.put("name", "ESBD_ExternalBlaBla");

            newProperty.put("maxValue", null);

            newProperty.put("cardinality", "SINGLE");

            newProperty.put("maxEntry", null);

            newProperty.put("system", false);

            newProperty.put("value", "nonnonvale");

            newProperty.put("uniqueValues", false);

            newProperty.put("label", "Ext внеш");

            newProperty.put("ascending", false);

            newProperty.put("settability", "readWrite");

            newProperty.put("requiredClass", "");

            newProperty.put("description", "");

            newProperty.put("fixedValue", false);

            newProperty.put("validValues", new JSONArray());

            newProperty.put("required", false);

            newProperty.put("minValue", null);

            // newProperty.put("propertyEditor", "esbd/cases/DriversEditor");

            criterias.add(newProperty);

        }

    }



}
