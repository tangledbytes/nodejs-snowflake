import UniqueID from './index';

const uid = new UniqueID();
let ID = null;

setInterval(() => {
    ID = uid.getUniqueID();
    console.log(ID, uid.getTimestampFromID(ID), uid.getMacID());
}, 1)