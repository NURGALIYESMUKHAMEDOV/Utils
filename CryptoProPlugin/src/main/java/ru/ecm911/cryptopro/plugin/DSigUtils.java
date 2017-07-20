package ru.ecm911.cryptopro.plugin;

import com.objsys.asn1j.runtime.Asn1BerDecodeBuffer;
import com.objsys.asn1j.runtime.Asn1BerEncodeBuffer;
import com.objsys.asn1j.runtime.Asn1ObjectIdentifier;
import com.objsys.asn1j.runtime.Asn1OctetString;
import com.objsys.asn1j.runtime.Asn1Type;
import com.objsys.asn1j.runtime.Asn1UTCTime;
import java.io.ByteArrayInputStream;
import java.io.PrintStream;
import java.math.BigInteger;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.Principal;
import java.security.Signature;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import ru.CryptoPro.JCP.ASN.CryptographicMessageSyntax.CertificateChoices;
import ru.CryptoPro.JCP.ASN.CryptographicMessageSyntax.CertificateSet;
import ru.CryptoPro.JCP.ASN.CryptographicMessageSyntax.ContentInfo;
import ru.CryptoPro.JCP.ASN.CryptographicMessageSyntax.DigestAlgorithmIdentifier;
import ru.CryptoPro.JCP.ASN.CryptographicMessageSyntax.DigestAlgorithmIdentifiers;
import ru.CryptoPro.JCP.ASN.CryptographicMessageSyntax.EncapsulatedContentInfo;
import ru.CryptoPro.JCP.ASN.CryptographicMessageSyntax.IssuerAndSerialNumber;
import ru.CryptoPro.JCP.ASN.CryptographicMessageSyntax.SignatureValue;
import ru.CryptoPro.JCP.ASN.CryptographicMessageSyntax.SignedAttributes;
import ru.CryptoPro.JCP.ASN.CryptographicMessageSyntax.SignedData;
import ru.CryptoPro.JCP.ASN.CryptographicMessageSyntax.SignerIdentifier;
import ru.CryptoPro.JCP.ASN.CryptographicMessageSyntax.SignerInfo;
import ru.CryptoPro.JCP.ASN.CryptographicMessageSyntax.SignerInfos;
import ru.CryptoPro.JCP.ASN.PKIX1Explicit88.Attribute;
import ru.CryptoPro.JCP.ASN.PKIX1Explicit88.CertificateSerialNumber;
import ru.CryptoPro.JCP.ASN.PKIX1Explicit88.Time;
import ru.CryptoPro.JCP.params.OID;
import ru.CryptoPro.JCP.tools.Array;

public class DSigUtils
{
    private static final String STR_CMS_OID_SIGNED = "1.2.840.113549.1.7.2";
    private static final String DIGEST_OID = "1.2.643.2.2.9";
    private static final String STR_CMS_OID_CONT_TYP_ATTR = "1.2.840.113549.1.9.3";
    private static final String STR_CMS_OID_DIGEST_ATTR = "1.2.840.113549.1.9.4";
    private static final String DIGEST_ALG_NAME = "GOST3411";
    private static final String STR_CMS_OID_SIGN_TYM_ATTR = "1.2.840.113549.1.9.5";

    public static List<DSigSignerInfo> verify(byte[] cmsData, byte[] data)
    {
        List<DSigSignerInfo> signers = new ArrayList();
        try
        {
            ContentInfo contentInfo = getContentInfo(cmsData);

            SignedData signedData = (SignedData)contentInfo.content;

            boolean detached = true;
            if (signedData.encapContentInfo.eContent != null)
            {
                System.out.println("attached signature");

                byte[] text = signedData.encapContentInfo.eContent.value;

                detached = false;
            }
            else if (data != null)
            {
                System.out.println("detached signature");

                byte[] text = data;

                detached = true;
            }
            else
            {
                throw new Exception("no content for verify");
            }
            byte[] text = null;
            OID digestOid = getDigestOid(signedData);

            OID eContTypeOID = new OID(signedData.encapContentInfo.eContentType.value);

            System.out.println("eContTypeOID: " + eContTypeOID.toString());

            System.out.println("signedData.signerInfos: " + signedData.signerInfos);

            System.out.println("signedData.signerInfos.elements: " + signedData.signerInfos.elements);
            for (int j = 0; j < signedData.signerInfos.elements.length; j++)
            {
                SignerInfo info = signedData.signerInfos.elements[j];

                System.out.println("\tsignerInfo: " + info);
                if (!digestOid.equals(new OID(info.digestAlgorithm.algorithm.value))) {
                    throw new Exception("not signed on certificate.");
                }
                BigInteger serialNumber = null;
                if ("issuerAndSerialNumber".equals(info.sid.getElemName()))
                {
                    IssuerAndSerialNumber issuerAndSerialNumber = (IssuerAndSerialNumber)info.sid.getElement();

                    serialNumber = issuerAndSerialNumber.serialNumber.value;

                    System.out.println("serialNumber: " + serialNumber);
                }
                else
                {
                    if ("subjectKeyIdentifier".equals(info.sid.getElemName())) {
                        throw new Exception("'subjectKeyIdentifier' for 'signerIdentifier' is not supported");
                    }
                    throw new Exception("unknown type of 'signerIdentifier'");
                }
                System.out.println("certificates: " + signedData.certificates);

                System.out.println("certificates: " + signedData.certificates.elements.length);
                if (signedData.certificates != null) {
                    for (int i = 0; i < signedData.certificates.elements.length; i++)
                    {
                        Asn1BerEncodeBuffer encodeBuffer = new Asn1BerEncodeBuffer();

                        signedData.certificates.elements[i].encode(encodeBuffer);

                        CertificateFactory certificateFactory = CertificateFactory.getInstance("X.509");

                        X509Certificate cert = (X509Certificate)certificateFactory.generateCertificate(encodeBuffer.getInputStream());
                        if (cert.getSerialNumber().equals(serialNumber))
                        {
                            DSigSignerInfo signer = new DSigSignerInfo();

                            signer.setCertificate(cert);

                            signer.setValid(verify(cert, info, text, eContTypeOID, true, detached));

                            signers.add(signer);
                        }
                    }
                }
            }
        }
        catch (Exception e)
        {
            e.printStackTrace(System.out);

            System.out.println("something goes wrong");

            e.printStackTrace();
        }
        return signers;
    }

    private static ContentInfo getContentInfo(byte[] data)
    {
        try
        {
            Asn1BerDecodeBuffer decodeBuffer = new Asn1BerDecodeBuffer(data);

            ContentInfo contentInfo = new ContentInfo();

            contentInfo.decode(decodeBuffer);
            if (!new OID("1.2.840.113549.1.7.2").eq(contentInfo.contentType.value)) {
                throw new Exception("content type '" + contentInfo.contentType.value + "' of CMS message is not supported");
            }
            return contentInfo;
        }
        catch (Exception e)
        {
            throw new RuntimeException(e);
        }
    }

    private static OID getDigestOid(SignedData signedData)
    {
        OID digestOid = null;
        try
        {
            DigestAlgorithmIdentifier digestAlgorithmIdentifier = new DigestAlgorithmIdentifier(new OID("1.2.643.2.2.9").value);
            for (int i = 0; i < signedData.digestAlgorithms.elements.length; i++) {
                if (signedData.digestAlgorithms.elements[i].algorithm.equals(digestAlgorithmIdentifier.algorithm))
                {
                    digestOid = new OID(signedData.digestAlgorithms.elements[i].algorithm.value);

                    break;
                }
            }
            if (digestOid == null) {
                throw new Exception("unknown digest");
            }
        }
        catch (Exception e)
        {
            throw new RuntimeException(e);
        }
        return digestOid;
    }

    private static boolean verify(X509Certificate certificate, SignerInfo signerInfo, byte[] text, OID eContentTypeOID, boolean needSortSignedAttributes, boolean detached)
    {
        System.out.println("--> verify");
        try
        {
            byte[] signature = signerInfo.signature.value;

            System.out.println("\t\tsignature, size: " + signature.length);
            byte[] data;
            if (signerInfo.signedAttrs == null)
            {
                data = text;
            }
            else
            {
                Attribute[] signAttrElem = signerInfo.signedAttrs.elements;

                Asn1ObjectIdentifier contentTypeOid = new Asn1ObjectIdentifier(new OID("1.2.840.113549.1.9.3").value);

                Attribute contentTypeAttr = null;
                for (int r = 0; r < signAttrElem.length; r++)
                {
                    Asn1ObjectIdentifier oid = signAttrElem[r].type;
                    if (oid.equals(contentTypeOid)) {
                        contentTypeAttr = signAttrElem[r];
                    }
                }
                if (contentTypeAttr == null) {
                    throw new Exception("content-type attribute not present");
                }
                if (!contentTypeAttr.values.elements[0].equals(new Asn1ObjectIdentifier(eContentTypeOID.value))) {
                    throw new Exception("content-type attribute OID not equal eContentType OID");
                }
                System.out.println("\t\tcontent-type attribute: " + Arrays.toString(eContentTypeOID.value));

                Asn1ObjectIdentifier messageDigestOid = new Asn1ObjectIdentifier(new OID("1.2.840.113549.1.9.4").value);

                Attribute messageDigestAttr = null;
                for (int r = 0; r < signAttrElem.length; r++)
                {
                    Asn1ObjectIdentifier oid = signAttrElem[r].type;
                    if (oid.equals(messageDigestOid)) {
                        messageDigestAttr = signAttrElem[r];
                    }
                }
                if (messageDigestAttr == null) {
                    throw new Exception("message-digest attribute not present");
                }
                Asn1Type open = messageDigestAttr.values.elements[0];

                Asn1OctetString hash = (Asn1OctetString)open;

                byte[] md = hash.value;

                System.out.println("\t\tmessage digest: " + Arrays.toString(md));

                byte[] dm = getDigest(text, "GOST3411");

                System.out.println("\t\tcalculated message digest : " + Arrays.toString(dm));
                if (!Array.toHexString(dm).equals(Array.toHexString(md))) {
                    throw new Exception("message-digest attribute verify failed");
                }
                Asn1ObjectIdentifier signTimeOid = new Asn1ObjectIdentifier(new OID("1.2.840.113549.1.9.5").value);

                Attribute signTimeAttr = null;
                for (int r = 0; r < signAttrElem.length; r++)
                {
                    Asn1ObjectIdentifier oid = signAttrElem[r].type;
                    if (oid.equals(signTimeOid)) {
                        signTimeAttr = signAttrElem[r];
                    }
                }
                if (signTimeAttr != null)
                {
                    Time sigTime = (Time)signTimeAttr.values.elements[0];

                    Asn1UTCTime time = (Asn1UTCTime)sigTime.getElement();

                    System.out.println("\t\ttime = " + time);
                }
                Asn1BerEncodeBuffer encBufSignedAttr = new Asn1BerEncodeBuffer();

                signerInfo.signedAttrs.needSortSignedAttributes = needSortSignedAttributes;

                signerInfo.signedAttrs.encode(encBufSignedAttr);

                data = encBufSignedAttr.getMsgCopy();
            }
            System.out.println("\t\tverify signature, certificate: " + certificate.getSubjectDN().getName() + ", content: " + data.length + ", signature: " + signature.length);

            Signature signatureObj = Signature.getInstance("GOST3411withGOST3410EL");

            signatureObj.initVerify(certificate);

            signatureObj.update(data);

            boolean verified = signatureObj.verify(signature);

            System.out.println("\t\tresult: " + verified);
            if ((!verified) && (signerInfo.signedAttrs != null) && (needSortSignedAttributes)) {
                return verify(certificate, signerInfo, text, eContentTypeOID, false, detached);
            }
            return verified;
        }
        catch (Exception ex)
        {
            System.out.println("error happens: " + ex);

            ex.printStackTrace();
        }
        return false;
    }

    private static byte[] getDigest(byte[] bytes, String digestAlgorithmName)
            throws Exception
    {
        ByteArrayInputStream stream = new ByteArrayInputStream(bytes);

        MessageDigest digest = MessageDigest.getInstance(digestAlgorithmName);

        DigestInputStream digestStream = new DigestInputStream(stream, digest);
        while (digestStream.available() != 0) {
            digestStream.read();
        }
        return digest.digest();
    }
}
