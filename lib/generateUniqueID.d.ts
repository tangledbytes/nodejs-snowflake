declare type return_type = 'string' | 'number';
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
export declare class UniqueID {
    private _CUSTOM_EPOCH;
    private _MACID;
    private _lastTimestamp;
    private _sequence;
    private _FORMATTEDMACID;
    constructor(customEpoch?: number);
    /**
     * Generates a unique time sortable 64 bit number using native code
     * @returns {string | number} the unique id
     */
    getUniqueID(return_type?: return_type): string | number;
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
export {};
//# sourceMappingURL=generateUniqueID.d.ts.map