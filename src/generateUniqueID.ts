const { Snowflake } = require('../build/Release/snowflake');
import getMacID from './getMacID';

const CUSTOM_EPOCH = 1546300800000; // 01-01-2019

interface Config {
    customEpoch?: number;
    returnNumber?: boolean
}

const initConfig: Config = {
    customEpoch: CUSTOM_EPOCH,
    returnNumber: false
}

/**
 * Constructs a UniqueID object which stores method for generation
 * of a unique 64 bit time sortable id and a method for retreiving
 * time of creation for the ids
 * 
 * @param {config} [customEpoch = 1546300800000] A 42 bit long custom epoch
 * in ms, defaults to 1546300800000 (01-01-2019)
 * 
 * ```
 * const uid = new UniqueID();
 * const ID = uid.getUniqueID();
 * const IDCreateAt = uid.getTimestampFromID(ID);
 * const currentMacID = uid.getMacID();
 * ```
 */
export class UniqueID {
    private _CUSTOM_EPOCH: number;
    private _MACID: string = '';
    private _FORMATTEDMACID: string = '';
    private _snowflake: any;
    private _nextID: Function;

    constructor(config: Config = initConfig) {
        this._CUSTOM_EPOCH = config.customEpoch || CUSTOM_EPOCH;
        const { macIDString, macID } = getMacID();
        this._MACID = macIDString;
        this._FORMATTEDMACID = macID;
        if (!this._MACID) throw new Error('No MAC ADDRESS found to initialise');
        this._snowflake = new Snowflake(this._MACID);
        this._nextID = config.returnNumber
            ? (timestamp: bigint) => this._snowflake.getUniqueIDBigInt(timestamp)
            : (timestamp: string) => this._snowflake.getUniqueID(timestamp)
    }

    /**
     * Generates a unique time sortable 64 bit number using native code
     * @returns {string | bigint} the unique id
     */
    getUniqueID(): string | bigint {
        return this._nextID(Date.now() - this._CUSTOM_EPOCH);
    }

    /**
     * Promisified unique id function
     * @returns {Promise<string | number>} promise to a unique 64 bit long id
     */
    async asyncGetUniqueID(): Promise<string | bigint> {
        return new Promise(resolve => resolve(this.getUniqueID()))
    }

    /**
     * Retrieves the epoch/unix timestamp at which the ID was generated
     * irrespective of the machine it was generated on, PROVIDED no or same 
     * custom epoch was used in generation
     * @param {number | string} id generated through getUniqueID method
     * @returns {number} timestamp of id creations
     */
    getTimestampFromID(id: bigint | string): number {
        return this._snowflake.getTimestampFromID(id) + this._CUSTOM_EPOCH;
    }

    /**
     * @returns MAC address being used internally
     */
    get macID(): string {
        return this._FORMATTEDMACID;
    }
}