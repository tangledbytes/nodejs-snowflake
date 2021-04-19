export default (value: any): boolean => {
    if (value === undefined) return true;
    if (isNaN(value)) return true;
    if (Array.isArray(value) && !value.length) return true;
    if (value === "") return true;
    if (value === null) return true;

    return false
}