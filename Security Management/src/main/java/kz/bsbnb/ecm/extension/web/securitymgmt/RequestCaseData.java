package kz.bsbnb.ecm.extension.web.securitymgmt;

/**
 * Created by Nurgali.Yesmukhamedo on 08.06.2017.
 */
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class RequestCaseData implements Serializable
{
    private List<Application> applications;
    private List<Application> selectedApplications;
    private Employee employee;

    public List<Application> getApplications()
    {
        return this.applications != null ? this.applications : (this.applications = new ArrayList());
    }

    public List<Application> getSelectedApplications()
    {
        return this.selectedApplications != null ? this.selectedApplications : (this.selectedApplications = new ArrayList());
    }

    public Employee getEmployee()
    {
        return this.employee;
    }

    public void setEmployee(Employee employee)
    {
        this.employee = employee;
    }
}
