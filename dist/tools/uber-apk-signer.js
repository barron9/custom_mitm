"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const execute_jar_1 = require("../utils/execute-jar");
const observe_process_1 = __importDefault(require("../utils/observe-process"));
const jar = path.join(__dirname, '../../jar/uber-apk-signer.jar');
const uberApkSigner = {
    sign: (inputPaths, { zipalign = false } = {}) => {
        const pathArgs = [];
        for (const path of inputPaths) {
            pathArgs.push('--apks', path);
        }
        return observe_process_1.default(execute_jar_1.executeJar(jar, [
            '--allowResign',
            '--overwrite',
            ...(zipalign ? [] : ['--skipZipAlign']),
            ...pathArgs,
        ]));
    },
    version: 'v1.1.0',
};
exports.default = uberApkSigner;
