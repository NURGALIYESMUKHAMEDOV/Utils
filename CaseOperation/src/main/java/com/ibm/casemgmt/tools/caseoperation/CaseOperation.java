/*******
 * Copyright (c) 2010-2012 IBM Corporation. All rights reserved. ******
 * <p>
 * IBM Confidential
 * <p>
 * OCO Source Materials
 * <p>
 * R5725-A15
 * <p>
 * © Copyright IBM Corporation 2010-2012
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has been
 * deposited with the U.S. Copyright Office.
 *********************************************************************/
package com.ibm.casemgmt.tools.caseoperation;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.security.AccessController;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

import javax.security.auth.Subject;

import com.filenet.api.collection.ContentElementList;
import com.filenet.api.constants.AutoClassify;
import com.filenet.api.constants.AutoUniqueName;
import com.filenet.api.constants.CheckinType;
import com.filenet.api.constants.ClassNames;
import com.filenet.api.constants.DefineSecurityParentage;
import com.filenet.api.constants.RefreshMode;
import com.filenet.api.constants.TaskState;
import com.filenet.api.core.Connection;
import com.filenet.api.core.ContentTransfer;
import com.filenet.api.core.Document;
import com.filenet.api.core.Domain;
import com.filenet.api.core.ReferentialContainmentRelationship;
import com.filenet.api.core.EntireNetwork;
import com.filenet.api.core.Factory;
import com.filenet.api.core.Folder;
import com.filenet.api.core.IndependentlyPersistableObject;
import com.filenet.api.core.ObjectStore;
import com.filenet.api.core.DynamicReferentialContainmentRelationship;
import com.filenet.api.core.UpdatingBatch;
import com.filenet.api.util.Id;
import com.filenet.api.util.UserContext;
import com.ibm.casemgmt.api.Case;
import com.ibm.casemgmt.api.CaseType;
import com.ibm.casemgmt.api.constants.ModificationIntent;
import com.ibm.casemgmt.api.constants.CommentContext;
import com.ibm.casemgmt.api.context.CaseMgmtContext;
import com.ibm.casemgmt.api.context.SimpleP8ConnectionCache;
import com.ibm.casemgmt.api.context.SimpleVWSessionCache;
import com.ibm.casemgmt.api.objectref.ObjectStoreReference;
import com.ibm.casemgmt.api.tasks.Task;
import com.ibm.casemgmt.api.tasks.TaskType;
import com.ibm.casemgmt.intgimpl.CEConstants;

/**
 *  This sample code demonstrates Case Operations custom component
 *  methods that can be called from a case workflow process instance.
 *
 *  Once the component is properly installed, available methods from this
 *  sample component are:
 *
 *      1.  createCase()
 *      		Creates another case instance of the same case type (where
 *              the task that is associated with this workflow comes from).
 *
 *      2.  createCaseWithSpecifiedType()
 *      		Creates a new case instance of a different case type.
 *
 *      3.  attachExternalDocumentInCaseFolder()
 *              Attaches and files an external document in the case folder.
 *
 *      4.  createSubfolder()
 *      		Creates a sub folder under the case folder.
 *
 *      5.  createDiscretionaryTask()
 *      		Creates a new task instance of a discretionary task type.
 *
 *      6.  terminateWorkflowsInCase()
 *              Terminates all workflows (tasks) in the current case.
 *
 *      7.  unfileCaseFolderDocument()
 *              Unfiles an existing document from case folder.
 *
 *      8.  addCaseComment()
 *              Adds a new comment to this case instance.
 *
 *      9.  getStringProperty()
 *      10. setStringProperty()
 *             Retrieves or sets a string property of a case.
 *
 *      11. getIntegerProperty()
 *      12. setIntegerProperty()
 *             Retrieves or sets an integer property of a case.
 *
 *      13. getBooleanProperty()
 *      14. setBooleanProperty()
 *             Retrieves or sets a boolean property of a case.
 *
 *  Please see block comment for each method for additional details.
 *
 *  Prerequisites:
 *      Proper installation and configuration of the Case Operations
 *      custom component are required.
 *
 *  	Prior reading of readme.doc and user guide is also required.
 *
 */

public class CaseOperation {
    /**
     createCase() - creates a new instance of the same case type.

     @param caseFolderPath
     The full CE path of the current working case folder.
     F_CaseFolder.PathName must be used as parameter
     in Process Designer.

     @param TOS
     The target object store name. For example: 'TOS2'

     @param create
     A boolean property from the case type indicating if a new case
     instance needs to be created. If your case type contains such
     boolean property, then use F_CaseFolder.yourBooleanPropertyName.
     If you don't have such property, set it to true.

     @return GUID of the new case.
     */

    public String createCase(
            String caseFolderPath,
            String TOS,
            boolean create) throws Exception {
        if (create == true) {
            UserContext old = null;
            CaseMgmtContext oldCmc = null;

            try {
                Subject sub = Subject.getSubject(AccessController.getContext());
                String ceURI = null;

                ceURI = filenet.vw.server.Configuration.GetCEURI(null, null);
                Connection connection = Factory.Connection.getConnection(ceURI);

                // setting up user context
                old = UserContext.get();
                UserContext uc = new UserContext();
                uc.pushSubject(sub);
                UserContext.set(uc);

                EntireNetwork entireNetwork = Factory.EntireNetwork.fetchInstance(connection, null);

                if (entireNetwork == null) {
                    Exception e = new Exception("Cannot log in to " + ceURI);
                    logException(e);
                }

                // retrieve target object store
                Domain domain = entireNetwork.get_LocalDomain();
                ObjectStore targetOS = (ObjectStore) domain.fetchObject(
                        ClassNames.OBJECT_STORE,
                        TOS,
                        null);

                // setting up CaseMmgtContext for Case API
                SimpleVWSessionCache vwSessCache = new SimpleVWSessionCache();
                CaseMgmtContext cmc = new CaseMgmtContext(vwSessCache, new SimpleP8ConnectionCache());
                oldCmc = CaseMgmtContext.set(cmc);

                ObjectStoreReference targetOsRef = new ObjectStoreReference(targetOS);

                // retrieve case folder
                Folder caseFolder = (Folder) targetOS.fetchObject(ClassNames.FOLDER,
                        caseFolderPath,
                        null);

                // retrieve property value of 'CmAcmCaseTypeFolder'
                Folder caseTypeFolder = (Folder) caseFolder.getProperties().getObjectValue(
                        "CmAcmCaseTypeFolder");
                // retrieve case type name
                String caseTypeName = caseTypeFolder.get_FolderName();
                CaseType caseType = CaseType.fetchInstance(targetOsRef, caseTypeName);

                // create a new instance of case type
                Case pendingCase = Case.createPendingInstance(caseType);
                pendingCase.save(RefreshMode.REFRESH, null, ModificationIntent.MODIFY);
                String caseId = pendingCase.getId().toString();

                return caseId;
            } catch (Exception e) {
                logException(e);
                return null;
            } finally {
                if (oldCmc != null) {
                    CaseMgmtContext.set(oldCmc);
                }

                if (old != null) {
                    UserContext.set(old);
                }
            }
        } else {
            return null;
        }
    }

    /**
     createCaseWithSpecifiedType() - creates a new instance of a different case type.

     @param TOS
     The target object store name. For example: 'TOS2'

     @param caseTypeName
     The case type name in symbolic form.

     @return GUID of the new case.
     */

    public String createCaseWithSpecifiedType(
            String TOS,
            String caseTypeName) throws Exception {
        UserContext old = UserContext.get();
        CaseMgmtContext oldCmc = null;
        Subject sub = Subject.getSubject(AccessController.getContext());
        String ceURI = null;

        try {
            ceURI = filenet.vw.server.Configuration.GetCEURI(null, null);
            Connection connection = Factory.Connection.getConnection(ceURI);

            // setting up user context
            UserContext uc = new UserContext();
            uc.pushSubject(sub);
            UserContext.set(uc);

            EntireNetwork entireNetwork = Factory.EntireNetwork.fetchInstance(connection, null);

            if (entireNetwork == null) {
                Exception e = new Exception("Cannot log in to " + ceURI);
                logException(e);
            }

            // retrieve target object store
            Domain domain = entireNetwork.get_LocalDomain();
            ObjectStore targetOS = (ObjectStore) domain.fetchObject(
                    ClassNames.OBJECT_STORE,
                    TOS,
                    null);

            // setting up CaseMmgtContext for Case API
            SimpleVWSessionCache vwSessCache = new SimpleVWSessionCache();
            CaseMgmtContext cmc = new CaseMgmtContext(vwSessCache, new SimpleP8ConnectionCache());
            oldCmc = CaseMgmtContext.set(cmc);

            // retrieve case type info
            ObjectStoreReference targetOsRef = new ObjectStoreReference(targetOS);
            CaseType caseType = CaseType.fetchInstance(targetOsRef, caseTypeName);

            // create a new instance of case type
            Case pendingCase = Case.createPendingInstance(caseType);
            pendingCase.save(RefreshMode.REFRESH, null, ModificationIntent.MODIFY);
            String caseId = pendingCase.getId().toString();

            return caseId;
        } catch (Exception e) {
            logException(e);
            return null;
        } finally {
            if (oldCmc != null) {
                CaseMgmtContext.set(oldCmc);
            }

            if (old != null) {
                UserContext.set(old);
            }
        }
    }

    /**
     attachExternalDocumentInCaseFolder() -
     Attaches and files an external document in the case folder.

     @param caseFolderPath
     The full CE path of the current working case folder.
     F_CaseFolder.PathName must be used as parameter
     in Process Designer.

     @param TOS
     The target object store name. For example: 'TOS2'

     @param documentPath
     Full path of the external document. For example 'C:\\doc\\mydocument.doc'

     @param documentTitle
     Title of the document.
     */

    public void attachExternalDocumentInCaseFolder(
            String caseFolderPath,
            String TOS,
            String documentPath,
            String documentTitle) throws Exception {
        UserContext old = UserContext.get();
        CaseMgmtContext oldCmc = null;
        Subject sub = Subject.getSubject(AccessController.getContext());
        String ceURI = null;

        try {
            ceURI = filenet.vw.server.Configuration.GetCEURI(null, null);
            Connection connection = Factory.Connection.getConnection(ceURI);

            // setting up user context
            UserContext uc = new UserContext();
            uc.pushSubject(sub);
            UserContext.set(uc);

            EntireNetwork entireNetwork = Factory.EntireNetwork.fetchInstance(connection, null);

            if (entireNetwork == null) {
                Exception e = new Exception("Cannot log in to " + ceURI);
                logException(e);
            }

            // retrieve target object store
            Domain domain = entireNetwork.get_LocalDomain();
            ObjectStore targetOS = (ObjectStore) domain.fetchObject(
                    ClassNames.OBJECT_STORE,
                    TOS,
                    null);


            // setting up CaseMmgtContext for Case API
            SimpleVWSessionCache vwSessCache = new SimpleVWSessionCache();
            CaseMgmtContext cmc = new CaseMgmtContext(vwSessCache, new SimpleP8ConnectionCache());
            oldCmc = CaseMgmtContext.set(cmc);

            // retrieve case folder
            Folder caseFolder = (Folder) targetOS.fetchObject(ClassNames.FOLDER,
                    caseFolderPath,
                    null);

            // insert document to 'Unfiled Document' folder in TOS
            File handlerJar = new File(documentPath);
            Document doc = Factory.Document.createInstance(targetOS, "Document");
            ContentElementList cel = Factory.ContentElement.createList();
            ContentTransfer t = Factory.ContentTransfer.createInstance();
            t.set_ContentType("text/plain");
            t.set_RetrievalName("body.txt");

            FileInputStream fileIS = null;
            fileIS = new FileInputStream(handlerJar.getAbsolutePath());
            t.setCaptureSource(fileIS);

            UpdatingBatch batch = UpdatingBatch.createUpdatingBatchInstance(domain, RefreshMode.NO_REFRESH);

            cel.add(t);
            doc.set_ContentElements(cel);
            doc.getProperties().putValue("DocumentTitle", documentTitle);
            doc.checkin(AutoClassify.DO_NOT_AUTO_CLASSIFY, CheckinType.MAJOR_VERSION);
            batch.add(doc, null);

	        /* file document to case folder*/
            DynamicReferentialContainmentRelationship drcr
                    = (DynamicReferentialContainmentRelationship) caseFolder.file((IndependentlyPersistableObject) doc,
                    AutoUniqueName.AUTO_UNIQUE,
                    documentTitle,
                    DefineSecurityParentage.DO_NOT_DEFINE_SECURITY_PARENTAGE);
            batch.add(drcr, null);

            batch.updateBatch();
        } catch (Exception e) {
            logException(e);
        } finally {
            if (oldCmc != null) {
                CaseMgmtContext.set(oldCmc);
            }

            if (old != null) {
                UserContext.set(old);
            }
        }
    }

    /**
     createSubfolder() - creates a sub folder under the case folder.

     @param caseFolderPath
     The full CE path of the current working case folder.
     F_CaseFolder.PathName must be used as parameter
     in Process Designer.

     @param subfolderName
     The name of the subfolder to be created under case folder.

     @param TOS
     The target object store name. For example: 'TOS2'
     */
    public void createSubfolder(
            String caseFolderPath,
            String subfolderName,
            String TOS) throws Exception {
        UserContext old = UserContext.get();
        CaseMgmtContext oldCmc = null;
        Subject sub = Subject.getSubject(AccessController.getContext());
        String ceURI = null;

        try {
            ceURI = filenet.vw.server.Configuration.GetCEURI(null, null);
            Connection connection = Factory.Connection.getConnection(ceURI);

            // setting up user context
            UserContext uc = new UserContext();
            uc.pushSubject(sub);
            UserContext.set(uc);

            EntireNetwork entireNetwork = Factory.EntireNetwork.fetchInstance(connection, null);

            if (entireNetwork == null) {
                Exception e = new Exception("Cannot log in to " + ceURI);
                logException(e);
            }

            // retrieve target object store
            Domain domain = entireNetwork.get_LocalDomain();
            ObjectStore targetOS = (ObjectStore) domain.fetchObject(
                    ClassNames.OBJECT_STORE,
                    TOS,
                    null);

            // setting up CaseMmgtContext for Case API
            SimpleVWSessionCache vwSessCache = new SimpleVWSessionCache();
            CaseMgmtContext cmc = new CaseMgmtContext(vwSessCache, new SimpleP8ConnectionCache());
            oldCmc = CaseMgmtContext.set(cmc);

            ObjectStoreReference targetOsRef = new ObjectStoreReference(targetOS);

			/* get case folder */
            Folder folder = Factory.Folder.fetchInstance(targetOsRef.getFetchlessCEObject(),
                    caseFolderPath,
                    null);

            // create a subfolder under case folder
            Folder newSubFolder = Factory.Folder.createInstance(targetOS, "CmAcmCaseSubfolder");
            newSubFolder.set_Parent(folder);
            newSubFolder.set_FolderName(subfolderName);
            newSubFolder.getProperties().putValue("CmAcmParentCase", folder);
            newSubFolder.save(RefreshMode.REFRESH);
        } catch (Exception e) {
            logException(e);
        } finally {
            if (oldCmc != null) {
                CaseMgmtContext.set(oldCmc);
            }

            if (old != null) {
                UserContext.set(old);
            }
        }
    }

    /**
     createDiscretionaryTask() - creates a new task instance of a discretionary task type.

     @param caseFolderPath
     The full CE path of the current working case folder.
     F_CaseFolder.PathName must be used as parameter
     in Process Designer.

     @param discretionaryTaskSymbolicName
     The symbolic name of the discretionary task.

     @param TOS
     The target object store name. For example: 'TOS2'
     */
    public void createDiscretionaryTask(
            String caseFolderPath,
            String discretionaryTaskSymbolicName,
            String TOS) throws Exception {
        UserContext old = UserContext.get();
        CaseMgmtContext oldCmc = null;
        Subject sub = Subject.getSubject(AccessController.getContext());
        String ceURI = null;

        try {
            ceURI = filenet.vw.server.Configuration.GetCEURI(null, null);
            Connection connection = Factory.Connection.getConnection(ceURI);

            // setting up user context
            UserContext uc = new UserContext();
            uc.pushSubject(sub);
            UserContext.set(uc);

            EntireNetwork entireNetwork = Factory.EntireNetwork.fetchInstance(connection, null);

            if (entireNetwork == null) {
                Exception e = new Exception("Cannot log in to " + ceURI);
                logException(e);
            }

            // retrieve target object store
            Domain domain = entireNetwork.get_LocalDomain();
            ObjectStore targetOS = (ObjectStore) domain.fetchObject(
                    ClassNames.OBJECT_STORE,
                    TOS,
                    null);

            // setting up CaseMmgtContext for Case API
            SimpleVWSessionCache vwSessCache = new SimpleVWSessionCache();
            CaseMgmtContext cmc = new CaseMgmtContext(vwSessCache, new SimpleP8ConnectionCache());
            oldCmc = CaseMgmtContext.set(cmc);

            ObjectStoreReference targetOsRef = new ObjectStoreReference(targetOS);

            // retrieve case folder
            Folder folder = Factory.Folder.fetchInstance(targetOsRef.getFetchlessCEObject(),
                    caseFolderPath,
                    null);

            // retrieve case using GUID
            Id caseId = folder.get_Id();
            Case cs = Case.getFetchlessInstance(targetOsRef, caseId);

            // retrieve case type name
            CaseType caseType = cs.getCaseType();

            // create discretionary task
            Task task = Task.createPendingInstance(discretionaryTaskSymbolicName, cs);
            task.setName(discretionaryTaskSymbolicName);

            // retrieve case type info to determine if initializing launch step is required
            TaskType tt = caseType.getDiscretionaryTaskType(discretionaryTaskSymbolicName);
            if (tt.isLaunchInfoRequired() == true) {
                // launch step is required
                task.initializeNewLaunchStep();
            }

            task.save(RefreshMode.REFRESH);
        } catch (Exception e) {
            logException(e);
        } finally {
            if (oldCmc != null) {
                CaseMgmtContext.set(oldCmc);
            }

            if (old != null) {
                UserContext.set(old);
            }
        }
    }

    /**
     terminateWorkflowsInCase() - terminates all workflows (tasks) in the current case.

     @param caseFolderPath
     The full CE path of the current working case folder.
     F_CaseFolder.PathName must be used as parameter
     in Process Designer.

     @param TOS
     The target object store name. For example: 'TOS2'
     */
    public void terminateWorkflowsInCase(
            String caseFolderPath,
            String TOS) throws Exception {
        UserContext old = UserContext.get();
        CaseMgmtContext oldCmc = null;
        Subject sub = Subject.getSubject(AccessController.getContext());
        String ceURI = null;

        try {
            ceURI = filenet.vw.server.Configuration.GetCEURI(null, null);
            Connection connection = Factory.Connection.getConnection(ceURI);

            // setting up user context
            UserContext uc = new UserContext();
            uc.pushSubject(sub);
            UserContext.set(uc);

            EntireNetwork entireNetwork = Factory.EntireNetwork.fetchInstance(connection, null);

            if (entireNetwork == null) {
                Exception e = new Exception("Cannot log in to " + ceURI);
                logException(e);
            }

            // retrieve target object store
            Domain domain = entireNetwork.get_LocalDomain();
            ObjectStore targetOS = (ObjectStore) domain.fetchObject(
                    ClassNames.OBJECT_STORE,
                    TOS,
                    null);

            // setting up CaseMmgtContext for Case API
            SimpleVWSessionCache vwSessCache = new SimpleVWSessionCache();
            CaseMgmtContext cmc = new CaseMgmtContext(vwSessCache, new SimpleP8ConnectionCache());
            oldCmc = CaseMgmtContext.set(cmc);

            ObjectStoreReference targetOsRef = new ObjectStoreReference(targetOS);

            // retrieve case folder
            Folder folder = Factory.Folder.fetchInstance(targetOsRef.getFetchlessCEObject(),
                    caseFolderPath,
                    null);

            Id caseId = folder.get_Id();

            // retrieve case
            Case cs = Case.getFetchlessInstance(targetOsRef, caseId);

            // retrieve all tasks
            List<Task> taskList = cs.fetchTasks();

            Iterator iter = taskList.iterator();
            while (iter.hasNext()) {
                Task task = (Task) iter.next();
                TaskState state = task.getState();

                // terminate workflow(task) if conditions met
                if ((state != TaskState.COMPLETE) && (state != TaskState.FAILED)) {
                    task.setStopped();
                    task.save(RefreshMode.REFRESH);
                }
            }
        } catch (Exception e) {
            logException(e);
        } finally {
            if (oldCmc != null) {
                CaseMgmtContext.set(oldCmc);
            }

            if (old != null) {
                UserContext.set(old);
            }
        }
    }

    /**
     addCaseComment() - adds a new comment to this case instance

     @param caseFolderPath
     The full CE path of the current working case folder.
     F_CaseFolder.PathName must be used as parameter
     in Process Designer.

     @param TOS
     The target object store name. For example: 'TOS2'

     @param comment
     The comment to be added
     */

    public void addCaseComment(
            String caseFolderPath,
            String TOS,
            String comment) throws Exception {
        UserContext old = UserContext.get();
        CaseMgmtContext oldCmc = null;
        Subject sub = Subject.getSubject(AccessController.getContext());
        String ceURI = null;

        try {
            ceURI = filenet.vw.server.Configuration.GetCEURI(null, null);
            Connection connection = Factory.Connection.getConnection(ceURI);

            // setting up user context
            UserContext uc = new UserContext();
            uc.pushSubject(sub);
            UserContext.set(uc);

            EntireNetwork entireNetwork = Factory.EntireNetwork.fetchInstance(connection, null);

            if (entireNetwork == null) {
                Exception e = new Exception("Cannot log in to " + ceURI);
                logException(e);
            }

            // retrieve target object store
            Domain domain = entireNetwork.get_LocalDomain();
            ObjectStore targetOS = (ObjectStore) domain.fetchObject(
                    ClassNames.OBJECT_STORE,
                    TOS,
                    null);

            // setting up CaseMmgtContext for Case API
            SimpleVWSessionCache vwSessCache = new SimpleVWSessionCache();
            CaseMgmtContext cmc = new CaseMgmtContext(vwSessCache, new SimpleP8ConnectionCache());
            oldCmc = CaseMgmtContext.set(cmc);

            ObjectStoreReference targetOsRef = new ObjectStoreReference(targetOS);

            // retrieve case folder
            Folder folder = Factory.Folder.fetchInstance(targetOsRef.getFetchlessCEObject(),
                    caseFolderPath,
                    null);

            // retrieve case using GUID
            Id caseId = folder.get_Id();
            Case cs = Case.getFetchlessInstance(targetOsRef, caseId);

            cs.addCaseComment(CommentContext.CASE, comment);
            cs.save(RefreshMode.REFRESH, null, ModificationIntent.MODIFY);
        } catch (Exception e) {
            logException(e);
        } finally {
            if (oldCmc != null) {
                CaseMgmtContext.set(oldCmc);
            }

            if (old != null) {
                UserContext.set(old);
            }
        }

        return;
    }

    /**
     unfileCaseFolderDocument() - unfiles an existing document from case folder

     @param caseFolderPath
     The full CE path of the current working case folder.
     F_CaseFolder.PathName must be used as parameter
     in Process Designer.

     @param TOS
     The target object store name. For example: 'TOS2'

     @param documentTitle
     Name of the document to be unfiled.
     */
    public void unfileCaseFolderDocument(
            String caseFolderPath,
            String TOS,
            String documentTitle) throws Exception {
        UserContext old = UserContext.get();
        CaseMgmtContext oldCmc = null;
        Subject sub = Subject.getSubject(AccessController.getContext());
        String ceURI = null;

        try {
            ceURI = filenet.vw.server.Configuration.GetCEURI(null, null);
            Connection connection = Factory.Connection.getConnection(ceURI);

            // setting up user context
            UserContext uc = new UserContext();
            uc.pushSubject(sub);
            UserContext.set(uc);

            EntireNetwork entireNetwork = Factory.EntireNetwork.fetchInstance(connection, null);

            if (entireNetwork == null) {
                Exception e = new Exception("Cannot log in to " + ceURI);
                logException(e);
            }

            // retrieve target object store
            Domain domain = entireNetwork.get_LocalDomain();
            ObjectStore targetOS = (ObjectStore) domain.fetchObject(
                    ClassNames.OBJECT_STORE,
                    TOS,
                    null);

            // setting up CaseMmgtContext for Case API
            SimpleVWSessionCache vwSessCache = new SimpleVWSessionCache();
            CaseMgmtContext cmc = new CaseMgmtContext(vwSessCache, new SimpleP8ConnectionCache());
            oldCmc = CaseMgmtContext.set(cmc);

            ObjectStoreReference targetOsRef = new ObjectStoreReference(targetOS);

			/* get case folder */
            Folder folder = Factory.Folder.fetchInstance(targetOsRef.getFetchlessCEObject(),
                    caseFolderPath,
                    null);

			/* unfile document */
            String documentPath = folder.get_PathName() +
                    CEConstants.P8_PATH_SEPARATOR +
                    documentTitle;

            Document doc = Factory.Document.fetchInstance(
                    targetOsRef.getFetchlessCEObject(),
                    documentPath,
                    null);

            ReferentialContainmentRelationship rcr = folder.unfile(doc);
            rcr.save(RefreshMode.REFRESH);
        } catch (Exception e) {
            logException(e);
        } finally {
            if (oldCmc != null) {
                CaseMgmtContext.set(oldCmc);
            }

            if (old != null) {
                UserContext.set(old);
            }
        }

    }

    /**
     getStringProperty() - retrieves a string property value from case

     @param caseFolderPath
     The full CE path of the current working case folder.
     F_CaseFolder.PathName must be used as parameter
     in Process Designer.

     @param TOS
     The target object store name. For example: 'TOS2'

     @param symbolicPropertyName
     Name of the string property.
     */
    public String getStringProperty(
            String caseFolderPath,
            String TOS,
            String symbolicPropertyName) throws Exception {

        UserContext old = UserContext.get();
        CaseMgmtContext oldCmc = null;
        Subject sub = Subject.getSubject(AccessController.getContext());
        String ceURI = null;
        String retValue = null;

        try {
            ceURI = filenet.vw.server.Configuration.GetCEURI(null, null);
            Connection connection = Factory.Connection.getConnection(ceURI);

            // setting up user context
            UserContext uc = new UserContext();
            uc.pushSubject(sub);
            UserContext.set(uc);

            EntireNetwork entireNetwork = Factory.EntireNetwork.fetchInstance(connection, null);

            if (entireNetwork == null) {
                Exception e = new Exception("Cannot log in to " + ceURI);
                logException(e);
            }

            // retrieve target object store
            Domain domain = entireNetwork.get_LocalDomain();
            ObjectStore targetOS = (ObjectStore) domain.fetchObject(
                    ClassNames.OBJECT_STORE,
                    TOS,
                    null);

            // setting up CaseMmgtContext for Case API
            SimpleVWSessionCache vwSessCache = new SimpleVWSessionCache();
            CaseMgmtContext cmc = new CaseMgmtContext(vwSessCache, new SimpleP8ConnectionCache());
            oldCmc = CaseMgmtContext.set(cmc);

            ObjectStoreReference targetOsRef = new ObjectStoreReference(targetOS);

            // retrieve case folder
            Folder folder = Factory.Folder.fetchInstance(targetOsRef.getFetchlessCEObject(),
                    caseFolderPath,
                    null);

            Id caseId = folder.get_Id();

            // retrieve case
            Case cs = Case.getFetchlessInstance(targetOsRef, caseId);

            // set property value
            retValue = (String) cs.getProperties().getObjectValue(symbolicPropertyName);
            cs.save(RefreshMode.REFRESH, null, ModificationIntent.MODIFY);
        } catch (Exception e) {
            logException(e);
        } finally {
            if (oldCmc != null) {
                CaseMgmtContext.set(oldCmc);
            }

            if (old != null) {
                UserContext.set(old);
            }
        }

        return retValue;
    }

    /**
     setStringProperty() - sets the value of a string property

     @param caseFolderPath
     The full CE path of the current working case folder.
     F_CaseFolder.PathName must be used as parameter
     in Process Designer.

     @param TOS
     The target object store name. For example: 'TOS2'

     @param symbolicPropertyName
     Name of the string property.

     @param propertyValue
     String value to be set.
     */
    public void setStringProperty(
            String caseFolderPath,
            String TOS,
            String symbolicPropertyName,
            String propertyValue) throws Exception {
        UserContext old = UserContext.get();
        CaseMgmtContext oldCmc = null;
        Subject sub = Subject.getSubject(AccessController.getContext());
        String ceURI = null;

        try {
            ceURI = filenet.vw.server.Configuration.GetCEURI(null, null);
            Connection connection = Factory.Connection.getConnection(ceURI);

            // setting up user context
            UserContext uc = new UserContext();
            uc.pushSubject(sub);
            UserContext.set(uc);

            EntireNetwork entireNetwork = Factory.EntireNetwork.fetchInstance(connection, null);

            if (entireNetwork == null) {
                Exception e = new Exception("Cannot log in to " + ceURI);
                logException(e);
            }

            // retrieve target object store
            Domain domain = entireNetwork.get_LocalDomain();
            ObjectStore targetOS = (ObjectStore) domain.fetchObject(
                    ClassNames.OBJECT_STORE,
                    TOS,
                    null);

            // setting up CaseMmgtContext for Case API
            SimpleVWSessionCache vwSessCache = new SimpleVWSessionCache();
            CaseMgmtContext cmc = new CaseMgmtContext(vwSessCache, new SimpleP8ConnectionCache());
            oldCmc = CaseMgmtContext.set(cmc);

            ObjectStoreReference targetOsRef = new ObjectStoreReference(targetOS);

            // retrieve case folder
            Folder folder = Factory.Folder.fetchInstance(targetOsRef.getFetchlessCEObject(),
                    caseFolderPath,
                    null);

            Id caseId = folder.get_Id();

            // retrieve case
            Case cs = Case.getFetchlessInstance(targetOsRef, caseId);

            // set property value
            cs.getProperties().putObjectValue(symbolicPropertyName, propertyValue);
            cs.save(RefreshMode.REFRESH, null, ModificationIntent.MODIFY);
        } catch (Exception e) {
            logException(e);
        } finally {
            if (oldCmc != null) {
                CaseMgmtContext.set(oldCmc);
            }

            if (old != null) {
                UserContext.set(old);
            }
        }

    }

    /**
     getIntegerProperty() - retrieves a integer property value from case

     @param caseFolderPath
     The full CE path of the current working case folder.
     F_CaseFolder.PathName must be used as parameter
     in Process Designer.

     @param TOS
     The target object store name. For example: 'TOS2'

     @param symbolicPropertyName
     Name of the integer property.
     */
    public Integer getIntegerProperty(
            String caseFolderPath,
            String TOS,
            String symbolicPropertyName) throws Exception {

        UserContext old = UserContext.get();
        CaseMgmtContext oldCmc = null;
        Subject sub = Subject.getSubject(AccessController.getContext());
        String ceURI = null;
        Integer retValue = null;

        try {
            ceURI = filenet.vw.server.Configuration.GetCEURI(null, null);
            Connection connection = Factory.Connection.getConnection(ceURI);

            // setting up user context
            UserContext uc = new UserContext();
            uc.pushSubject(sub);
            UserContext.set(uc);

            EntireNetwork entireNetwork = Factory.EntireNetwork.fetchInstance(connection, null);

            if (entireNetwork == null) {
                Exception e = new Exception("Cannot log in to " + ceURI);
                logException(e);
            }

            // retrieve target object store
            Domain domain = entireNetwork.get_LocalDomain();
            ObjectStore targetOS = (ObjectStore) domain.fetchObject(
                    ClassNames.OBJECT_STORE,
                    TOS,
                    null);

            // setting up CaseMmgtContext for Case API
            SimpleVWSessionCache vwSessCache = new SimpleVWSessionCache();
            CaseMgmtContext cmc = new CaseMgmtContext(vwSessCache, new SimpleP8ConnectionCache());
            oldCmc = CaseMgmtContext.set(cmc);

            ObjectStoreReference targetOsRef = new ObjectStoreReference(targetOS);

            // retrieve case folder
            Folder folder = Factory.Folder.fetchInstance(targetOsRef.getFetchlessCEObject(),
                    caseFolderPath,
                    null);

            Id caseId = folder.get_Id();

            // retrieve case
            Case cs = Case.getFetchlessInstance(targetOsRef, caseId);

            // set property value
            retValue = (Integer) cs.getProperties().getObjectValue(symbolicPropertyName);
            cs.save(RefreshMode.REFRESH, null, ModificationIntent.MODIFY);
        } catch (Exception e) {
            logException(e);
        } finally {
            if (oldCmc != null) {
                CaseMgmtContext.set(oldCmc);
            }

            if (old != null) {
                UserContext.set(old);
            }
        }

        return retValue;
    }

    /**
     setIntegerProperty() - sets the value of an integer property

     @param caseFolderPath
     The full CE path of the current working case folder.
     F_CaseFolder.PathName must be used as parameter
     in Process Designer.

     @param TOS
     The target object store name. For example: 'TOS2'

     @param symbolicPropertyName
     Name of the integer property.

     @param propertyValue
     Integer value to be set.
     */
    public void setIntegerProperty(
            String caseFolderPath,
            String TOS,
            String symbolicPropertyName,
            Integer propertyValue) throws Exception {
        UserContext old = UserContext.get();
        CaseMgmtContext oldCmc = null;
        Subject sub = Subject.getSubject(AccessController.getContext());
        String ceURI = null;

        try {
            ceURI = filenet.vw.server.Configuration.GetCEURI(null, null);
            Connection connection = Factory.Connection.getConnection(ceURI);

            // setting up user context
            UserContext uc = new UserContext();
            uc.pushSubject(sub);
            UserContext.set(uc);

            EntireNetwork entireNetwork = Factory.EntireNetwork.fetchInstance(connection, null);

            if (entireNetwork == null) {
                Exception e = new Exception("Cannot log in to " + ceURI);
                logException(e);
            }

            // retrieve target object store
            Domain domain = entireNetwork.get_LocalDomain();
            ObjectStore targetOS = (ObjectStore) domain.fetchObject(
                    ClassNames.OBJECT_STORE,
                    TOS,
                    null);

            // setting up CaseMmgtContext for Case API
            SimpleVWSessionCache vwSessCache = new SimpleVWSessionCache();
            CaseMgmtContext cmc = new CaseMgmtContext(vwSessCache, new SimpleP8ConnectionCache());
            oldCmc = CaseMgmtContext.set(cmc);

            ObjectStoreReference targetOsRef = new ObjectStoreReference(targetOS);

            // retrieve case folder
            Folder folder = Factory.Folder.fetchInstance(targetOsRef.getFetchlessCEObject(),
                    caseFolderPath,
                    null);

            Id caseId = folder.get_Id();

            // retrieve case
            Case cs = Case.getFetchlessInstance(targetOsRef, caseId);

            // set property value
            cs.getProperties().putObjectValue(symbolicPropertyName, propertyValue);
            cs.save(RefreshMode.REFRESH, null, ModificationIntent.MODIFY);
        } catch (Exception e) {
            logException(e);
        } finally {
            if (oldCmc != null) {
                CaseMgmtContext.set(oldCmc);
            }

            if (old != null) {
                UserContext.set(old);
            }
        }

    }

    /**
     getBooleanProperty() - retrieves a boolean property value from case

     @param caseFolderPath
     The full CE path of the current working case folder.
     F_CaseFolder.PathName must be used as parameter
     in Process Designer.

     @param TOS
     The target object store name. For example: 'TOS2'

     @param symbolicPropertyName
     Name of the boolean property.
     */
    public Boolean getBooleanProperty(
            String caseFolderPath,
            String TOS,
            String symbolicPropertyName) throws Exception {

        UserContext old = UserContext.get();
        CaseMgmtContext oldCmc = null;
        Subject sub = Subject.getSubject(AccessController.getContext());
        String ceURI = null;
        Boolean retValue = null;

        try {
            ceURI = filenet.vw.server.Configuration.GetCEURI(null, null);
            Connection connection = Factory.Connection.getConnection(ceURI);

            // setting up user context
            UserContext uc = new UserContext();
            uc.pushSubject(sub);
            UserContext.set(uc);

            EntireNetwork entireNetwork = Factory.EntireNetwork.fetchInstance(connection, null);

            if (entireNetwork == null) {
                Exception e = new Exception("Cannot log in to " + ceURI);
                logException(e);
            }

            // retrieve target object store
            Domain domain = entireNetwork.get_LocalDomain();
            ObjectStore targetOS = (ObjectStore) domain.fetchObject(
                    ClassNames.OBJECT_STORE,
                    TOS,
                    null);

            // setting up CaseMmgtContext for Case API
            SimpleVWSessionCache vwSessCache = new SimpleVWSessionCache();
            CaseMgmtContext cmc = new CaseMgmtContext(vwSessCache, new SimpleP8ConnectionCache());
            oldCmc = CaseMgmtContext.set(cmc);

            ObjectStoreReference targetOsRef = new ObjectStoreReference(targetOS);

            // retrieve case folder
            Folder folder = Factory.Folder.fetchInstance(targetOsRef.getFetchlessCEObject(),
                    caseFolderPath,
                    null);

            Id caseId = folder.get_Id();

            // retrieve case
            Case cs = Case.getFetchlessInstance(targetOsRef, caseId);

            // set property value
            retValue = (Boolean) cs.getProperties().getObjectValue(symbolicPropertyName);
            cs.save(RefreshMode.REFRESH, null, ModificationIntent.MODIFY);
        } catch (Exception e) {
            logException(e);
        } finally {
            if (oldCmc != null) {
                CaseMgmtContext.set(oldCmc);
            }

            if (old != null) {
                UserContext.set(old);
            }
        }

        return retValue;
    }

    /**
     setBooleanProperty() - sets the value of a boolean property

     @param caseFolderPath
     The full CE path of the current working case folder.
     F_CaseFolder.PathName must be used as parameter
     in Process Designer.

     @param TOS
     The target object store name. For example: 'TOS2'

     @param symbolicPropertyName
     Name of the boolean property.

     @param propertyValue
     Boolean value to be set.
     */
    public void setBooleanProperty(
            String caseFolderPath,
            String TOS,
            String symbolicPropertyName,
            Boolean propertyValue) throws Exception {
        UserContext old = UserContext.get();
        CaseMgmtContext oldCmc = null;
        Subject sub = Subject.getSubject(AccessController.getContext());
        String ceURI = null;

        try {
            ceURI = filenet.vw.server.Configuration.GetCEURI(null, null);
            Connection connection = Factory.Connection.getConnection(ceURI);

            // setting up user context
            UserContext uc = new UserContext();
            uc.pushSubject(sub);
            UserContext.set(uc);

            EntireNetwork entireNetwork = Factory.EntireNetwork.fetchInstance(connection, null);

            if (entireNetwork == null) {
                Exception e = new Exception("Cannot log in to " + ceURI);
                logException(e);
            }

            // retrieve target object store
            Domain domain = entireNetwork.get_LocalDomain();
            ObjectStore targetOS = (ObjectStore) domain.fetchObject(
                    ClassNames.OBJECT_STORE,
                    TOS,
                    null);

            // setting up CaseMmgtContext for Case API
            SimpleVWSessionCache vwSessCache = new SimpleVWSessionCache();
            CaseMgmtContext cmc = new CaseMgmtContext(vwSessCache, new SimpleP8ConnectionCache());
            oldCmc = CaseMgmtContext.set(cmc);

            ObjectStoreReference targetOsRef = new ObjectStoreReference(targetOS);

            // retrieve case folder
            Folder folder = Factory.Folder.fetchInstance(targetOsRef.getFetchlessCEObject(),
                    caseFolderPath,
                    null);

            Id caseId = folder.get_Id();

            // retrieve case
            Case cs = Case.getFetchlessInstance(targetOsRef, caseId);

            // set property value
            cs.getProperties().putObjectValue(symbolicPropertyName, propertyValue);
            cs.save(RefreshMode.REFRESH, null, ModificationIntent.MODIFY);
        } catch (Exception e) {
            logException(e);
        } finally {
            if (oldCmc != null) {
                CaseMgmtContext.set(oldCmc);
            }

            if (old != null) {
                UserContext.set(old);
            }
        }

    }

    /**
     All exceptions logs to a local file. This is handy for debugging.

     @param e
     The exception caught
     */

    private void logException(Exception e)
            throws Exception {

        FileWriter write = null;
        DateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
        Date date = new Date();

        try {
            write = new FileWriter("c:\\temp\\CaseOperationException.log", true);
            PrintWriter print_line = new PrintWriter(write);
            print_line.printf(dateFormat.format(date) + "\n");
            e.printStackTrace(print_line);
            print_line.close();
        } catch (IOException exc) {
        }

        throw e;
    }
}

