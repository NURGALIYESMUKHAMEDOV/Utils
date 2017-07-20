package ru.ecm911.esbd.plugin.filter;

import com.ibm.ecm.extension.PluginRequestFilter;
import com.ibm.ecm.extension.PluginServiceCallbacks;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONArtifact;
import com.ibm.json.java.JSONObject;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.logging.Logger;

public class CompanyRequestFilter extends PluginRequestFilter {

    private Logger logger ;

    @Override
    public String[] getFilteredServices() {

        return new String[]{"/p8/addItem"};

    }

    @Override
    public JSONObject filter(PluginServiceCallbacks callbacks, HttpServletRequest request, JSONArtifact requestObject) throws Exception {

        getLogger().entering(getClass().getName(), "filter", new Object[]{callbacks, request, requestObject});

        HttpSession session = request.getSession();

        JSONObject selectedCompany = (JSONObject)session.getAttribute("selectedCompany");

        JSONArray objects = (JSONArray) requestObject;

        if (selectedCompany != null) {

            for (int index = 0; index < objects.size(); index++) {

                JSONObject object = (JSONObject) objects.get(index);

                if (object.containsKey("criterias")) {

                    JSONArray criterias = (JSONArray) object.get("criterias");

                    for (int j = 0; j < criterias.size(); j++) {

                        JSONObject criteria = (JSONObject) criterias.get(j);

                        String name = (String) criteria.get("name");

                        if (name.equals("ESBD_CompanyCode")) {

                            criteria.put("value", selectedCompany.get("code"));

                            break ;

                        }

                    }


                }

            }

        }

        return null ;

    }

    private Logger getLogger() {

        return logger != null ? logger : (logger = Logger.getLogger(getClass().getName()));

    }

}
