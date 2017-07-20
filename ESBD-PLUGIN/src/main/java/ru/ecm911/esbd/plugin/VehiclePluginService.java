package ru.ecm911.esbd.plugin;

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
import java.util.ArrayList;
import java.util.List;

public class VehiclePluginService extends PluginService {

    private static String[][] DATA = new String[][]{
            new String[]{"BMW", "X1", "X3", "X4", "X5", "X5 M", "X6", "X6 M", "Z1"},
            new String[]{"Fiat", "124", "126", "127", "128", "130", "131", "238", "500"},
            new String[]{"Kia", "Avella", "Cadenza", "Capital", "Carens", "Carnival", "Cee'd", "Cerato", "Clarus", "Concord", "Elan"}
    };

    private static final String ID = "VehiclePluginService" ;

    @Override
    public String getId() {

        return ID;

    }

    @Override
    public void execute(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        String methodName = "execute" ;

        PluginLogger logger = callbacks.getLogger();

        logger.logEntry(this, methodName, request);

        String name = request.getParameter("name");

        String repositoryId = request.getParameter("repositoryId");

        Subject subject = callbacks.getP8Subject(repositoryId);

        try {

            UserContext.get().pushSubject(subject);

            JSONArray _brands = new JSONArray();

            for (int index = 0; index < DATA.length; index++) {

                JSONObject _brand = new JSONObject();

                String[] models = DATA[index];

                _brand.put("name", models[0]);

                JSONArray _models = new JSONArray();

                for (int y = 1; y < models.length; y++) {

                    JSONObject _model = new JSONObject();

                    _model.put("name", models[y]);

                    _models.add(_model);

                }

                _brand.put("models", _models);

                _brands.add(_brand);

            }

            JSONResponse _response = new JSONResponse();

            _response.put("data", _brands);

            PluginResponseUtil.writeJSONResponse(request, response, _response, callbacks, ID);

        } catch (Exception e) {

            logger.logError(this, methodName, request, e);

        } finally {

            UserContext.get().popSubject();

        }

    }

}
