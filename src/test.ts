import UniqueID from './index';
import NanoTimer from 'nanotimer';
import parser from 'minimist';

const { type, time, interval } = parser(process.argv.slice(2));
const timer = new NanoTimer();
const uid = new UniqueID();

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

benchmark(time || '1s', () => uid.getUniqueID(type || 'string'));