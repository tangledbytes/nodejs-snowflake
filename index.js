const { nextID } = require('./build/Release/snowflake.node');
const { getMac } = require('getmac');

const SEQUENCE_BITS = 12;
const CUSTOM_EPOCH = 1546300800000; // 01-01-2019
const maxSequence = (2 ** SEQUENCE_BITS) - 1

let sequence = 0;
let lastTimestamp = 1546300800000;
let MACID = null;

getMac((err, macAddress) => {
    if (err) throw new Error(err);
    MACID = macAddress.split(':').join('');
    setInterval(() => sendRequest(Date.now(), MACID), 1);
});

const sendRequest = (currentTimestamp, macID) => {
    currentTimestamp -= CUSTOM_EPOCH;
    if (currentTimestamp === lastTimestamp) {
        sequence = (sequence + 1) & maxSequence;
        if (sequence == 0) {
            return sendRequest(Date.now(), macID);
        }
    }
    else {
        sequence = 0;
    }

    lastTimestamp = currentTimestamp;

    return nextID(currentTimestamp, lastTimestamp, sequence, macID);
}