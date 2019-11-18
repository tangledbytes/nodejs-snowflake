"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var _a = require('../build/Release/snowflake'), nextID = _a.nextID, getTimestamp = _a.getTimestamp, nextIDString = _a.nextIDString;
var getMacID_1 = __importDefault(require("./getMacID"));
var SEQUENCE_BITS = 12;
var CUSTOM_EPOCH = 1546300800000; // 01-01-2019
var maxSequence = Math.pow(2, SEQUENCE_BITS) - 1;
/**
 * Constructs a UniqueID object which stores method for generation
 * of a unique 64 bit time sortable id and a method for retreiving
 * time of creation for the ids
 *
 * @param {number} [customEpoch = 1546300800000] A 42 bit long custom epoch
 * in ms, defaults to 1546300800000 (01-01-2019)
 *
 * ```
 * const uid = new UniqueID();
 * const ID = uid.getUniqueID();
 * const IDCreateAt = uid.getTimestampFromID(ID);
 * const currentMacID = uid.getMacID();
 * ```
 */
var UniqueID = /** @class */ (function () {
    function UniqueID(customEpoch) {
        this._MACID = '';
        this._lastTimestamp = CUSTOM_EPOCH;
        this._sequence = 0;
        this._FORMATTEDMACID = '';
        this._CUSTOM_EPOCH = customEpoch || CUSTOM_EPOCH;
        var _a = getMacID_1.default(), macIDString = _a.macIDString, macID = _a.macID;
        this._MACID = macIDString;
        this._FORMATTEDMACID = macID;
        if (!this._MACID)
            throw new Error('No MAC ADDRESS found to initialise');
    }
    /**
     * Generates a unique time sortable 64 bit number using native code
     * @returns {string | number} the unique id
     */
    UniqueID.prototype.getUniqueID = function (return_type) {
        if (return_type === void 0) { return_type = 'string'; }
        var currentTimestamp = Date.now();
        var customCurrentTimeStamp = currentTimestamp - this._CUSTOM_EPOCH;
        var customLastTimestamp = this._lastTimestamp - this._CUSTOM_EPOCH;
        if (customCurrentTimeStamp === customLastTimestamp) {
            this._sequence = (this._sequence + 1) & maxSequence;
            if (this._sequence === 0)
                return this.getUniqueID(return_type);
        }
        else
            this._sequence = 0;
        this._lastTimestamp = currentTimestamp;
        if (return_type === 'string')
            return nextIDString(customCurrentTimeStamp, customLastTimestamp, this._sequence, this._MACID);
        else
            return nextID(customCurrentTimeStamp, customLastTimestamp, this._sequence, this._MACID);
    };
    /**
     * Retrieves the epoch/unix timestamp at which the ID was generated
     * irrespective of the machine it was generated on, PROVIDED no or same
     * custom epoch was used in generation
     * @param id {number} id generated through getUniqueID method
     * @returns {number} timestamp of id creations
     */
    UniqueID.prototype.getTimestampFromID = function (id) {
        return getTimestamp(id) + this._CUSTOM_EPOCH;
    };
    return UniqueID;
}());
exports.UniqueID = UniqueID;
//# sourceMappingURL=generateUniqueID.js.map