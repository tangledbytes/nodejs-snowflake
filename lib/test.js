"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = __importDefault(require("./index"));
var uid = new index_1.default();
var ID = null;
setInterval(function () {
    ID = uid.getUniqueID();
    console.log(ID, uid.getTimestampFromID(ID), uid.getMacID());
}, 1);
//# sourceMappingURL=test.js.map