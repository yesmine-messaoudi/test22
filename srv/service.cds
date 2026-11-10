using { apiapp as my } from '../db/schema';

/**
 * Read-only catalog: the app only reads APIs stored in HANA
 * (SAP standard APIs and internal APIs) and shows them. Nothing can be created, changed or deleted.
 * Every entity requires the XSUAA role "APIHubUser" (see xs-security.json).
 */
@path: '/service/api_management_app'
service appSrv {

  @readonly
  @requires: 'APIHubUser'
  entity StandardAPI as projection on my.StandardAPI;

  @readonly
  @requires: 'APIHubUser'
  entity InternalApis as projection on my.InternalApi;

  @readonly
  @requires: 'APIHubUser'
  entity Methods as projection on my.Method;

  @readonly
  @requires: 'APIHubUser'
  entity Operations as projection on my.Operation;

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
