package ru.ecm911.esbd.plugin.filter;

import com.ibm.ecm.extension.PluginRequestFilter;
import com.ibm.ecm.extension.PluginServiceCallbacks;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONArtifact;
import com.ibm.json.java.JSONObject;

import javax.servlet.http.HttpServletRequest;
import java.text.SimpleDateFormat;
import java.util.Date;

public class AddContractRequestFilter extends PluginRequestFilter {

    private static final String INSURANCE_CONTRACT_CLASS = "ESBD_InsuranceContract" ;

    private static final String BRANCH_PROPERTY = "ESBD_Branch" ;

    private static final String SUBMIT_DATE_PROPERTY = "ESBD_SubmitDate" ;

    @Override
    public String[] getFilteredServices() {

        return new String[]{"/p8/addItem"};

    }

    @Override
    public JSONObject filter(PluginServiceCallbacks callbacks, HttpServletRequest request, JSONArtifact object) throws Exception {

        String template = request.getParameter("template_name");

        if (template != null && template.equals(INSURANCE_CONTRACT_CLASS)) {

            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

            System.out.println("[AddContractRequestFilter], object: " + object.toString());

            JSONArray items = (JSONArray) object;

            for (int itemIndex = 0; itemIndex < items.size(); itemIndex++) {

                // для каждого элемента

                JSONObject item = (JSONObject)items.get(itemIndex);

                // собираем информацию о полях, значение которых требуется
                // для вычисления информации

                Long branch = null ;

                Date submitDate = null ;

                JSONArray properties = (JSONArray)item.get("criterias");

                for (int propertyIndex = 0; propertyIndex < properties.size(); propertyIndex++) {

                    JSONObject property = (JSONObject)properties.get(propertyIndex);

                    String propertyName = (String)property.get("name");

                    if (propertyName.equals(BRANCH_PROPERTY)) {

                        branch = (Long)property.get("value");

                    } else if (propertyName.equals(SUBMIT_DATE_PROPERTY)) {

                        String value = (String)property.get("value");

                        if (value != null && value.contains("T")) {

                            submitDate = dateFormat.parse(value.split("T")[0]);

                        }

                    }

                }

                // вычисляем номер

            }

        }

        return null;

    }

}
