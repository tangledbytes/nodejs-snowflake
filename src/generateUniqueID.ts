const { nextID, getTimestamp } = require('../build/Release/snowflake');
import getMacID from './getMacID';

const SEQUENCE_BITS = 12;
const CUSTOM_EPOCH = 1546300800000; // 01-01-2019
const maxSequence = Math.pow(2, SEQUENCE_BITS) - 1;

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
export class UniqueID {
    private _CUSTOM_EPOCH: number;
    private _MACID: string = '';
    private _lastTimestamp = CUSTOM_EPOCH;
    private _sequence = 0;
    private _FORMATTEDMACID: string = '';

    constructor(customEpoch?: number) {
        this._CUSTOM_EPOCH = customEpoch || CUSTOM_EPOCH;
    }

    /**
     * Initialise the mac id for internal computations
     */
    async init(): Promise<void> {
        const { macIDString, macID } = await getMacID();
        this._MACID = macIDString;
        this._FORMATTEDMACID = macID;
    }

    /**
     * Generates a unique time sortable 64 bit number using native code
     * @returns {number} The unique id
     */
    getUniqueID(): number {
        if (this._MACID) {
            const currentTimestamp = Date.now();
            const customCurrentTimeStamp = currentTimestamp - this._CUSTOM_EPOCH;
            const customLastTimestamp = this._lastTimestamp - this._CUSTOM_EPOCH;
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
    }

    /**
     * Retrieves the epoch/unix timestamp at which the ID was generated
     * irrespective of the machine it was generated on, PROVIDED no or same 
     * custom epoch was used in generation
     * @param id {number} id generated through getUniqueID method
     * @returns {number} timestamp of id creations
     */
    getTimestampFromID(id: number): number {
        return getTimestamp(id) + this._CUSTOM_EPOCH;
    }

    getMacID(): string {
        return this._FORMATTEDMACID;
    }
}