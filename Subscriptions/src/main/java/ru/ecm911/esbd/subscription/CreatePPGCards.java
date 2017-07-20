package ru.ecm911.esbd.subscription;

import com.filenet.api.action.Create;
import com.filenet.api.action.Delete;
import com.filenet.api.action.PendingAction;
import com.filenet.api.collection.ContentElementList;
import com.filenet.api.collection.RepositoryRowSet;
import com.filenet.api.constants.*;
import com.filenet.api.core.*;
import com.filenet.api.engine.ChangePreprocessor;
import com.filenet.api.exception.EngineRuntimeException;

import java.io.*;
import java.util.Date;
import java.util.logging.Logger;

import java.util.Iterator;

import com.filenet.api.property.FilterElement;
import com.filenet.api.property.PropertyFilter;
import com.filenet.api.query.RepositoryRow;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.filenet.api.collection.DocumentSet;
import com.filenet.api.query.SearchSQL;
import com.filenet.api.query.SearchScope;
import com.filenet.api.util.Id;

/**
 * Created by Nurgali.Yesmukhamedo on 12.07.2017.
 */
public class CreatePPGCards implements ChangePreprocessor {

    private Logger logger;

    private Logger getLogger() {

        return logger != null ? logger : (logger = Logger.getLogger(getClass().getName()));

    }

    @Override
    public boolean preprocessObjectChange(IndependentlyPersistableObject object) throws EngineRuntimeException {

        getLogger().entering(getClass().getName(), "preprocessObjectChange", object);

        boolean isCreate = false;
        boolean isDelete = false;

        PendingAction actions[] = object.getPendingActions();

        for (int index = 0; index < actions.length; index++) {

            if (actions[index] instanceof Create) {

                isCreate = true;

                break;

            }

        }

        for (int index = 0; index < actions.length; index++) {

            if (actions[index] instanceof Delete) {

                isDelete = true;

                break;

            }

        }

        if (isCreate) {

            System.out.println("-------->CreatePPGCards->Create");

            ObjectStore os = ((RepositoryObject) object).getObjectStore();

            PropertyFilter propertyFilter = new PropertyFilter();

            propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);
            propertyFilter.addIncludeProperty(new FilterElement(null, null, null, PropertyNames.CONTENT_SIZE, null));
            propertyFilter.addIncludeProperty(new FilterElement(null, null, null, PropertyNames.CONTENT_ELEMENTS, null));

            //object.refresh(propertyFilter);

            String documentId = object.getProperties().getStringValue("DMS_Document");

            Document document = Factory.Document.fetchInstance(os, documentId, propertyFilter);

            System.out.println("No. of document content elements: " + document.get_ContentElements().size() + "\n" +
                    "Total size of content: " + document.get_ContentSize() + "\n");

            ContentElementList docContentList = document.get_ContentElements();
            Iterator iter = docContentList.iterator();
            while (iter.hasNext()) {
                ContentTransfer ct = (ContentTransfer) iter.next();

                System.out.println("\nElement Sequence number: " + ct.get_ElementSequenceNumber().intValue() + "\n" +
                        "Content type: " + ct.get_ContentType() + "\n");

                InputStream stream = ct.accessContentStream();

                try {

                    //File excel = new File("C://План_закупок01.xlsx");
                    //FileInputStream fis = new FileInputStream(excel);

                    XSSFWorkbook book = new XSSFWorkbook(stream);
                    XSSFSheet sheet = book.getSheetAt(0);

                    String nullString = "";

                    Date dx = new Date();

                    String idxStr = dx.getTime()+"";

                    Iterator<Row> itr = sheet.iterator();
                    while (itr.hasNext()) {
                        Row row = itr.next();

                        Document doc = Factory.Document.createInstance(os, "PPG_Card");

                        if (row.getCell(2) != null) {

                            if (row.getCell(2).getCellType() != Cell.CELL_TYPE_STRING) continue;

                            //if(!row.getCell(2).getStringCellValue().contains("Наименование заказчика")) continue;
                            if (row.getCell(2).getStringCellValue().contains("План закупок товаров") || row.getCell(2).getStringCellValue().contains("Наименование заказчика") || row.getCell(2).getStringCellValue().equals(nullString) || row.getCell(2).getStringCellValue().contains("Председателя Правления"))
                                continue;

                            String PPG_CustomerName = row.getCell(2).getStringCellValue().trim();
                            String PPG_KindSubjectProcurement = row.getCell(3).getStringCellValue().trim();
                            String PPG_NamePurchasedGoods = row.getCell(5).getStringCellValue().trim();
                            String PPG_TypePurchasedGoods = row.getCell(7).getStringCellValue().trim();
                            String PPG_ProcurementMethod = row.getCell(8).getStringCellValue().trim();
                            String PPG_UnitMeasurement = row.getCell(9).getStringCellValue().trim();
                            String PPG_PlannedPeriodProcurement = row.getCell(58).getStringCellValue().trim();

                            String PPG_DeliveryAddress = null;

                            try {

                                PPG_DeliveryAddress = row.getCell(59).getStringCellValue().trim();

                            } catch (java.lang.IllegalStateException e) {

                                PPG_DeliveryAddress = round(row.getCell(59).getNumericCellValue(), 2) + "";

                            }

                            String PPG_ResponsibleString = "";

                            try {

                                PPG_ResponsibleString = row.getCell(69).getStringCellValue().trim();

                            } catch (Exception ex) {

                                System.out.println();
                            }

                            double PPG_QuantityVolume = row.getCell(52).getNumericCellValue();
                            double PPG_UnitPrice = row.getCell(53).getNumericCellValue();
                            double PPG_TotalAmount = row.getCell(54).getNumericCellValue();
                            double PPG_ApprovedAmount = round(row.getCell(55).getNumericCellValue(), 2);
                            double PPG_ForecastAmountSecondYear = round(row.getCell(56).getNumericCellValue(), 2);
                            double PPG_ForecastAmountThirdYear = round(row.getCell(57).getNumericCellValue(), 2);

                            int PPG_AmountAdvancePayment = (int) row.getCell(60).getNumericCellValue();

                            System.out.print(PPG_CustomerName + "\t" + PPG_KindSubjectProcurement + "\t" + PPG_NamePurchasedGoods + "\t" + PPG_TypePurchasedGoods + "\t" + PPG_ProcurementMethod + "\t" + PPG_UnitMeasurement + "\t" + PPG_PlannedPeriodProcurement + "\t");

                            System.out.print(PPG_QuantityVolume + "\t" + PPG_UnitPrice + " " + PPG_TotalAmount + "\t" + PPG_ApprovedAmount + "\t" + PPG_ForecastAmountSecondYear + "\t" + PPG_ForecastAmountThirdYear + "\t" + PPG_DeliveryAddress + "\t" + PPG_AmountAdvancePayment + "\t" + PPG_ResponsibleString);

                            System.out.println("");

                            doc.getProperties().putValue("DocumentTitle", PPG_NamePurchasedGoods);
                            doc.getProperties().putValue("PPG_CustomerName", PPG_CustomerName);
                            doc.getProperties().putValue("PPG_KindSubjectProcurement", PPG_KindSubjectProcurement);
                            doc.getProperties().putValue("PPG_NamePurchasedGoods", PPG_NamePurchasedGoods);
                            doc.getProperties().putValue("PPG_TypePurchasedGoods", PPG_TypePurchasedGoods);
                            doc.getProperties().putValue("PPG_ProcurementMethod", PPG_ProcurementMethod);
                            doc.getProperties().putValue("PPG_UnitMeasurement", PPG_UnitMeasurement);
                            doc.getProperties().putValue("PPG_PlannedPeriodProcurement", PPG_PlannedPeriodProcurement);
                            doc.getProperties().putValue("PPG_QuantityVolume", PPG_QuantityVolume);
                            doc.getProperties().putValue("PPG_UnitPrice", PPG_UnitPrice);
                            doc.getProperties().putValue("PPG_TotalAmount", PPG_TotalAmount);
                            doc.getProperties().putValue("PPG_ApprovedAmount", PPG_ApprovedAmount);
                            doc.getProperties().putValue("PPG_ForecastAmountSecondYear", PPG_ForecastAmountSecondYear);
                            doc.getProperties().putValue("PPG_ForecastAmountThirdYear", String.valueOf(PPG_ForecastAmountThirdYear));
                            doc.getProperties().putValue("PPG_DeliveryAddress", PPG_DeliveryAddress);
                            doc.getProperties().putValue("PPG_AmountAdvancePayment", PPG_AmountAdvancePayment);

                            doc.getProperties().putValue("LayoutId", idxStr);
                            object.getProperties().putValue("LayoutId", idxStr);

                            doc.getProperties().putValue("PPG_Responsible", getEmpID(os, PPG_ResponsibleString));

                            doc.getProperties().putValue("PPG_Status", "Новый");

                            Integer year = object.getProperties().getInteger32Value("PPG_Year");
                            doc.getProperties().putValue("PPG_Year", year);
                            String yearStr = "";
                            if(year != null)
                                yearStr = year.toString();

                            doc.checkin(AutoClassify.DO_NOT_AUTO_CLASSIFY, CheckinType.MAJOR_VERSION);
                            doc.save(RefreshMode.NO_REFRESH);

                            Folder folder = Factory.Folder.fetchInstance(os,"/Согласование плана закупок товаров, работ и услуг/Карточки планов закупок товаров, работ и услуг/" + yearStr, propertyFilter);
                            ReferentialContainmentRelationship rcr = folder.file(doc,
                                    AutoUniqueName.AUTO_UNIQUE, "New Document via Java API",
                                    DefineSecurityParentage.DO_NOT_DEFINE_SECURITY_PARENTAGE);
                            rcr.save(RefreshMode.NO_REFRESH);

                        }
                    }

                    stream.close();
                } catch (IOException ioe) {
                    ioe.printStackTrace();
                }
            }

        } else if (isDelete) {

            System.out.println("-------->CreatePPGCards->Delete");

            System.out.println("-------->" + object.getProperties().getStringValue("LayoutId"));

            ObjectStore os = ((RepositoryObject) object).getObjectStore();

            PropertyFilter propertyFilter = new PropertyFilter();

            propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);
            propertyFilter.addIncludeProperty(new FilterElement(null, null, null, PropertyNames.CONTENT_SIZE, null));
            propertyFilter.addIncludeProperty(new FilterElement(null, null, null, PropertyNames.CONTENT_ELEMENTS, null));

            //object.refresh(propertyFilter);

            String query = "SELECT * FROM [PPG_Card] WHERE [LayoutId] = '" + object.getProperties().getStringValue("LayoutId") + "'";

            SearchSQL searchSQL = new SearchSQL();

            searchSQL.setQueryString(query);

            SearchScope searchScope = new SearchScope(os);

            RepositoryRowSet rowSet = searchScope.fetchRows(searchSQL, null, null, false);

            if (rowSet != null) {

                Iterator<RepositoryRow> it = rowSet.iterator();

                while (it.hasNext()) {

                    RepositoryRow row = it.next();

                    Id id = row.getProperties().getIdValue("ID");

                    System.out.println("-------->" + row.getProperties().getIdValue("ID"));

                    Document document = Factory.Document.fetchInstance(os, id, propertyFilter);

                    document.delete();

                    document.save(RefreshMode.REFRESH);

                }

            }

        } else {

            getLogger().info("don't process no create or delete action");

            return false;

        }

        return true;
    }

    public static double round(double value, int places) {
        if (places < 0) throw new IllegalArgumentException();

        long factor = (long) Math.pow(10, places);
        value = value * factor;
        long tmp = Math.round(value);
        return (double) tmp / factor;
    }

    public static int getEmpID(ObjectStore os, String name) {
        int Id = 366;
        String Empty = "";
        if (name.length() < 2) {
            String[] as = name.split("=");

            String FullName = " ";

            for (int i = 0; i < as.length; i++) {
                FullName = as[i];
            }

            SearchSQL searchSQLModels = new SearchSQL("Select *from DmEmployee where DmEmployeeName like '%" + FullName + "'%");

            SearchScope searchScopeModels = new SearchScope(os);

            DocumentSet modelSets = (DocumentSet) searchScopeModels.fetchObjects(searchSQLModels, null, null, new Boolean(true));

            Iterator iter = modelSets.iterator();

            while (iter.hasNext()) {
                com.filenet.api.core.Document documentModel = (com.filenet.api.core.Document) iter.next();

                Id = documentModel.getProperties().getInteger32Value("DmEmployeeId");
            }
            return Id;
        } else {
            return Id;
        }
    }


}


