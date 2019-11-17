const { getMac } = require('getmac');

module.exports = async () => {
    return new Promise((resolve, reject) => {
        getMac((err, macID) => {
            if (err) reject(err);
            resolve({ macID, macIDString: MACID = macID.split(':').join('') });
        })
    })
}