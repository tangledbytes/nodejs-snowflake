// const { UniqueID } = require('./generateUniqueID');
import { UniqueID } from './generateUniqueID';

const generator = new UniqueID();

(async () => {
    await generator.init();
    setInterval(() => console.log(generator.getUniqueID()), 1);
})()