import isFalsy from "./isFalsy";

const { Snowflake } = require("../build/Release/snowflake");

const CUSTOM_EPOCH = 1546300800000; // 01-01-2019
const MAX_MACHINE_ID = (1 << 12) - 1;

interface Config {
  customEpoch?: number;
  returnNumber?: boolean;
  machineID?: number;
}

const initConfig: Config = {
  customEpoch: CUSTOM_EPOCH,
  returnNumber: false,
};

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
    this._MACHINE_ID = getMachineID(config.machineID);

    this._snowflake = new Snowflake(this._CUSTOM_EPOCH, this._MACHINE_ID);
  }

  /**
   * Generates a unique time sortable 64 bit number using native code
   * @returns {string | bigint} the unique id
   */
  getUniqueID(): string | bigint {
    const val = this._snowflake.getUniqueID();
    if (!this.returnNumber) return val.toString();
    return val;
  }

  /**
   * Promisified unique id function
   * @returns {Promise<string | number>} promise to a unique 64 bit long id
   */
  async asyncGetUniqueID(): Promise<string | bigint> {
    return new Promise((resolve) => resolve(this.getUniqueID()));
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
   * @param {bigint | string} id unique ID
   * @returns {number} machine ID
   */
  getMachineIDFromID(id: bigint | string): number {
    return this._snowflake.getNodeIDFromID(id);
  }

  /**
   * getIDFromTimestamp generates an ID corresponding to the given timestamp
   *
   * This ID is generated with sequence number 0
   *
   * Ideal for use cases where a database query requires to entries created after some timestamp
   * @param {number | string} timestamp timestamp corresponding to which an ID is required
   * @returns {bigint} ID corresponding to the timestamp
   */
  getIDFromTimestamp(timestamp: number | string): bigint {
    return this._snowflake.getIDFromTimestamp(timestamp);
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

/**
 * getMachineID takes in a machine id and verifies if it withstand
 * the following contraints:
 * 	
 * 1. Should not be "falsy" but could be 0
 * 2. Should be of type "number"
 * 3. Is a whole number
 * 4. Doesn't exceeds the limit of 4095
 * 
 * It will return a random value ε [0, 4095] if parameter is
 * undefined
 * @param mid machine id
 */
function getMachineID(mid: number | undefined): number {
  let id = 0;

  if (isFalsy(mid) || typeof mid !== "number")
    id = Math.floor(Math.random() * MAX_MACHINE_ID);
  else id = mid;

  verifyMachineID(id);

  return id;
}

function verifyMachineID(mid: number) {
  if (!Number.isInteger(mid))
    throw Error("Machine Id should be a decimal number");
  if (mid > MAX_MACHINE_ID)
    throw Error("Maximum value of machine id can be 2^12 - 1 (4095)");
}
