const UniqueID = require('./generateUniqueID');

const generator = new UniqueID();

(async () => {
    await generator.init();
    setInterval(() => console.log(generator.getUniqueID()), 1);
})()