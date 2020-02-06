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
const fs = __importStar(require("../utils/fs"));
const xml_js_1 = __importDefault(require("xml-js"));
async function modifyManifest(path) {
    const fileXml = xml_js_1.default.xml2js(await fs.readFile(path, 'utf-8'), { compact: true, alwaysArray: true });
    const manifest = fileXml['manifest'][0];
    const application = manifest['application'][0];
    application._attributes['android:debuggable'] = 'false';
    let nscName = 'network_security_config';
    const nscReference = application._attributes['android:networkSecurityConfig'];
    if (nscReference && nscReference.startsWith('@xml/')) {
        nscName = nscReference.slice(5);
    }
    else {
        application._attributes['android:networkSecurityConfig'] = `@xml/${nscName}`;
    }
    const usesAppBundle = application['meta-data'] && application['meta-data']
        .some((meta) => meta._attributes['android:name'] === 'com.android.vending.splits');
    await fs.writeFile(path, xml_js_1.default.js2xml(fileXml, { compact: true, spaces: 4 }));
    return { nscName, usesAppBundle };
}
exports.default = modifyManifest;
