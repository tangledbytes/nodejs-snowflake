const { nextID } = require('./build/Release/snowflake.node');
const { getMac } = require('getmac');

let MACID = null;
let lastTimestamp = 1546300800000;
const CUSTOM_EPOCH = 1546300800000; // 01-01-2019
let sequence = 0;
const maxSequence = (2 ** 12) - 1

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
    console.log(nextID(currentTimestamp, lastTimestamp, sequence, macID));
    lastTimestamp = currentTimestamp;
}