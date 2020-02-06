"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const operators_1 = require("rxjs/operators");
const chalk_1 = __importDefault(require("chalk"));
const execute_jar_1 = require("../utils/execute-jar");
const observe_process_1 = __importDefault(require("../utils/observe-process"));
const defaultPath = path_1.join(__dirname, '../../jar/apktool.jar');
class Apktool {
    constructor(customPath) {
        this.customPath = customPath;
    }
    decode(inputPath, outputPath) {
        return this.run([
            'decode', inputPath,
            '--output', outputPath,
        ]);
    }
    encode(inputPath, outputPath, useAapt2) {
        return this.run([
            'build', inputPath,
            '--output', outputPath,
            ...(useAapt2 ? ['--use-aapt2'] : []),
        ]);
    }
    run(args) {
        return operators_1.map((line) => line.replace(/I: /g, ''))(observe_process_1.default(execute_jar_1.executeJar(this.path, args)));
    }
    get path() {
        return this.customPath || defaultPath;
    }
    get version() {
        return this.customPath ? chalk_1.default.italic('custom version') : Apktool.version;
    }
}
exports.default = Apktool;
Apktool.version = 'v2.4.1';
