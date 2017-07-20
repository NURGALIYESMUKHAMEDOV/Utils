package com.ibm.filenet.cpe.process.test.example;

import static com.ibm.filenet.cpe.process.test.WorkflowAssert.assertAtStep;
import static com.ibm.filenet.cpe.process.test.WorkflowAssert.assertInQueue;
import static com.ibm.filenet.cpe.process.test.WorkflowAssert.assertParameterIsNotReadable;
import static com.ibm.filenet.cpe.process.test.WorkflowAssert.assertParameterIsReadWriteable;
import static com.ibm.filenet.cpe.process.test.WorkflowAssert.assertParameterIsReadable;
import static com.ibm.filenet.cpe.process.test.WorkflowAssert.assertParameterValue;
import static org.testng.AssertJUnit.assertNotNull;

import java.util.HashMap;
import java.util.Map;

import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import com.ibm.filenet.cpe.process.test.WorkflowOperations;

import filenet.vw.api.VWWorkObject;

public class FrameworkTestWorkflowRoute1 {

    private WorkflowOperations ops = null;

    @BeforeClass
    public void setUp() throws Exception {
        if (this.ops == null) {
            String ceURI = "http://10.10.32.38:9080/wsi/FNCEWS40MTOM";
            String userName = "p8admin";
            String password = "f4DEsFWS";
            String connectionPoint = "TOSCP";

            this.ops = new WorkflowOperations();

            ops.connect(ceURI, userName, password, connectionPoint);
        }
    }

    @AfterClass
    public void tearDown() throws Exception {
        // Since this is a test case we want to clean up the workflow and not
        // leave a trace behind
        ops.terminateWorkflow();
        // Disconnect from the server
        ops.disconnect();
    }

    @Test(priority = 1)
    public void testStartWorkflow() {
        String workflowName = "DMS_ProcessingIncomingDocumentTask";

        //Map<String, Object> params = new HashMap<String, Object>();

        //params.put("F_CaseTask", "1");

        ops.startWorkflow(workflowName);

        VWWorkObject wob = ops.getWorkObject();
        assertNotNull(wob);
    }

    @Test(priority = 2)
    public void testVerifyAtStepEnterValues() {
        String atStepName = "Enter case value";
        VWWorkObject wob = ops.getWorkObject();

        assertAtStep(wob, atStepName);
        assertParameterIsReadWriteable(wob, "CaseValue");
        assertParameterIsReadWriteable(wob, "CaseName");
        assertParameterIsNotReadable(wob, "IsApproved");
    }

    @SuppressWarnings({ "unchecked", "rawtypes" })
    @Test(priority = 3)
    public void testCompleteFirstStepAndAtProcessingQueue() {
        VWWorkObject wob = ops.getWorkObject();

        Map paramValues = new HashMap();
        paramValues.put("CaseValue", 50);
        paramValues.put("CaseName", "myTestCase");

        ops.processStep(paramValues);

        String atStepName = "ProcessItem";
        String aQueueName = "approvalQueue";
        assertAtStep(wob, atStepName);
        assertInQueue(wob, aQueueName);

    }

    @Test(priority = 4)
    public void testVerifyAtApprovalQueue() {
        String atStepName = "ProcessItem";
        VWWorkObject wob = ops.getWorkObject();

        assertAtStep(wob, atStepName);
        assertParameterIsReadable(wob, "CaseValue");
        assertParameterIsReadable(wob, "CaseName");
        assertParameterIsReadable(wob, "IsApproved");
        assertParameterValue(wob, "IsApproved", true);
    }

    @Test(priority = 5)
    public void testCompleteProcessingQueue() {
        VWWorkObject wob = ops.getWorkObject();

        ops.processStep(null);

        wob.doRefresh(false, false);
        // Workflow should be completed by now...
        assertAtStep(wob, null);
        assertInQueue(wob, null);

    }

}