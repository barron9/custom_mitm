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
const fs = __importStar(require("./utils/fs"));
const rxjs_1 = require("rxjs");
const listr_1 = __importDefault(require("listr"));
const chalk_1 = __importDefault(require("chalk"));
const modify_manifest_1 = __importDefault(require("./tasks/modify-manifest"));
const modify_netsec_config_1 = __importDefault(require("./tasks/modify-netsec-config"));
const disable_certificate_pinning_1 = __importDefault(require("./tasks/disable-certificate-pinning"));
const uber_apk_signer_1 = __importDefault(require("./tools/uber-apk-signer"));
function patchApk({ inputPath, outputPath, tmpDir, apktool, wait }) {
    const decodeDir = path.join(tmpDir, 'decode');
    const tmpApkPath = path.join(tmpDir, 'tmp.apk');
    let fallBackToAapt = false;
    let nscName;
    return new listr_1.default([
        {
            title: 'Decoding APK file',
            task: () => apktool.decode(inputPath, decodeDir),
        },
        {
            title: 'Modifying app manifest',
            task: async (context) => {
                const result = await modify_manifest_1.default(path.join(decodeDir, 'AndroidManifest.xml'));
                nscName = result.nscName;
                context.usesAppBundle = result.usesAppBundle;
            },
        },
        {
            title: 'Modifying network security config',
            task: () => modify_netsec_config_1.default(path.join(decodeDir, `res/xml/${nscName}.xml`)),
        },
        {
            title: 'Disabling certificate pinning',
            task: (_, task) => disable_certificate_pinning_1.default(decodeDir, task),
        },
        {
            title: 'Waiting for you to make changes',
            enabled: () => wait,
            task: (_) => {
                return new rxjs_1.Observable(subscriber => {
                    process.stdin.setEncoding('utf-8');
                    process.stdin.setRawMode(true);
                    subscriber.next("Press any key to continue.");
                    process.stdin.once('data', () => {
                        subscriber.complete();
                        process.stdin.setRawMode(false);
                        process.stdin.pause();
                    });
                });
            },
        },
        {
            title: 'Encoding patched APK file',
            task: () => new listr_1.default([
                {
                    title: 'Encoding using AAPT2',
                    task: (_, task) => new rxjs_1.Observable(subscriber => {
                        apktool.encode(decodeDir, tmpApkPath, true).subscribe(line => subscriber.next(line), () => {
                            subscriber.complete();
                            task.skip('Failed, falling back to AAPT...');
                            fallBackToAapt = true;
                        }, () => subscriber.complete());
                    }),
                },
                {
                    title: chalk_1.default `Encoding using AAPT {dim [fallback]}`,
                    skip: () => !fallBackToAapt,
                    task: () => apktool.encode(decodeDir, tmpApkPath, false),
                },
            ])
        },
        {
            title: 'Signing patched APK file',
            task: () => new rxjs_1.Observable(subscriber => {
                (async () => {
                    await uber_apk_signer_1.default
                        .sign([tmpApkPath], { zipalign: true })
                        .forEach(line => subscriber.next(line));
                    await fs.copyFile(tmpApkPath, outputPath);
                    subscriber.complete();
                })();
            }),
        },
    ]);
}
exports.default = patchApk;
function showAppBundleWarning() {
    console.log(chalk_1.default `{yellow
  {inverse.bold  WARNING }

  This app seems to be using {bold Android App Bundle} which means that you
  will likely run into problems installing it. That's because this app
  is made out of {bold multiple APK files} and you've only got one of them.

  If you want to patch an app like this with {bold apk-mitm}, you'll have to
  supply it with all the APKs. You have two options for doing this:

  – download a {bold *.xapk} file {dim (for example from https://apkpure.com​)}
  – export a {bold *.apks} file {dim (using https://github.com/Aefyr/SAI​)}

  You can then run {bold apk-mitm} again with that file to patch the bundle.}`);
}
exports.showAppBundleWarning = showAppBundleWarning;
