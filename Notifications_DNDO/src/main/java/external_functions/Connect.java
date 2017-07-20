/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package external_functions;

import lotus.domino.*;
 

/**
 *
 * @author invent
 */
public class Connect {

    public static void main(String[] args) throws NotesException {
        Session s = NotesFactory.createSession("170.7.7.102:63148", "CN=test3 kab501-3/O=NBK", "test3");
        System.out.println("ttt");
        Name serverName = s.createName(s.getServerName());
        System.out.println("Connected to server " + serverName.getAbbreviated() + " as ");

        //   System.out.println("User Name = " + s.getCommonUserName());
//        Database database = s.getDatabase(s.getServerName(), "mail\tkab501-3.nsf");
//        String a = database.getTitle();
//        System.out.println(a);
    }

}
