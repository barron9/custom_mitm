"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const yargs_parser_1 = __importDefault(require("yargs-parser"));
const chalk_1 = __importDefault(require("chalk"));
const tempy_1 = __importDefault(require("tempy"));
const patch_apk_1 = __importStar(require("./patch-apk"));
const patch_app_bundle_1 = require("./patch-app-bundle");
const apktool_1 = __importDefault(require("./tools/apktool"));
const uber_apk_signer_1 = __importDefault(require("./tools/uber-apk-signer"));
const { version } = require('../package.json');
async function main() {
    const args = yargs_parser_1.default(process.argv.slice(2), {
        string: ['apktool'],
        boolean: ['help', 'wait'],
    });
    if (args.help) {
        showHelp();
        process.exit();
    }
    const [input] = args._;
    if (!input) {
        showHelp();
        process.exit(1);
    }
    const inputPath = path_1.default.resolve(process.cwd(), input);
    const fileExtension = path_1.default.extname(input);
    const outputName = `${path_1.default.basename(input, fileExtension)}-patched${fileExtension}`;
    const outputPath = path_1.default.resolve(path_1.default.dirname(inputPath), outputName);
    let taskFunction;
    switch (fileExtension) {
        case '.apk':
            taskFunction = patch_apk_1.default;
            break;
        case '.xapk':
            taskFunction = patch_app_bundle_1.patchXapkBundle;
            break;
        case '.apks':
        case '.zip':
            taskFunction = patch_app_bundle_1.patchApksBundle;
            break;
        default:
            showSupportedExtensions();
    }
    const apktool = new apktool_1.default(args.apktool);
    showVersions({ apktool });
    const tmpDir = tempy_1.default.directory();
    console.log(chalk_1.default.dim(`  Using temporary directory:\n  ${tmpDir}\n`));
    taskFunction({ inputPath, outputPath, tmpDir, apktool, wait: args.wait }).run().then(context => {
        if (taskFunction === patch_apk_1.default && context.usesAppBundle) {
            patch_apk_1.showAppBundleWarning();
        }
        console.log(chalk_1.default `\n  {green.inverse  Done! } Patched file: {bold ./${outputName}}\n`);
    }).catch((error) => {
        console.error(chalk_1.default `\n  {red.inverse.bold  Failed! } An error occurred:\n\n`, error.toString());
        if (error.stderr)
            console.error('\n', error.stderr);
        process.exit(1);
    });
}
function showHelp() {
    console.log(chalk_1.default `
  $ {bold apk-mitm} <path-to-apk/xapk/apks>
      {dim {bold --wait} Wait for manual changes before re-encoding {gray.italic (optional)}}
      {dim {bold --apktool} Path to custom Apktool.jar {gray.italic (optional)}}
  `);
}
function showSupportedExtensions() {
    console.log(chalk_1.default `{yellow
  It looks like you tried running {bold apk-mitm} with an unsupported file type!

  Only the following file extensions are supported: {bold .apk}, {bold .xapk}, and {bold .apks} (or {bold .zip})
  }`);
    process.exit(1);
}
function showVersions({ apktool }) {
    console.log(chalk_1.default `
  {dim ╭} {blue {bold apk-mitm} v${version}}
  {dim ├ {bold apktool} ${apktool.version}
  ╰ {bold uber-apk-signer} ${uber_apk_signer_1.default.version}}
  `);
}
main();
