//* Run from static dir
// This script translates event effects and uma/card names in the static english UmaMusumeLibrary.json file, using regexes and data from uma-db-translate.
import fs from "fs"
import { exit } from "process";
import { join } from "path";

const inputFile = process.argv[3] && process.argv[3] != "-" ? process.argv[3] : "libraries/UmaMusumeLibrary.json",
    outFile = process.argv[4] || inputFile,
    tlFile = "UmaMusume_EffectTranslation.json",
    umatlDir = process.argv[2],
    altMap = "tools/map.json";

if (!umatlDir) usage();

const umaDbDir = {
    skillName: join(umatlDir, "skill-name.json"),
    umas: join(umatlDir, "char-name.json"),
    titles: join(umatlDir, "uma-title.json"),
    fullCards: join(umatlDir, "support-full-name.json"),
    cardTitles: join(umatlDir, "support-title.json"),
    races: join(umatlDir, "race-name.json")
};
var umaDbData = {},
    inputData,
    tlData,
    altData;

function readFiles() {
    inputData = JSON.parse(fs.readFileSync(inputFile, "utf8"));
    tlData = JSON.parse(fs.readFileSync(tlFile, "utf8"));
    altData = JSON.parse(fs.readFileSync(altMap, "utf8"));

    // Read the required uma-db files from the data dir
    for (let [type, path] of Object.entries(umaDbDir)) {
        let data;
        try {
            data = fs.readFileSync(path, "utf8");
        }
        catch (e) {
            console.error(`Could not read ${path}: ${e}\n`);
            usage();
        }
        data = JSON.parse(data).text
        for (let k of Object.keys(data)) {
            data[k] = data[k].replace(/\\+n/, "")
        }
        umaDbData[type] = data
    }
    console.log("Files read.")
}

function translate(json, depth = 0, type = "char") {
    if (typeof json == "string") return;
    for (let [key, value] of Object.entries(json)) {
        if (key == "Effect") {
            for (let entry of tlData) {
                if (entry.skill) {
                    for (let entry of lookupSkills(value)) {
                        value = value.replace(entry.jp, entry.en);
                    }
                }
                else if (entry.race) {
                    for (let entry of lookupRaces(value)) {
                        value = value.replace(entry.jp, entry.en);
                    }
                }
                else {
                    value = value.replace(entry.regex, entry.effect);
                }
            }
            json[key] = value.replace(/^ +| +$/mg, "");
        }
        else {
            // Uma or Card name, 
            if (depth == 2) {
                let [found, translatedKey] = lookupNames(key, type);
                if (found) {
                    json[translatedKey] = value;
                    delete json[key]
                };
                key = translatedKey;
            }
            if (key == "Support") type = "card";
            else if (key == "MainStory") type = "story";
            translate(value, depth + 1, type);
        }
    }
}
function lookupSkills(str) {
    let lookup = []
    for (let [, m1, m2] of str.matchAll(/「([^a-z].+?)」|(.+?)のヒント/gi)) {
        let jpSkill = m1 || m2;
        if (!jpSkill) continue;
        let cleanedName = jpSkill.replace(/[〇◯]/, "○")
        let enSkill = umaDbData.skillName[cleanedName] || umaDbData.skillName[cleanedName + "○"];
        if (enSkill) {
            if (!m1) { enSkill = `「${enSkill}」` };
            lookup.push({ jp: jpSkill, en: enSkill });
        }
    };
    return lookup;
}

function lookupRaces(str) {
    let lookup = []
    for (let [, race, race2] of str.matchAll(/「(.+?)」|目標(?:レース)?が([^ 「]+)に(?:なる)?/gi)) {
        race = race || race2
        let enRace = umaDbData.races[race];
        if (enRace) {
            lookup.push({ jp: race, en: enRace });
        }
    };
    return lookup;
}

function lookupNames(str, type) {
    //Partial matches = found
    if (type == "story") return str;
    let title, name;
    let found = true, res;
    try {
        // Sometimes the title ([.*]) is missing, hence optional non capture group for it.
        // The bracket format is also all over the place even though the game data itself simply uses []
        [, title, name] = str.match(/(?:[【［\[](.+)[】\]］])? ?(.+)/i);
    }
    catch (e) {
        // assume it's a one-off from an edge case that fails the regex and continue...
        console.log(`Error translating ${str}\nAssuming an edge case and continuing\nError: ${e}`);
        debugger; //does nothing if not in a debug enviro
    }
    name = altData[name] || name
    let nameEN = umaDbData.umas[name]
    if (!nameEN) {
        found = false
        nameEN = name;
    }
    
    title = altData[title] || title
    let titleEN = ((type == "char") ? umaDbData.titles[`[${title}]`] : umaDbData.cardTitles[`[${title}]`])
    if (!titleEN) {
        found ||= false
        titleEN = `[${title}]`;
    }
    else found = true

    return [found, `${titleEN} ${nameEN}`];
}

function buildRegexes() {
    for (let entry of tlData) {
        entry.regex = new RegExp(entry.originEffect, "gim");
    }
}

function writeFile() {
    fs.writeFileSync(outFile, JSON.stringify(inputData, null, 2), "utf-8");
}

function usage() {
    console.log("Translates UmaMusumeLibrary.json effects and names/keys, using regexes and data from uma-db-translate project.");
    console.log("Usage:\nnode tools/autotl.js <db-translate data directory> [input file | -] [output file]");
    console.log("Input defaults to static UmaMusumeLibrary.json, Output defaults to input (overwrites)");
    console.log("As a shortcut, you can use - as input to use default, for use with custom output");
    exit();
}

console.log("Reading...");
try { readFiles(); }
catch { usage(); }
console.log("Translating...");
buildRegexes();
translate(inputData);
console.log("Writing...");
writeFile();
console.log(inputFile + " updated!");
if (outFile != inputFile) console.log("Written to " + outFile);
