package com.ibm.filenet.cpe.process.test;

import org.testng.asserts.Assertion;

import filenet.vw.api.VWModeType;
import filenet.vw.api.VWParameter;
import filenet.vw.api.VWStepElement;
import filenet.vw.api.VWWorkObject;

/**
 * The Class WorkflowAssert.
 */
public class WorkflowAssert extends Assertion {

    /**
     * Assert at step.
     *
     * @param wob
     *            the wob
     * @param atStepName
     *            the at step name
     * @return true, if successful
     */
    public static boolean assertAtStep(VWWorkObject wob, String atStepName) {
        boolean isAtStep = false;
        String foundStepName = wob.getAuthoredStepName();
        if (atStepName == null) {
            if (foundStepName == null) {
                isAtStep = true;
            }
        } else {
            if (atStepName.equals(foundStepName)) {
                isAtStep = true;
            }
        }
        return isAtStep;
    }

    /**
     * Assert not at step.
     *
     * @param wob
     *            the wob
     * @param atStepName
     *            the at step name
     * @return true, if successful
     */
    public static boolean assertNotAtStep(VWWorkObject wob, String atStepName) {
        return !assertAtStep(wob, atStepName);
    }

    /**
     * Assert in queue.
     *
     * @param wob
     *            the wob
     * @param atQueueName
     *            the at queue name
     * @return true, if successful
     */
    public static boolean assertInQueue(VWWorkObject wob, String atQueueName) {
        boolean isInQueue = false;
        String foundQueueName = wob.getCurrentQueueName();

        if (atQueueName == null) {
            if (foundQueueName == null) {
                isInQueue = true;
            }
        } else {

            if (atQueueName.equalsIgnoreCase(foundQueueName)) {
                isInQueue = true;
            }
        }
        return isInQueue;
    }

    /**
     * Assert not in queue.
     *
     * @param atQueueName
     *            the at queue name
     * @return true, if successful
     */
    public static boolean assertNotInQueue(String atQueueName) {
        return !assertNotInQueue(atQueueName);
    }

    /**
     * Assert parameter value.
     *
     * @param wob
     *            the wob
     * @param paramName
     *            the param name
     * @param paramValue
     *            the param value
     * @return true, if successful
     */
    public static boolean assertParameterValue(VWWorkObject wob,
                                               String paramName, String paramValue) {
        boolean equalValue = false;

        VWStepElement currentStep = wob.fetchStepElement();

        try {
            VWParameter field = currentStep.getParameter(paramName);
            if (field.getStringValue().equals(paramValue)) {
                equalValue = true;
            }
        } catch (Exception e) {
            // Param does not exist
            equalValue = false;
        }

        return equalValue;
    }

    /**
     * Assert parameter value.
     *
     * @param wob
     *            the wob
     * @param paramName
     *            the param name
     * @param paramValue
     *            the param value
     * @return true, if successful
     */
    public static boolean assertParameterValue(VWWorkObject wob,
                                               String paramName, int paramValue) {
        boolean equalValue = false;

        VWStepElement currentStep = wob.fetchStepElement();

        try {
            VWParameter field = currentStep.getParameter(paramName);
            if (((Integer) field.getValue()).intValue() == paramValue) {
                equalValue = true;
            }
        } catch (Exception e) {
            // Param does not exist
            equalValue = false;
        }

        return equalValue;

    }

    /**
     * Assert parameter value.
     *
     * @param wob
     *            the wob
     * @param paramName
     *            the param name
     * @param paramValue
     *            the param value
     * @return true, if successful
     */
    public static boolean assertParameterValue(VWWorkObject wob,
                                               String paramName, boolean paramValue) {
        boolean equalValue = false;

        VWStepElement currentStep = wob.fetchStepElement();

        try {
            VWParameter field = currentStep.getParameter(paramName);
            if (((Boolean) field.getValue()) == paramValue) {
                equalValue = true;
            }
        } catch (Exception e) {
            // Param does not exist
            equalValue = false;
        }

        return equalValue;

    }

    /**
     * Assert parameter is not readable.
     *
     * @param wob
     *            the wob
     * @param paramName
     *            the param name
     * @return true, if successful
     */
    public static boolean assertParameterIsNotReadable(VWWorkObject wob,
                                                       String paramName) {
        return !assertParameterIsReadable(wob, paramName);
    }

    /**
     * Assert parameter is readable.
     *
     * @param wob
     *            the wob
     * @param paramName
     *            the param name
     * @return true, if successful
     */
    public static boolean assertParameterIsReadable(VWWorkObject wob,
                                                    String paramName) {
        boolean readableValue = false;
        VWStepElement currentStep = wob.fetchStepElement();

        try {
            VWParameter field = currentStep.getParameter(paramName);
            if (field.getMode() == VWModeType.MODE_TYPE_IN) {
                readableValue = true;
            }
        } catch (Exception e) {
            // Param does not exist
            readableValue = false;
        }

        return readableValue;
    }

    /**
     * Assert parameter is read writeable.
     *
     * @param wob
     *            the wob
     * @param paramName
     *            the param name
     * @return true, if successful
     */
    public static boolean assertParameterIsReadWriteable(VWWorkObject wob,
                                                         String paramName) {
        boolean writeableValue = false;

        VWStepElement currentStep = wob.fetchStepElement();

        try {
            VWParameter field = currentStep.getParameter(paramName);
            if (field.getMode() == VWModeType.MODE_TYPE_IN_OUT
                    || field.getMode() == VWModeType.MODE_TYPE_OUT) {
                writeableValue = true;
            }
        } catch (Exception e) {
            // Param does not exist
            writeableValue = false;
        }

        return writeableValue;

    }
}