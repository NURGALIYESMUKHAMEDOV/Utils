/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package external_functions;

/**
 *
 * @author nurzhan.trimov
 */
import lotus.domino.*;
import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;

public class Domino {

    private static Logger logger = Logger.getLogger(Domino.class.getName());

    public String SendMail(String User, String Subject, String Body, String dominoServer, String dominoMailbox, String dominoUsername, String dominoPassword) {
        PropertyConfigurator.configure(Domino.class.getResource("/logs/log4j.properties"));

        logger.warn("SEND to DOMINO MAilBOX");
        logger.warn("User= " + User);
        logger.warn("Subject= " + Subject);
        logger.warn("Body= " + Body);
        logger.warn("dominoServer= " + dominoServer);
        logger.warn("dominoMailbox= " + dominoMailbox);
        logger.warn("dominoUsername= " + dominoUsername);
        logger.warn("dominoPassword= " + dominoPassword);


        try {
            Session s = lotus.domino.NotesFactory.createSession(dominoServer, dominoUsername, dominoPassword);
            DbDirectory n = s.getDbDirectory("Domino");
            Database db = n.openDatabase(dominoMailbox);
            //lotus.domino.Database dominoDb = dominoSession.getDatabase(dominoServer, dominoMailbox);
            logger.warn("Connected as: " + s.getUserName());


            Document memo = db.createDocument();
            memo.appendItemValue("Form", "Memo");
            memo.appendItemValue("Importance", "1");
            memo.appendItemValue("Subject", Subject);
            memo.appendItemValue("Body", Body);
            memo.send(false, User);


            db.recycle();
            s.recycle();
        } catch (NotesException e) {
            System.out.println("Error - " + e.id + " " + e.text);

        } catch (Exception e) {
            System.out.println("Error - " + e.toString());

        }


        logger.warn("FINISHED DOMINO MAilBOX");
        return "null";
    }
}
