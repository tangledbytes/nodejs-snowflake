"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = __importDefault(require("./index"));
var nanotimer_1 = __importDefault(require("nanotimer"));
var timer = new nanotimer_1.default();
var uid = new index_1.default();
var benchmark = function (totalTime, Function) {
    var times = 0;
    timer.setInterval(function () {
        times++;
        Function();
    }, '', '1u');
    timer.setTimeout(function (timer) {
        timer.clearInterval();
        console.log('[TOTAL ITERATIONS]:', times);
    }, [timer], totalTime);
};
// benchmark('1s', () => uid.getUniqueID('number'));
benchmark('10s', function () { return uid.getUniqueID(); });
//# sourceMappingURL=test.js.map