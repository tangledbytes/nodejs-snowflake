"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = __importDefault(require("./index"));
var nanotimer_1 = __importDefault(require("nanotimer"));
var minimist_1 = __importDefault(require("minimist"));
var _a = minimist_1.default(process.argv.slice(2)), type = _a.type, time = _a.time, interval = _a.interval, verbose = _a.v, metadata = _a.metadata, demoonly = _a.demoonly;
var timer = new nanotimer_1.default();
var uid = new index_1.default({
    returnNumber: type === "number" || type === "num",
    machineID: Number(process.env.MACHINE_ID)
});
var benchmark = function (totalTime, Function) {
    console.log('[STARTING]');
    var times = 0;
    timer.setInterval(function () {
        times += 1;
        Function();
    }, '', interval || '1u');
    timer.setTimeout(function (timer) {
        timer.clearInterval();
        console.log('[TOTAL ITERATIONS]:', times);
    }, [timer], totalTime);
};
var benchmarkFunction = function () {
    if (verbose)
        return function () { return console.log(uid.getUniqueID()); };
    else
        return function () { return uid.getUniqueID(); };
};
if (demoonly) {
    console.log(uid.getUniqueID());
}
else if (metadata) {
    console.log(uid.getMachineIDFromID(metadata), uid.getTimestampFromID(metadata));
}
else {
    benchmark(time || '1s', benchmarkFunction());
}
//# sourceMappingURL=test.js.map