import { networkInterfaces, platform } from 'os';
const macRegex = /(?:[a-z0-9]{1,2}[:-]){5}[a-z0-9]{1,2}/i;

function getMac(): string {
    const interfaces = networkInterfaces()
    for (const key in interfaces) {
        for (const val of interfaces[key]) {
            if (!val.internal && macRegex.test(val.mac)) return val.mac;
        }
    }
    throw new Error('failed to get the MAC address');
}

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
 * @returns {MacID} An object containing macID and 
 * special representation of it
 */
const getMacID = (): MacID => {
    const macID = getMac();
    const splitCharacter = platform() === 'win32' ? '-' : ':';
    return { macID, macIDString: macID.split(splitCharacter).join('') }
}

export { getMacID };

export default getMacID;