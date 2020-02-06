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
const cross_zip_1 = require("@tybys/cross-zip");
const rxjs_1 = require("rxjs");
const fs = __importStar(require("./utils/fs"));
const path = __importStar(require("path"));
const globby_1 = __importDefault(require("globby"));
const listr_1 = __importDefault(require("listr"));
const uber_apk_signer_1 = __importDefault(require("./tools/uber-apk-signer"));
const patch_apk_1 = __importDefault(require("./patch-apk"));
function patchXapkBundle(options) {
    return patchAppBundle(options, { isXapk: true });
}
exports.patchXapkBundle = patchXapkBundle;
function patchApksBundle(options) {
    return patchAppBundle(options, { isXapk: false });
}
exports.patchApksBundle = patchApksBundle;
function patchAppBundle({ inputPath, outputPath, tmpDir, apktool, wait }, { isXapk }) {
    const bundleDir = path.join(tmpDir, 'bundle');
    let baseApkPath = path.join(bundleDir, 'base.apk');
    return new listr_1.default([
        {
            title: 'Extracting APKs',
            task: () => cross_zip_1.unzip(inputPath, bundleDir),
        },
        ...(isXapk ? [{
                title: 'Finding base APK path',
                task: async () => {
                    const manifestPath = path.join(bundleDir, 'manifest.json');
                    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
                    const manifest = JSON.parse(manifestContent);
                    baseApkPath = path.join(bundleDir, getXapkBaseName(manifest));
                },
            }] : []),
        {
            title: 'Patching base APK',
            task: () => patch_apk_1.default({
                inputPath: baseApkPath, outputPath: baseApkPath,
                tmpDir: path.join(tmpDir, 'base-apk'), apktool, wait,
            }),
        },
        {
            title: 'Signing APKs',
            task: () => new rxjs_1.Observable(subscriber => {
                (async () => {
                    const apkFiles = await globby_1.default(path.join(bundleDir, '**/*.apk'));
                    await uber_apk_signer_1.default
                        .sign(apkFiles, { zipalign: false })
                        .forEach(line => subscriber.next(line));
                    subscriber.complete();
                })();
            }),
        },
        {
            title: 'Compressing APKs',
            task: () => cross_zip_1.zip(bundleDir, outputPath),
        },
    ]);
}
function getXapkBaseName(manifest) {
    if (manifest.split_apks) {
        return manifest.split_apks
            .filter((apk) => apk.id === 'base')[0].file;
    }
    return `${manifest.package_name}.apk`;
}
