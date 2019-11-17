import { getMac } from 'getmac';

interface MacID {
    macID: string;
    macIDString: string;
}

export default async (): Promise<MacID> => {
    return new Promise((resolve, reject) => {
        getMac((err: Error, macID: string) => {
            if (err) reject(err);
            resolve({ macID, macIDString: macID.split(':').join('') });
        })
    })
}