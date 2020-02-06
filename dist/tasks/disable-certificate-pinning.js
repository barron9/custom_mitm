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
const fs = __importStar(require("../utils/fs"));
const globby_1 = __importDefault(require("globby"));
const replace_string_1 = __importDefault(require("replace-string"));
const rxjs_1 = require("rxjs");
const methodSignatures = [
    '.method public checkClientTrusted([Ljava/security/cert/X509Certificate;Ljava/lang/String;)V',
    '.method public final checkClientTrusted([Ljava/security/cert/X509Certificate;Ljava/lang/String;)V',
    '.method public checkServerTrusted([Ljava/security/cert/X509Certificate;Ljava/lang/String;)V',
    '.method public final checkServerTrusted([Ljava/security/cert/X509Certificate;Ljava/lang/String;)V',
    '.method public getAcceptedIssuers()[Ljava/security/cert/X509Certificate;',
    '.method public final getAcceptedIssuers()[Ljava/security/cert/X509Certificate;',
];
async function disableCertificatePinning(directoryPath, task) {
    return new rxjs_1.Observable(observer => {
        (async () => {
            observer.next('Finding smali files...');
            const smaliFiles = await globby_1.default(path.join(directoryPath, 'smali*/**/*.smali'));
            let pinningFound = false;
            for (const filePath of smaliFiles) {
                observer.next(`Scanning ${path.basename(filePath)}...`);
                const originalContent = await fs.readFile(filePath, 'utf-8');
                let patchedContent = originalContent;
                for (const signature of methodSignatures) {
                    patchedContent = replace_string_1.default(patchedContent, signature, `${signature}\n    return-void`);
                }
                if (originalContent !== patchedContent) {
                    pinningFound = true;
                    await fs.writeFile(filePath, patchedContent);
                }
            }
            if (!pinningFound)
                task.skip('No certificate pinning logic found.');
            observer.complete();
        })();
    });
}
exports.default = disableCertificatePinning;
