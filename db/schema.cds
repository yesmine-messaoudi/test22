namespace apiapp;

using {
    cuid,
    managed
} from '@sap/cds/common';

type UserRole : String enum {
    ADMIN = 'admin';
    TECHNICAL_CONSULTANT = 'technical consultant';
    FUNCTIONAL_CONSULTANT = 'functional consultant';
}

entity Users : cuid, managed {
    email : String(100) @mandatory;
    password : String(100);
    firstName : String(50);
    lastName : String(50);
    role : UserRole;
    internalApis : Composition of many InternalApi on internalApis.user = $self;
}

annotate Users with @(assert.unique: {
    email: [email]
});

entity InternalApi : cuid, managed {
    title : String(100) @mandatory;
    description : String(500);
    version : String(20);
    status : String(30);
    lastModified : DateTime;
    type : String(20);
    user : Association to one Users;
    operations : Association to many Operation on operations.internalApi = $self;
    methods : Association to many Method on methods.internalApi = $self;
}

annotate InternalApi with @(assert.unique: {
    title: [title]
});

entity Operation{
    key ID : UUID;
    package_id : UUID;
    portType : String(100) @mandatory;
    namespace : String(20);
    port : String(100);
    location : String(100);
    protocol : String(100);
    defaultStyle : String(100);
    transportProtocol : String(100);
    internalApi : Association to one InternalApi;
    standardAPI : Association to one StandardAPI on standardAPI.ID = package_id;
}

entity Method{
    key ID : UUID;
    package_id : UUID;
    method : String(30); 
    description : String(500);
    path : String(200);
    section : String(100);
    internalApi : Association to one InternalApi;
    standardAPI : Association to one StandardAPI on standardAPI.ID = package_id;
}

entity StandardAPI{
    key ID : UUID;
    title : String(100);
    description : String(500);
    version : String(20);
    status : String(30);
    lastModified : DateTime;
    type : String(20);
    operations : Association to many Operation on operations.standardAPI = $self;
    methods : Association to many Method on methods.standardAPI = $self;
}