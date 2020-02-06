"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const execa_1 = __importDefault(require("execa"));
function executeJar(path, args) {
    return execa_1.default('java', ['-jar', path, ...args]);
}
exports.executeJar = executeJar;
