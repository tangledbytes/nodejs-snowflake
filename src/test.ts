import UniqueID from './index';
import NanoTimer from 'nanotimer';

const timer = new NanoTimer();

const uid = new UniqueID();

const benchmark = (totalTime: string, Function: Function) => {
    let times = 0;
    timer.setInterval(() => {
        times++;
        Function();
    }, '', '1u');
    timer.setTimeout((timer: any) => {
        timer.clearInterval();
        console.log('[TOTAL ITERATIONS]:', times);
    }, [timer], totalTime)
}

// benchmark('1s', () => uid.getUniqueID('number'));
benchmark('10s', () => uid.getUniqueID());