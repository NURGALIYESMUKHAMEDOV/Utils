package ru.ecm911.cryptopro.plugin;

import java.security.cert.X509Certificate;

public class DSigSignerInfo
{
    private X509Certificate certificate;
    private boolean valid;

    public X509Certificate getCertificate()
    {
        return this.certificate;
    }

    public void setCertificate(X509Certificate certificate)
    {
        this.certificate = certificate;
    }

    public boolean isValid()
    {
        return this.valid;
    }

    public void setValid(boolean valid)
    {
        this.valid = valid;
    }
}
