import isFalsy from './isFalsy'

const { Snowflake } = require('../build/Release/snowflake');

const CUSTOM_EPOCH = 1546300800000; // 01-01-2019
const MAX_MACHINE_ID = (1 << 12) - 1;

interface Config {
    customEpoch?: number;
    returnNumber?: boolean;
    machineID?: number;
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
 * @param {config} config
 * in ms, defaults to 1546300800000 (01-01-2019)
 * 
 * ```
 * const uid = new UniqueID();
 * const ID = uid.getUniqueID();
 * const IDCreateAt = uid.getTimestampFromID(ID);
 * ```
 */
export class UniqueID {
    private _CUSTOM_EPOCH: number;
    private _snowflake: any;
    private _MACHINE_ID: number;
    private returnNumber = true;

    constructor(config: Config = initConfig) {
        this._CUSTOM_EPOCH = config.customEpoch || CUSTOM_EPOCH;
        this.returnNumber = !!config.returnNumber;

        // A 12 bit machine id, if not passed in then a random id will be used
        // Ternary operator was used to make sure "0" isn't considered to be falsy.
        this._MACHINE_ID = (
            !isFalsy(config.machineID) ? config.machineID : Math.floor(Math.random() * MAX_MACHINE_ID)
        ) as number;

        // Check if the number is satisfies all the conditions
        if (!Number.isInteger(this._MACHINE_ID)) throw Error("Machine Id should be a decimal number");
        if (this._MACHINE_ID > MAX_MACHINE_ID) throw Error("Maximum value of machine id can be 2^12 - 1 (4095)")

        this._snowflake = new Snowflake(this._CUSTOM_EPOCH, this._MACHINE_ID);
    }

    /**
     * Generates a unique time sortable 64 bit number using native code
     * @returns {string | bigint} the unique id
     */
    getUniqueID(): string | bigint {
        const val = this._snowflake.getUniqueID()
        if (!this.returnNumber)
            return val.toString();
        return val
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
        return this._snowflake.getTimestampFromID(id);
    }

    /**
     * Retrieves the 12 bit machine id where the id was generated,
     * irrespective of the machine it was generated on.
     * @param id 
     */
    getMachineIDFromID(id: bigint | string): number {
        return this._snowflake.getNodeIDFromID(id);
    }

    /**
     * Machine ID of the current machine. This ID is of 12 bit.
     * This can be either provided by the user (preferred) or will be assigned
     * randomly.
     */
    get machineID() {
        return this._MACHINE_ID;
    }
}