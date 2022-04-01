"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientSummaryState = exports.clientSummary = void 0;
const clientSummary = (client) => ({ name: client.name });
exports.clientSummary = clientSummary;
const clientSummaryState = (clientState) => {
    return {
        clients: clientState.clients.map(exports.clientSummary),
        clientMap: clientState.clientMap.map(([from, to]) => [(0, exports.clientSummary)(from), (0, exports.clientSummary)(to)]),
    };
};
exports.clientSummaryState = clientSummaryState;
//# sourceMappingURL=clients.js.map