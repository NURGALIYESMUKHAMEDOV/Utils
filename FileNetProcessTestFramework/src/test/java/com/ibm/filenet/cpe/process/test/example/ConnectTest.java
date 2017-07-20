package com.ibm.filenet.cpe.process.test.example;

import com.filenet.api.core.*;

import javax.security.auth.Subject;
import com.filenet.api.util.UserContext;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import javax.security.auth.Subject;

/**
 * Created by Nurgali.Yesmukhamedo on 28.06.2017.
 */
public class ConnectTest {

    @Test
    public static void getP8Connection() {
        // TODO Auto-generated method stub
        String uri = "http://10.10.32.38:9080/wsi/FNCEWS40MTOM";
        String username = "p8admin";
        String password = "f4DEsFWS";

        // Get the connection
        Connection conn = Factory.Connection.getConnection(uri);
        System.out.println("1");
        // The next 3 lines authenticate with the application server using the JAAS API
        Subject subject = UserContext.createSubject(conn, username, password, "FileNetP8WSI");
        //System.out.println("2");
        UserContext uc = UserContext.get();
        //System.out.println("3");
        uc.pushSubject(subject);
        //System.out.println("4");
        // Retrieve the specific Domain Object P8demodom
        //System.out.println("5");
        Domain domain = Factory.Domain.fetchInstance(conn, "p8dom", null);
        //System.out.println("6");
        //System.out.println("Domain Name is: " + domain.get_Name());
        //System.out.println("7");
        // Get the specific object store EVTFS
        ObjectStore os = Factory.ObjectStore.fetchInstance(domain, "TOS", null);
        //System.out.println("8");
        System.out.println("Objectstore is: " + os.get_Name());
        //return os;

    }

}
