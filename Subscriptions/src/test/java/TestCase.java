import com.filenet.api.constants.RefreshMode;
import com.filenet.api.core.Connection;
import com.filenet.api.util.UserContext;
import com.ibm.casemgmt.api.Case;
import com.ibm.casemgmt.api.CaseType;
import com.ibm.casemgmt.api.constants.ModificationIntent;
import com.ibm.casemgmt.api.context.CaseMgmtContext;
import com.ibm.casemgmt.api.context.P8ConnectionCache;
import com.ibm.casemgmt.api.context.SimpleP8ConnectionCache;
import com.ibm.casemgmt.api.context.SimpleVWSessionCache;
import com.filenet.api.core.*;
import com.ibm.casemgmt.api.objectref.ObjectStoreReference;
import org.junit.Test;

import javax.security.auth.Subject;
import java.util.Locale;

/**
 * Created by Nurgali.Yesmukhamedo on 13.07.2017.
 */
public class TestCase {


    @Test
    public void connect(){

        String CE_URI = "http://10.10.32.38:9080/wsi/FNCEWS40MTOM";
        String USER_NAME = "p8admin";
        String PASSWORD = "f4DEsFWS";

        P8ConnectionCache connCache = new SimpleP8ConnectionCache();
        Connection conn = connCache.getP8Connection(CE_URI);
        Subject subject = UserContext.createSubject(conn, USER_NAME, PASSWORD, "FileNetP8WSI");

        UserContext uc = UserContext.get();
        uc.pushSubject(subject);

        Locale origLocale = uc.getLocale();
        uc.setLocale(new Locale("en"));

        Domain domain = Factory.Domain.fetchInstance(conn, "p8dom", null);
        ObjectStore os = Factory.ObjectStore.fetchInstance(domain, "TOS", null);
        System.out.println("Objectstore is: " + os.get_Name());

        CaseMgmtContext origCmctx = CaseMgmtContext.set(new CaseMgmtContext(new SimpleVWSessionCache(), connCache));

        try {

            CaseType myCaseType = CaseType.fetchInstance(new ObjectStoreReference(os), "PPG_AssignmentCase");



            Case newPendingCase = Case.createPendingInstance(myCaseType);

            newPendingCase.getProperties().putObjectValue("PPG_UnitMeasurement", "Штука");
            newPendingCase.getProperties().putObjectValue("PPG_AssignmentText", "Тестовый текст");
            newPendingCase.getProperties().putObjectValue("PPG_CustomerName", "АО \"Банковское сервисное бюро НБК\"");

            // Save it now to get access to the Case ID
            newPendingCase.save(RefreshMode.REFRESH, null, ModificationIntent.MODIFY);
            String newCaseIdentifier = newPendingCase.getIdentifier();

            System.out.println("newCaseIdentifier---> " + newCaseIdentifier);

            // Fetch a fresh copy of the case instance (not sure if this is necessary)
            newPendingCase = Case.fetchInstanceFromIdentifier(new ObjectStoreReference(os), newCaseIdentifier);

            newPendingCase.save(RefreshMode.REFRESH, null, ModificationIntent.MODIFY);

        }
        finally {
            CaseMgmtContext.set(origCmctx);
            uc.setLocale(origLocale);
            uc.popSubject();
        }

    }

}
