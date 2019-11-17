"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var _a = require('../build/Release/snowflake'), nextID = _a.nextID, getTimestamp = _a.getTimestamp;
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
 * await uid.init(); // If not initialised then an error will be thrown
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
        this._CUSTOM_EPOCH = customEpoch || CUSTOM_EPOCH;
    }
    /**
     * Initialise the mac id for internal computations
     */
    UniqueID.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var macIDString;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getMacID_1.default()];
                    case 1:
                        macIDString = (_a.sent()).macIDString;
                        this._MACID = macIDString;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generates a unique time sortable 64 bit number using native code
     * @returns {number} The unique id
     */
    UniqueID.prototype.getUniqueID = function () {
        if (this._MACID) {
            var currentTimestamp = Date.now();
            var customCurrentTimeStamp = currentTimestamp - this._CUSTOM_EPOCH;
            var customLastTimestamp = this._lastTimestamp - this._CUSTOM_EPOCH;
            if (customCurrentTimeStamp === customLastTimestamp) {
                this._sequence = (this._sequence + 1) & maxSequence;
                if (this._sequence === 0) {
                    return this.getUniqueID();
                }
            }
            else {
                this._sequence = 0;
            }
            this._lastTimestamp = currentTimestamp;
            return nextID(customCurrentTimeStamp, customLastTimestamp, this._sequence, this._MACID);
        }
        else {
            throw new Error('Uninitialised class');
        }
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
    UniqueID.prototype.getMacID = function () {
        return this._MACID;
    };
    return UniqueID;
}());
exports.UniqueID = UniqueID;
//# sourceMappingURL=generateUniqueID.js.map