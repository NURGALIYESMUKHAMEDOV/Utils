package kz.bsbnb.ecm.extension.plugin.dfs;

import com.ibm.ecm.extension.Plugin;
import com.ibm.ecm.extension.PluginAsyncTaskType;
import com.ibm.ecm.extension.PluginService;

import java.util.Locale;

public class DFSPlugin extends Plugin {

    public static final String ID = "DFSPlugin" ;

    public static final String NAME = "ОРД" ;

    public static final String VERSION = "0.1-050" ;

    @Override
    public String getId() {

        return DFSPlugin.ID;

    }

    @Override
    public String getName(Locale locale) {

        return DFSPlugin.NAME;

    }

    @Override
    public String getVersion() {

        return DFSPlugin.VERSION;

    }

    @Override
    public String getDojoModule() {

        return "docs";

    }

    @Override
    public String getScript() {

        return "DFSPlugin.js";

    }

    @Override
    public PluginService[] getServices() {

        return new PluginService[]{new CategoryService(), new UserService(), new EmployeeService(), new DirectoryService(), new DivisionService(), new ResolutionService(), new AssignmentService(), new UploadService(), new InOutDocsService()};

    }

    @Override
    public PluginAsyncTaskType[] getAsyncTaskTypes() {
        return new PluginAsyncTaskType[] {
                new SamplePluginAsyncTaskType(),
                new SamplePluginSearchAsyncTaskType()
        };
    }

}
