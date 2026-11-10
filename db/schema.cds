namespace apiapp;

using {
    cuid,
    managed
} from '@sap/cds/common';

/**
 * APIs created by API Hub users.
 * The owner is the user in `createdBy` (filled automatically from the XSUAA login).
 */
entity InternalApi : cuid, managed {
    title        : String(100) @mandatory;
    description  : String(500);
    version      : String(20);
    status       : String(30);
    lastModified : DateTime;
    type         : String(20); // 'rest' or 'soap'
    operations   : Association to many Operation on operations.internalApi = $self;
    methods      : Association to many Method on methods.internalApi = $self;
}

annotate InternalApi with @(assert.unique: {
    title: [title]
});

/** SOAP operation of an internal or standard API. */
entity Operation {
    key ID                : UUID;
        package_id        : UUID;
        portType          : String(100) @mandatory;
        namespace         : String(20);
        port              : String(100);
        location          : String(100);
        protocol          : String(100);
        defaultStyle      : String(100);
        transportProtocol : String(100);
        internalApi       : Association to one InternalApi;
        standardAPI       : Association to one StandardAPI on standardAPI.ID = package_id;
}

/** REST method of an internal or standard API. */
entity Method {
    key ID          : UUID;
        package_id  : UUID;
        method      : String(30);
        description : String(500);
        path        : String(200);
        section     : String(100);
        internalApi : Association to one InternalApi;
        standardAPI : Association to one StandardAPI on standardAPI.ID = package_id;
}

/** Catalog of standard APIs (read-only in the app). */
entity StandardAPI {
    key ID           : UUID;
        title        : String(100);
        description  : String(500);
        version      : String(20);
        status       : String(30);
        lastModified : DateTime;
        type         : String(20); // 'rest' or 'soap'
        operations   : Association to many Operation on operations.standardAPI = $self;
        methods      : Association to many Method on methods.standardAPI = $self;
}
