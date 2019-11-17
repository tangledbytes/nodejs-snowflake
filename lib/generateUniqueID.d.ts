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
export declare class UniqueID {
    private _CUSTOM_EPOCH;
    private _MACID;
    private _lastTimestamp;
    private _sequence;
    private _FORMATTEDMACID;
    constructor(customEpoch?: number);
    /**
     * Initialise the mac id for internal computations
     */
    init(): Promise<void>;
    /**
     * Generates a unique time sortable 64 bit number using native code
     * @returns {number} The unique id
     */
    getUniqueID(): number;
    /**
     * Retrieves the epoch/unix timestamp at which the ID was generated
     * irrespective of the machine it was generated on, PROVIDED no or same
     * custom epoch was used in generation
     * @param id {number} id generated through getUniqueID method
     * @returns {number} timestamp of id creations
     */
    getTimestampFromID(id: number): number;
    getMacID(): string;
}
//# sourceMappingURL=generateUniqueID.d.ts.map