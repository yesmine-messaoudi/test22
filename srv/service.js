const LCAPApplicationService = require('@sap/low-code-event-handler');
const currentUser = require('./code/current-user');

class appSrv extends LCAPApplicationService {
    async init() {
        this.on('me', currentUser);
        return super.init();
    }
}

module.exports = appSrv;
