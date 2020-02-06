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
const path_1 = require("path");
const xml_js_1 = __importDefault(require("xml-js"));
const DEFAULT_CONFIG = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
<base-config>
<trust-anchors>
    <certificates src="system" />
    <certificates src="user" />
</trust-anchors>
</base-config>
    <debug-overrides>
        <trust-anchors>
            <certificates src="user" />
            <certificates src="system" />
        </trust-anchors>
    </debug-overrides>
</network-security-config>`;
async function modifyNetworkSecurityConfig(path) {
    if (!(await fs.exists(path))) {
        await fs.mkdirp(path_1.dirname(path));
        await fs.writeFile(path, DEFAULT_CONFIG);
        return;
    }
    const fileXml = xml_js_1.default.xml2js(await fs.readFile(path, 'utf-8'), { compact: true, alwaysArray: true });
    const config = fileXml['network-security-config'][0];
    // Remove certificate pinning rules
    // See https://developer.android.com/training/articles/security-config#pin-set
    delete config['pin-set'];
    const overrides = (config['debug-overrides'] || (config['debug-overrides'] = [{}]))[0];
    const trustAnchors = (overrides['trust-anchors'] || (overrides['trust-anchors'] = [{}]))[0];
    const certificates = trustAnchors['certificates'] || (trustAnchors['certificates'] = []);
    if (!certificates.filter((c) => c._attributes.src === 'user').length) {
        certificates.push({ _attributes: { src: 'user' } });
    }
    await fs.writeFile(path, xml_js_1.default.js2xml(fileXml, { compact: true, spaces: 4 }));
}
exports.default = modifyNetworkSecurityConfig;
