import { getMac } from 'getmac';

interface MacID {
    /**
     * MACID of the machine 
     */
    macID: string;
    /**
     * Special format of MACID without colons
     * @example
     * MACID -> "02:aa:43:56:a4:67" -> "02aa4356a467"
     */
    macIDString: string;
}

/**
 * Asynchronous function returns mac address of the machine
 * @returns {Promise<MacID>} A promise to an object containing macID and 
 * special representation of it
 */
const getMacID = async (): Promise<MacID> => {
    return new Promise((resolve, reject) => {
        getMac((err: Error, macID: string) => {
            if (err) reject(err);
            resolve({ macID, macIDString: macID.split(':').join('') });
        })
    })
}

export { getMacID };

export default getMacID;