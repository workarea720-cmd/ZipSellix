const fs = require('fs');
let code = fs.readFileSync('SettingsClient.tsx', 'utf8');

const targetStr = 'export default function SettingsClient() {';
const split = code.split(targetStr);

if (split.length < 2) {
    console.log("Could not find Target string.");
    process.exit(1);
}

let before = split[0];
let after = split[1];

// We need to extract the Tabs:
// // ── Tab 1: General ────────────────────────────────────────────────
// const GeneralTab = () => { ... };
// // ── Tab 2: Business Profile ...
// ...
// // ── Tab 5: Documents ...
// const DocumentsTab = () => { ... };

const tabsStartRegex = /\/\/ ── Tab 1: General ────────────────────────────────────────────────/;
const tabsEndRegex = /return \(\s*<div className="min-h-screen bg-\[#f8fafc\] font-sans text-slate-800">/;

const matchStart = after.match(tabsStartRegex);
const matchEnd = after.match(tabsEndRegex);

if (!matchStart || !matchEnd) {
    console.log("Could not match tab boundaries");
    process.exit(1);
}

const startIdx = matchStart.index;
const endIdx = matchEnd.index;

let extractedTabsSource = after.substring(startIdx, endIdx);

// Now, we inject `const store = useBusinessStore(); const { data: session } = useSession(); const router = useRouter();`
// into each missing tab.
const tabsToExtract = ['GeneralTab', 'BusinessTab', 'LogisticsTab', 'FinancialsTab', 'DocumentsTab'];

for (const tab of tabsToExtract) {
    const tabDef = `const ${tab} = () => {`;
    const replaceWith = `const ${tab} = () => {\n        const store = useBusinessStore();\n        const { data: session } = useSession();\n        const router = useRouter();`;
    extractedTabsSource = extractedTabsSource.replace(tabDef, replaceWith);
}

// Ensure the extracted tabs are removed from the main component body
after = after.substring(0, startIdx) + after.substring(endIdx);

const finalCode = before + extractedTabsSource + '\n' + targetStr + after;

fs.writeFileSync('SettingsClient.tsx', finalCode);
console.log("Successfully extracted tabs from SettingsClient.tsx");
