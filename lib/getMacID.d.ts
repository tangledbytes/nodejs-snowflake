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
declare const getMacID: () => MacID;
export { getMacID };
export default getMacID;
//# sourceMappingURL=getMacID.d.ts.map