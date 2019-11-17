const { nextID, getTimestamp } = require('../build/Release/snowflake');
import getMacID from './getMacID'

const SEQUENCE_BITS = 12;
const CUSTOM_EPOCH = 1546300800000; // 01-01-2019
const maxSequence = Math.pow(2, SEQUENCE_BITS) - 1;

export class UniqueID {
    private CUSTOM_EPOCH: number;
    private MACID: string = '';
    private lastTimestamp = CUSTOM_EPOCH;
    private sequence = 0;

    constructor(customEpoch?: number) {
        this.CUSTOM_EPOCH = customEpoch || CUSTOM_EPOCH;
    }

    async init() {
        const value = await getMacID();
        this.MACID = value.macIDString;
    }

    getUniqueID(): number {
        if (this.MACID) {
            const currentTimestamp = Date.now();
            const customCurrentTimeStamp = currentTimestamp - this.CUSTOM_EPOCH;
            const customLastTimestamp = this.lastTimestamp - this.CUSTOM_EPOCH;
            if (customCurrentTimeStamp === customLastTimestamp) {
                this.sequence = (this.sequence + 1) & maxSequence;
                if (this.sequence === 0) {
                    return this.getUniqueID();
                }
            }
            else {
                this.sequence = 0;
            }

            this.lastTimestamp = currentTimestamp;

            return nextID(customCurrentTimeStamp, customLastTimestamp, this.sequence, this.MACID);
        }
        else {
            throw new Error('Uninitialised class');
        }
    }

    getTimestampFromID(id: number): number {
        return getTimestamp(id);
    }

    getMacID(): string {
        return this.MACID;
    }
}