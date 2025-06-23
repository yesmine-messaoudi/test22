using { apiapp as my } from '../db/schema.cds';

@path: '/service/api_management_app'
service appSrv {

  @requires: 'any'
  entity Users as projection on my.Users;

  @requires: 'any'
  entity InternalApis as projection on my.InternalApi;

  @requires: 'any'
  entity Operations as projection on my.Operation;

  @requires: 'any'
  entity Methods as projection on my.Method;

  @requires: 'any'
  entity StandardAPI as projection on my.StandardAPI;

  @requires: 'any'
  action login(email: String, password: String) returns {
    token: String;
    user: {
      id: UUID;
      email: String;
      firstName: String;
      lastName: String;
      role: String;
    }
  };

  @requires: 'any'
  action register(
    email: String,
    firstName: String,
    lastName: String,
    password: String,
    role: String
  ) returns {
    message: String;
    user: {
      id: UUID;
      email: String;
      firstName: String;
      lastName: String;
      role: String;
    }
  };
}
