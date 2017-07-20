package ru.ecm911.esbd.plugin.filter;

import com.filenet.api.admin.Choice;
import com.filenet.api.admin.ChoiceList;
import com.filenet.api.constants.ChoiceType;
import com.filenet.api.constants.FilteredPropertyType;
import com.filenet.api.core.Factory;
import com.filenet.api.core.ObjectStore;
import com.filenet.api.property.PropertyFilter;
import com.filenet.api.util.Id;
import com.filenet.api.util.UserContext;
import com.ibm.ecm.extension.PluginResponseFilter;
import com.ibm.ecm.extension.PluginServiceCallbacks;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;
import java.util.Iterator;

public class VehicleResponseFilter extends PluginResponseFilter {

    private static String VEHICLE_CLASS_NAME = "ESBD_Vehicle" ;

    private static String VEHICLE_BRAND = "ESBD_VehicleBrand" ;

    private static String VEHICLE_MODEL = "ESBD_VehicleModel" ;

    private static String VEHICLE_MODEL_CHOICE_LIST = "{90529150-0000-C411-9AC1-F670916D4C59}" ;

    private static String VEHICLE_REGISTRATION_REGION = "ESBD_VehicleRegistrationRegion" ;

    private static String VEHICLE_REGISTRATION_CITY = "ESBD_VehicleRegistrationCity" ;

    private static String VEHICLE_REGISTRATION_CITY_CHOICE_LIST = "{40A8A750-0000-C916-9D7A-EEB8952D345A}" ;

    @Override
    public String[] getFilteredServices() {

        return new String[]{"/p8/openContentClass", "/p8/getDependentAttributeInfo", "/p8/openItem"};

    }

    @Override
    public void filter(String serverType, PluginServiceCallbacks callbacks, HttpServletRequest request, JSONObject responseObject) throws Exception {

        String templateName = request.getParameter("template_name");

        if (templateName != null && templateName.equals(VEHICLE_CLASS_NAME)) {

            if (serverType.equals("/p8/openContentClass")) {

                processOpenContentClass(callbacks, request, responseObject);

            } else if (serverType.equals("/p8/getDependentAttributeInfo")) {

                processGetDependentAttributeInfo(callbacks, request, responseObject);

            } else if (serverType.equals("/p8/openItem")) {

                processOpenItem(callbacks, request, responseObject);

            }

        }

    }

    private void processOpenContentClass(PluginServiceCallbacks callbacks, HttpServletRequest request, JSONObject responseObject) throws Exception {

        // System.out.println("[VehicleResponseFilter] processOpenContentClass, responseObject [in]: " + responseObject.toString());

        JSONArray _properties = (JSONArray) responseObject.get("criterias");

        for (int index = 0; index < _properties.size(); index++) {

            JSONObject _property = (JSONObject) _properties.get(index);

            boolean updatedProperty = false ;

            if (_property.get("name").equals(VEHICLE_BRAND)) {

                _property.put("hasDependentAttributes", true);

                _property.put("updatedHasDependentAttributes", true);

                updatedProperty = true ;

            } else if (_property.get("name").equals(VEHICLE_REGISTRATION_REGION)) {

                _property.put("hasDependentAttributes", true);

                _property.put("updatedHasDependentAttributes", true);

                updatedProperty = true ;

            }

            if (updatedProperty) {

                _property.put("updated", true);

            }

        }

        // System.out.println("[VehicleResponseFilter] processOpenContentClass, responseObject [out]: " + responseObject.toString());

    }

    private void processGetDependentAttributeInfo(PluginServiceCallbacks callbacks, HttpServletRequest request, JSONObject responseObject) throws Exception {

        // System.out.println("[VehicleResponseFilter] processGetDependentAttributeInfo, responseObject [in]: " + responseObject.toString());

        String repositoryId = request.getParameter("repositoryId");

        Subject subject = callbacks.getP8Subject(repositoryId);

        try {

            UserContext.get().pushSubject(subject);

            ObjectStore objectStore = callbacks.getP8ObjectStore(repositoryId);

            JSONArray _properties = (JSONArray) responseObject.get("criterias");

            String currentVehicleBrand = null;

            String currentVehicleRegistrationRegion = null;

            for (int index = 0; index < _properties.size(); index++) {

                JSONObject _property = (JSONObject) _properties.get(index);

                if (_property.get("name").equals(VEHICLE_BRAND)) {

                    currentVehicleBrand = (String) _property.get("value");

                } else if (_property.get("name").equals(VEHICLE_REGISTRATION_REGION)) {

                    currentVehicleRegistrationRegion = (String) _property.get("value");

                }

            }

            for (int index = 0; index < _properties.size(); index++) {

                JSONObject _property = (JSONObject) _properties.get(index);

                boolean updatedProperty = false;

                if (_property.get("name").equals(VEHICLE_MODEL)) {

                    _property.put("dependentOn", VEHICLE_BRAND);

                    _property.put("updatedDependentOn", true);

                    _property.put("dependentValue", currentVehicleBrand);

                    _property.put("updatedDependentValue", true);

                    JSONObject _choiceList = (JSONObject) _property.get("choiceList");

                    JSONArray _choices = retrieveVehicleModels(objectStore, currentVehicleBrand);

                    _choiceList.put("choices", _choices);

                    _property.put("updatedChoiceList", true);

                    updatedProperty = true ;

                } else if (_property.get("name").equals(VEHICLE_REGISTRATION_CITY)) {

                    _property.put("dependentOn", VEHICLE_REGISTRATION_REGION);

                    _property.put("updatedDependentOn", true);

                    _property.put("dependentValue", currentVehicleBrand);

                    _property.put("updatedDependentValue", true);

                    JSONObject _choiceList = (JSONObject) _property.get("choiceList");

                    JSONArray _choices = retrieveVehicleRegistrationCities(objectStore, currentVehicleRegistrationRegion);

                    _choiceList.put("choices", _choices);

                    _property.put("updatedChoiceList", true);

                    updatedProperty = true ;

                }

                if (updatedProperty) {

                    _property.put("updated", true);

                }

            }

        } finally {

            UserContext.get().popSubject();

        }

        // System.out.println("[VehicleResponseFilter] processGetDependentAttributeInfo, responseObject [in]: " + responseObject.toString());

    }

    private void processOpenItem(PluginServiceCallbacks callbacks, HttpServletRequest request, JSONObject responseObject) throws Exception {

        // System.out.println("[VehicleResponseFilter] processOpenItem, responseObject [in]: " + responseObject.toString());

    }

    private JSONArray createChoices(com.filenet.api.collection.ChoiceList choiceList) {

        JSONArray _choices = new JSONArray();

        if (choiceList != null) {

            Iterator it = choiceList.iterator();

            while (it.hasNext()) {

                Choice choice = (Choice)it.next();

                JSONObject _choice = new JSONObject();

                _choice.put("displayName", choice.get_DisplayName());

                if (choice.get_ChoiceType().equals(ChoiceType.INTEGER)) {

                    _choice.put("value", choice.get_ChoiceIntegerValue());

                } else if (choice.get_ChoiceType().equals(ChoiceType.STRING)) {

                    _choice.put("value", choice.get_ChoiceStringValue());

                } else {

                    continue ;

                }

                _choices.add(_choice);

            }

        }

        return _choices ;

    }

    private JSONArray retrieveVehicleModels(ObjectStore objectStore, String vehicleBrand) {

        // получить идентификатор списка значений

        JSONArray _choices = new JSONArray();

        PropertyFilter propertyFilter = new PropertyFilter();

        propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

        ChoiceList choiceList = Factory.ChoiceList.fetchInstance(objectStore, new Id(VEHICLE_MODEL_CHOICE_LIST), propertyFilter);

        com.filenet.api.collection.ChoiceList choices = choiceList.get_ChoiceValues();

        if (choices != null) {

            Iterator it = choices.iterator();

            while (it.hasNext()) {

                Choice choice = (Choice) it.next();

                if (choice.get_Name().equals(vehicleBrand)) {

                    _choices = createChoices(choice.get_ChoiceValues());

                    break;

                }

            }

        }

        return _choices ;

    }

    private JSONArray retrieveVehicleRegistrationCities(ObjectStore objectStore, String vehicleRegistrationRegion) {

        // получить идентификатор списка значений

        JSONArray _choices = new JSONArray();

        PropertyFilter propertyFilter = new PropertyFilter();

        propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

        ChoiceList choiceList = Factory.ChoiceList.fetchInstance(objectStore, new Id(VEHICLE_REGISTRATION_CITY_CHOICE_LIST), propertyFilter);

        com.filenet.api.collection.ChoiceList choices = choiceList.get_ChoiceValues();

        if (choices != null) {

            Iterator it = choices.iterator();

            while (it.hasNext()) {

                Choice choice = (Choice) it.next();

                if (choice.get_Name().equals(vehicleRegistrationRegion)) {

                    _choices = createChoices(choice.get_ChoiceValues());

                    break;

                }

            }

        }

        return _choices ;

    }

}
