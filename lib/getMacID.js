"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var os_1 = require("os");
var macRegex = /(?:[a-z0-9]{1,2}[:-]){5}[a-z0-9]{1,2}/i;
function getMac() {
    var interfaces = os_1.networkInterfaces();
    for (var key in interfaces) {
        for (var _i = 0, _a = interfaces[key]; _i < _a.length; _i++) {
            var val = _a[_i];
            if (!val.internal && macRegex.test(val.mac))
                return val.mac;
        }
    }
    throw new Error('failed to get the MAC address');
}
/**
 * Asynchronous function returns mac address of the machine
 * @returns {MacID} An object containing macID and
 * special representation of it
 */
var getMacID = function () {
    var macID = getMac();
    var splitCharacter = os_1.platform() === 'win32' ? '-' : ':';
    return { macID: macID, macIDString: macID.split(splitCharacter).join('') };
};
exports.getMacID = getMacID;
exports.default = getMacID;
//# sourceMappingURL=getMacID.js.map