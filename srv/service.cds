using { apiapp as my } from '../db/schema';

/**
 * Every entity requires the single XSUAA role "APIHubUser"
 * (see xs-security.json). Users get it through the "API Hub User" role collection.
 */
@path: '/service/api_management_app'
service appSrv {

  @readonly
  @requires: 'APIHubUser'
  entity StandardAPI as projection on my.StandardAPI;

  // Everyone can read and create; only the owner can change or delete.
  @restrict: [
    { grant: ['READ', 'CREATE'], to: 'APIHubUser' },
    { grant: ['UPDATE', 'DELETE'], to: 'APIHubUser', where: 'createdBy = $user' }
  ]
  entity InternalApis as projection on my.InternalApi;

  // Owner checks for writes are in srv/code/api-item-logic.js
  @requires: 'APIHubUser'
  entity Methods as projection on my.Method;

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
