import UniqueID from './index';
import NanoTimer from 'nanotimer';
import parser from 'minimist';

const { type, time, interval, v: verbose } = parser(process.argv.slice(2));
const timer = new NanoTimer();
const uid = new UniqueID({
    returnNumber: type === "number" || type === "num"
});

const benchmark = (totalTime: string, Function: Function) => {
    console.log('[STARTING]')
    let times = 0;
    timer.setInterval(() => {
        times++;
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

benchmark(time || '1s', benchmarkFunction());