package ru.ecm911.esbd.plugin;

import java.text.SimpleDateFormat;
import java.util.Date;

public class Utils {

    private static SimpleDateFormat dateFormat = new SimpleDateFormat("dd.MM.yyyy");

    private static SimpleDateFormat dateTimeFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

    public static Date getDate(String value) {

        if (value == null || value.isEmpty()) return null ;

        try { return dateTimeFormat.parse(value); } catch (Exception e) { return null; }

    }

    public static Date getDate(Long value) {

        if (value == null) return null ;

        return new Date(value);

    }

    public static Date getDateTime(String value) {

        if (value == null || value.isEmpty()) return null ;

        try { return dateTimeFormat.parse(value); } catch (Exception e) { return null; }

    }

    public static Date getDateTime(Long value) {

        if (value == null) return null ;

        return new Date(value);

    }

    public static String getDate(Date date) {

        if (date == null) return null ;

        return dateFormat.format(date);

    }

}
