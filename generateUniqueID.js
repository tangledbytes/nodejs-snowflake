const { nextID, getTimestamp } = require('./build/Release/snowflake.node');
const getMacID = require('./getMacID');

const SEQUENCE_BITS = 12;
const CUSTOM_EPOCH = 1546300800000; // 01-01-2019
const maxSequence = Math.pow(2, SEQUENCE_BITS) - 1;

class UniqueID {
    constructor(customEpoch) {
        this.CUSTOM_EPOCH = customEpoch || CUSTOM_EPOCH;
    }

    async init() {
        const value = await getMacID();
        this.MACID = value.macIDString;
        this.lastTimestamp = CUSTOM_EPOCH;
        this.sequence = 0;
    }

    getUniqueID() {
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

    getTimestampFromID(id) {
        return getTimestamp(id);
    }

    getMacID() {
        return this.MACID;
    }
}

module.exports = UniqueID;