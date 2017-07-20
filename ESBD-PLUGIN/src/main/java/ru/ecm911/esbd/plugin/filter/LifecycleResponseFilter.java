package ru.ecm911.esbd.plugin.filter;

import com.ibm.ecm.extension.PluginResponseFilter;
import com.ibm.ecm.extension.PluginServiceCallbacks;
import com.ibm.json.java.JSONObject;
import ru.ecm911.esbd.plugin.ESBDFeature;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.logging.Logger;

public class LifecycleResponseFilter extends PluginResponseFilter {

    private Logger logger ;

    @Override
    public String[] getFilteredServices() {

        return new String[]{"/p8/openContentClass"};

    }

    @Override
    public void filter(String serverType, PluginServiceCallbacks callbacks, HttpServletRequest request, JSONObject responseObject) throws Exception {

        getLogger().entering(getClass().getName(), "filter", new Object[]{serverType, callbacks, request, responseObject});

        // загружаем информацию о конфигурации

        String configurationAsString = callbacks.loadFeatureConfiguration(ESBDFeature.ID);

        getLogger().info("load feature's configuration : " + configurationAsString);

        LifecycleConfiguration configuration = new LifecycleConfiguration();

        // получаем информацию о типа объекта

        String templateName = (String)responseObject.get("template_name");

        getLogger().info("content class is " + templateName);

        // проверяем существует ли описание статусной модели для данного объекта

        if (configuration.getContentClasses().contains(templateName)) {

            // если описание существует, применяем его


        }


    }

    private Logger getLogger() {

        return logger != null ? logger : (logger = Logger.getLogger(getClass().getName()));

    }

}
