mvn install:install-file -Dfile=Jace.jar -DgroupId=com.filenet.api -DartifactId=Jace -Dversion=1.0.TEST -Dpackaging=jar
mvn install:install-file -Dfile=com.ibm.ws.runtime.jar -DgroupId=com.ibm.websphere -DartifactId=ws.runtime -Dversion=1.0.TEST -Dpackaging=jar
mvn install:install-file -Dfile=kalkancrypt-0.1.1.jar -DgroupId=kz.gov.pki.kalkan -DartifactId=kalkancrypt -Dversion=0.1.1.TEST -Dpackaging=jar
mvn install:install-file -Dfile=kalkancrypt_xmldsig-0.2.jar -DgroupId=kz.gov.pki.kalkan -DartifactId=kalkancrypt-xmldsig -Dversion=0.2.TEST -Dpackaging=jar
mvn install:install-file -Dfile=xmlsec-1.5.8.jar -DgroupId=org.apache.xml.security -DartifactId=xmlsec -Dversion=1.5.8.TEST -Dpackaging=jar
mvn install:install-file -Dfile=icncore-1.0-SNAPSHOT.jar -DgroupId=com.ibm.ecm -DartifactId=ecm -Dversion=1.0-SNAPSHOT -Dpackaging=jar
mvn install:install-file -Dfile=datecalc-common-1.4.0.jar -DgroupId=net.objectlab.kit -DartifactId=datecalc-common -Dversion=1.4.0 -Dpackaging=jar
mvn install:install-file -Dfile=datecalc-joda-1.4.0.jar -DgroupId=net.objectlab.kit -DartifactId=datecalc-joda -Dversion=1.4.0 -Dpackaging=jar

mvn install:install-file -Dfile=xlxpScanner.jar -DgroupId=xlxp-scanner -DartifactId=xlxp-scanner -Dversion=1.0 -Dpackaging=jar
mvn install:install-file -Dfile=xlxpScannerUtils.jar -DgroupId=xlxp-scanner-utils -DartifactId=xlxp-scanner-utils -Dversion=1.0 -Dpackaging=jar
mvn install:install-file -Dfile=stax-api.jar -DgroupId=stax-api -DartifactId=stax-api -Dversion=1.0 -Dpackaging=jar
