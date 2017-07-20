package kz.bsbnb.ecm.extension.web.securitymgmt;

/**
 * Created by Nurgali.Yesmukhamedo on 08.06.2017.
 */
import java.io.Serializable;

public class Application
        implements Serializable
{
    private String code;
    private String name;
    private String securityManager;
    private String securityAdministrator;

    public Application() {}

    public Application(String code, String name)
    {
        this.code = code;
        this.name = name;
    }

    public String getCode()
    {
        return this.code;
    }

    public void setCode(String code)
    {
        this.code = code;
    }

    public String getName()
    {
        return this.name;
    }

    public void setName(String name)
    {
        this.name = name;
    }

    public String getSecurityManager()
    {
        return this.securityManager;
    }

    public void setSecurityManager(String securityManager)
    {
        this.securityManager = securityManager;
    }

    public String getSecurityAdministrator()
    {
        return this.securityAdministrator;
    }

    public void setSecurityAdministrator(String securityAdministrator)
    {
        this.securityAdministrator = securityAdministrator;
    }
}
