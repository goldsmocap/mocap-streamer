"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientSummaryState = exports.clientSummary = exports.roleBoth = exports.roleReceiver = exports.roleSender = void 0;
exports.roleSender = "SENDER";
exports.roleReceiver = "RECEIVER";
exports.roleBoth = "BOTH";
const clientSummary = (client) => ({
    name: client.name,
    role: client.role,
});
exports.clientSummary = clientSummary;
const clientSummaryState = (clientState) => {
    return {
        clients: clientState.clients.map(exports.clientSummary),
        clientMap: clientState.clientMap.map(([from, to]) => [(0, exports.clientSummary)(from), (0, exports.clientSummary)(to)]),
    };
};
exports.clientSummaryState = clientSummaryState;
//# sourceMappingURL=clients.js.map