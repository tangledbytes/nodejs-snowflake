import UniqueID from './index';
import NanoTimer from 'nanotimer';
import parser from 'minimist';

const { type, time, interval, v: verbose, metadata, demoonly } = parser(process.argv.slice(2));
const timer = new NanoTimer();
const uid = new UniqueID({
    returnNumber: type === "number" || type === "num",
    machineID: Number(process.env.MACHINE_ID)
});

const benchmark = (totalTime: string, Function: Function) => {
    console.log('[STARTING]')
    let times = 0;
    timer.setInterval(() => {
        times += 1;
        Function();
    }, '', interval || '1u');
    timer.setTimeout((timer: any) => {
        timer.clearInterval();
        console.log('[TOTAL ITERATIONS]:', times);
    }, [timer], totalTime)
}

const benchmarkFunction = () => {
    if (verbose) return () => console.log(uid.getUniqueID());
    else return () => uid.getUniqueID()
}

if (demoonly) {
    console.log(uid.getUniqueID())
} else if (metadata) {
    console.log(uid.getMachineIDFromID(metadata), uid.getTimestampFromID(metadata))
} else {
    benchmark(time || '1s', benchmarkFunction());
}