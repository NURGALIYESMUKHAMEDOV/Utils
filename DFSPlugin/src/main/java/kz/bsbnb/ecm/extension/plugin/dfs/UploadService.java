package kz.bsbnb.ecm.extension.plugin.dfs;

import com.filenet.api.util.UserContext;
import com.ibm.ecm.extension.PluginService;
import com.ibm.ecm.extension.PluginServiceCallbacks;

import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;

public class UploadService extends PluginService {

    public static final String Id = "UploadService" ;


    @Override
    public String getId() {
        return UploadService.Id;
    }

    @Override
    public void execute(PluginServiceCallbacks callbacks, HttpServletRequest request, HttpServletResponse response) throws Exception {

        log("-> UploadService.execute({callbacks : '" + callbacks + "', request: '" + request + "', response: '" + response + "'})");

        Subject subject = callbacks.getP8Subject(callbacks.getRepositoryId());

        UserContext userContext = UserContext.get();

        userContext.pushSubject(subject);

        InputStream inputStream = request.getInputStream();

        byte[] buf = new byte[10240];

        int position ;

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        while ((position = inputStream.read(buf)) > 0) {

            outputStream.write(buf, 0, position);

        }

        outputStream.close();

        log(outputStream.toString());

    }

    private void log(String message) {

        System.out.println(message);

    }

    private void log(Throwable throwable) {

        throwable.printStackTrace();

    }

}
