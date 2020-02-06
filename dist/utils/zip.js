"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const crossZip = __importStar(require("cross-zip"));
function zip(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        crossZip.zip(inputPath, outputPath, error => {
            if (error)
                reject(error);
            else
                resolve();
        });
    });
}
exports.zip = zip;
function unzip(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        crossZip.unzip(inputPath, outputPath, (error) => {
            if (error)
                reject(error);
            else
                resolve();
        });
    });
}
exports.unzip = unzip;
