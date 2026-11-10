using {
  SAP_API_PACKAGES,
  SAP_API_METHODS,
  SAP_API_OPERATIONS,
  SHAREPOINT_DOCS
} from '../db/schema';

/**
 * Read-only catalog: the app only reads APIs stored in HANA (schema DBADMIN)
 * and shows them. Nothing can be created, changed or deleted.
 * Every entity requires the XSUAA role "APIHubUser" (see xs-security.json).
 */
@path: '/service/api_management_app'
service appSrv {

  /** SAP standard APIs (table SAP_API_PACKAGES) */
  @readonly
  @requires: 'APIHubUser'
  entity StandardAPI as projection on SAP_API_PACKAGES {
    key ID_PACKAGE    as ID,
        TITLE         as title,
        DESCRIPTION   as description,
        STATUS        as status,
        VERSION       as version,
        LAST_MODIFIED as lastModified,
        TYPE          as type,
        METHODS       as methods    : redirected to Methods,
        OPERATIONS    as operations : redirected to Operations
  };

  /** REST methods (table SAP_API_METHODS) */
  @readonly
  @requires: 'APIHubUser'
  entity Methods as projection on SAP_API_METHODS {
    key ID_METHOD   as ID,
        ID_PACKAGE,
        SECTION     as section,
        METHOD      as method,
        PATH        as path,
        DESCRIPTION as description
  };

  /** SOAP operations (table SAP_API_OPERATIONS) */
  @readonly
  @requires: 'APIHubUser'
  entity Operations as projection on SAP_API_OPERATIONS {
    key ID_OPERATION       as ID,
        ID_PACKAGE,
        PORT_TYPE          as portType,
        NAMESPACE          as namespace,
        PORT               as port,
        LOCATION           as location,
        PROTOCOL           as protocol,
        DEFAULT_STYLE      as defaultStyle,
        TRANSPORT_PROTOCOL as transportProtocol
  };

  /** Internal APIs: SharePoint documents (table SHAREPOINT_DOCS) */
  @readonly
  @requires: 'APIHubUser'
  entity InternalApis as projection on SHAREPOINT_DOCS {
    key ID,
        coalesce(DOCUMENT_TITLE, FILE_NAME) as title : String(512),
        SUMMARY        as description,
        FILE_NAME      as fileName,
        URL            as url,
        AUTHOR         as author,
        CREATED_DATE   as createdDate,
        MODIFIED_DATE  as lastModified,
        KEYWORDS       as keywords
  };

  /** Current user's profile, used by the UI header. Open to any logged-in user. */
  @requires: 'authenticated-user'
  function me() returns {
    id        : String;
    email     : String;
    firstName : String;
    lastName  : String;
    hasAccess : Boolean;
  };
}
