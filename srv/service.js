const LCAPApplicationService = require('@sap/low-code-event-handler');
const currentUser = require('./code/current-user');
const internalApiLogic = require('./code/internal-api-logic');
const apiItemLogic = require('./code/api-item-logic');

class appSrv extends LCAPApplicationService {
    async init() {
        this.on('me', currentUser);

        this.before(['CREATE', 'UPDATE'], 'InternalApis', internalApiLogic.setLastModified);
        this.after('DELETE', 'InternalApis', internalApiLogic.deleteItems);

        this.before(['CREATE', 'UPDATE', 'DELETE'], ['Methods', 'Operations'], apiItemLogic);

        return super.init();
    }
}

module.exports = appSrv;
