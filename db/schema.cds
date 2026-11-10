/**
 * Existing HANA tables in schema DBADMIN. The app only reads them.
 *
 * On HANA, these tables are reached through synonyms (db/src/dbadmin.hdbsynonym),
 * and db/hana/existing-tables.cds tells CAP not to create them.
 * Locally (SQLite), CAP creates them and fills them from test/data/*.csv.
 *
 * Only the columns the app needs are listed (e.g. the DESC_EMBEDDING vectors are left out).
 */

/** SAP standard APIs */
entity SAP_API_PACKAGES {
  key ID_PACKAGE    : Integer;
      TITLE         : String(255);
      DESCRIPTION   : LargeString;
      STATUS        : String(100);
      VERSION       : String(100);
      LAST_MODIFIED : Date;
      TYPE          : String(50); // REST or SOAP
      METHODS       : Association to many SAP_API_METHODS on METHODS.ID_PACKAGE = ID_PACKAGE;
      OPERATIONS    : Association to many SAP_API_OPERATIONS on OPERATIONS.ID_PACKAGE = ID_PACKAGE;
}

/** REST methods of SAP standard APIs */
entity SAP_API_METHODS {
  key ID_METHOD   : Integer;
      ID_PACKAGE  : Integer;
      SECTION     : String(255);
      METHOD      : String(50);
      PATH        : LargeString;
      DESCRIPTION : LargeString;
}

/** SOAP operations of SAP standard APIs */
entity SAP_API_OPERATIONS {
  key ID_OPERATION       : Integer;
      ID_PACKAGE         : Integer;
      PORT_TYPE          : String(255);
      NAMESPACE          : LargeString;
      PORT               : String(255);
      LOCATION           : LargeString;
      PROTOCOL           : String(100);
      DEFAULT_STYLE      : String(100);
      TRANSPORT_PROTOCOL : String(100);
}

/** Internal APIs: documents synced from SharePoint */
entity SHAREPOINT_DOCS {
  key ID             : String(255);
      URL            : String(2048);
      FILE_NAME      : String(512);
      AUTHOR         : String(255);
      CREATED_DATE   : String(50);
      MODIFIED_DATE  : String(50);
      DOCUMENT_TITLE : String(255);
      SUMMARY        : String(5000);
      KEYWORDS       : String(5000);
}
