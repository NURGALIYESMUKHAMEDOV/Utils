package com.ibm.filenet.cpe.process.test;

import java.util.Map;

import filenet.vw.api.*;

/**
 * The Class WorkflowOperations.
 */
public class WorkflowOperations {

    /** The workflow object number. */
    private String workflowObjectNumber = null;

    /** The my session. */
    private VWSession mySession = null;

    /** The roster name. */
    private String rosterName;

    /**
     * Connect.
     *
     * @param contentEngineURI
     *            the content engine uri
     * @param username
     *            the username
     * @param password
     *            the password
     * @param connectionPoint
     *            the connection point
     */
    public void connect(String contentEngineURI, String username,
                        String password, String connectionPoint) {
        this.mySession = new VWSession();
        mySession.setBootstrapCEURI(contentEngineURI);
        mySession.logon(username, password, connectionPoint);

        VWSystemConfiguration config = mySession.fetchSystemConfiguration();
        VWAttributeInfo attInfo = config.getAttributeInfo();
        String navigatorURL = (String) attInfo.getFieldValue("F_WebServer." + VWSession.WEBAPP_CONTENT_NAVIGATOR);

    }

    /**
     * Disconnect.
     */
    public void disconnect() {
        mySession.logoff();
    }

    /**
     * Terminate workflow.
     */
    public void terminateWorkflow() {
        VWWorkObject wob = this.getWorkobject();
        if (wob != null) {
            wob.doLock(true);
            wob.doTerminate();
        }
    }

    /**
     * Start workflow.
     *
     * @param workflowName
     *            the workflow name
     */
    public void startWorkflow(String workflowName) {
        this.startWorkflow(workflowName, null);
    }

    /**
     * Start workflow.
     *
     * @param workflowName
     *            the workflow name
     * @param startParams
     *            the start params
     */
    public void startWorkflow(String workflowName,
                              Map<String, Object> startParams) {
        String[] paramNames = null;
        Object[] paramValues = null;

        VWStepElement startStep = mySession.createWorkflow(workflowName);
        this.rosterName = startStep.getRosterName();

        System.out.println("rosterName : " + rosterName);

        if (startParams != null) {
            paramNames = startParams.keySet().toArray(new String[startParams.keySet().size()]);
            paramValues = startParams.values().toArray(new String[startParams.values().size()]);

            for (int i = 0; i < paramNames.length; i++) {
                startStep.setParameterValue(paramNames[i], paramValues[i], false);
            }
        }

        startStep.doDispatch();
        this.workflowObjectNumber = startStep.getWorkflowNumber();
    }

    /**
     * Process step.
     *
     * @param params
     *            the params
     */
    public void processStep(Map<String, Object> params) {
        this.processStep(params, null);
    }

    /**
     * Process step.
     *
     * @param params
     *            the params
     * @param response
     *            the response
     */
    public void processStep(Map<String, Object> params, String response) {

        VWWorkObject workObject = this.getWorkobject();
        VWStepElement step = workObject.fetchStepElement();

        // override any locks, as this is MY testcase
        step.doLock(true);

        if (params != null) {
            Object[] paramNames = params.keySet().toArray();
            Object[] paramValues = params.values().toArray();

            for (int i = 0; i < paramNames.length; i++) {
                step.setParameterValue((String) paramNames[i], paramValues[i],
                        false);
            }

        }

        if (response != null) {
            step.setSelectedResponse(response);
        }

        step.doDispatch();
    }

    /**
     * Gets the workflow object number.
     *
     * @return the workflow object number
     */
    public String getWorkflowObjectNumber() {
        return workflowObjectNumber;
    }

    /**
     * Gets the work object.
     *
     * @return the work object
     */
    public VWWorkObject getWorkObject() {
        VWWorkObject wob = this.getWorkobject();
        wob.doRefresh(false, false);
        return wob;
    }

    /**
     * Gets the workobject.
     *
     * @return the workobject
     */
    private VWWorkObject getWorkobject() {
        VWRoster myRoster = mySession.getRoster(this.rosterName);

        // Set Query Parameters
        int queryFlags = VWRoster.QUERY_NO_OPTIONS;
        String queryFilter = "F_WobNum=:A";

        // VWWorkObjectNumber class takes care of the value format used in place
        // of F_WobNum and F_WorkFlowNumber
        Object[] substitutionVars = { new VWWorkObjectNumber(
                this.workflowObjectNumber) };
        // Perform Query

        VWRosterQuery query = myRoster.createQuery(null, null, null,
                queryFlags, queryFilter, substitutionVars,
                VWFetchType.FETCH_TYPE_WORKOBJECT);
        VWWorkObject rosterItem = null;

        // Process Results
        if (query.hasNext()) {
            rosterItem = (VWWorkObject) query.next();
        }
        return rosterItem;
    }
}