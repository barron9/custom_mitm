"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const util_1 = require("util");
exports.readFile = util_1.promisify(fs.readFile);
exports.writeFile = util_1.promisify(fs.writeFile);
exports.copyFile = util_1.promisify(fs.copyFile);
exports.exists = util_1.promisify(fs.exists);
exports.unlink = util_1.promisify(fs.unlink);
exports.rename = util_1.promisify(fs.rename);
exports.mkdirp = util_1.promisify(require('mkdirp'));
