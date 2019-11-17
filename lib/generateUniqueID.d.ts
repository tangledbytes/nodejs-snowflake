export declare class UniqueID {
    private CUSTOM_EPOCH;
    private MACID;
    private lastTimestamp;
    private sequence;
    constructor(customEpoch?: number);
    init(): Promise<void>;
    getUniqueID(): number;
    getTimestampFromID(id: number): number;
    getMacID(): string;
}
//# sourceMappingURL=generateUniqueID.d.ts.map