package ru.ecm911.esbd.plugin.filter;

import com.ibm.json.java.JSONArray;

import java.util.ArrayList;
import java.util.List;

public class LifecycleConfiguration {

    private List<String> contentClasses;

    public LifecycleConfiguration() {

        contentClasses = new ArrayList<String>();

        contentClasses.add("ESBD_InsuranceContract");

    }

    public List<String> getContentClasses() {

        return contentClasses ;

    }

}
