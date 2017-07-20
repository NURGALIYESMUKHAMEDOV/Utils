package ru.ecm911.cryptopro.plugin;

public abstract interface DSigConstants
{
    public static final String DIGITAL_SIGNATURE_CLASS_NAME = "sigDigitalSignature";
    public static final String ID_PROPERTY_NAME = "Id";
    public static final String SIGNER_PROPERTY_NAME = "sigSigner";
    public static final String ISSUER_PROPERTY_NAME = "sigIssuer";
    public static final String VALID_FROM_PROPERTY_NAME = "sigValidFrom";
    public static final String VALID_TO_PROPERTY_NAME = "sigValidTo";
    public static final String STATUS_PROPERTY_NAME = "sigStatus";
    public static final String DATE_LAST_MODFIED_PROPERTY_NAME = "DateLastModified";
    public static final String ANNOTATED_OBJECT_PROPERTY_NAME = "AnnotatedObject";
    public static final int SIGNATURE_STATUS_VALID = 3;
}
