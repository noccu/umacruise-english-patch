//* Run from static dir
// This script translates event effects and uma/card names in the static english UmaMusumeLibrary.json file, using regexes and data from uma-db-translate.
import csvParser from "csv-parse/lib/sync.js"
import fs from "fs"
import { exit } from "process";
import { dirname, join } from "path";

const inputFile = process.argv[3] && process.argv[3] != "-" ? process.argv[3] : "UmaMusumeLibrary.json",
    outFile = process.argv[4] || inputFile,
    tlFile = "../UmaMusume_EffectTranslation.json",
    dbTranslateDir = process.argv[2];

if (!dbTranslateDir) usage();

const umaDbDir = {
    skillName: join(dbTranslateDir, "skill-name.csv"),
    umas: join(dbTranslateDir, "uma-name.csv"),
    titles: join(dbTranslateDir, "uma-title.csv"),
    fullCards: join(dbTranslateDir, "support-full-name.csv"),
    cardTitles: join(dbTranslateDir, "support-title.csv"),
    races: join(dbTranslateDir, "race-name.csv")
};
var umaDbData = {},
    inputData,
    tlData;

function readFiles() {
    inputData = JSON.parse(fs.readFileSync(inputFile, "utf8"));
    tlData = JSON.parse(fs.readFileSync(tlFile, "utf8"));

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
        umaDbData[type] = {};
        csvParser(data, {
            columns: true,
            escape: "\\",
            trim: true,
            skip_empty_lines: true,
            on_record: (rec) => {
                umaDbData[type][rec.text] = rec.translation;
                return null;
            }
        });
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
            json[key] = value;
        }
        else {
            // Uma or Card name, 
            if (depth == 2) {
                let translatedKey = lookupNames(key, type);
                if (key != translatedKey) {
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
        let enSkill = umaDbData.skillName[jpSkill.replace(/[〇◯]/, "○")];
        if (enSkill) {
            if (!m1) { enSkill = `「${enSkill}」` };
            lookup.push({ jp: jpSkill, en: enSkill });
        }
    };
    return lookup;
}

function lookupRaces(str) {
    let lookup = []
    for (let [, race] of str.matchAll(/「(.*?)」/gi)) {
        let enRace = umaDbData.races[race];
        if (enRace) {
            lookup.push({ jp: race, en: enRace });
        }
    };
    return lookup;
}

function lookupNames(str, type) {
    //this function is a mess because of all the edge cases I had to deal with
    if (type == "story") return str;
    let title, name;
    try {
        // Sometimes the title ([.*]) is missing, hence optional non capture group for it.
        // The bracket format is also all over the place even though the game data itself simply uses []
        [, title, name] = str.match(/(?:[【［\[](.+)[】\]］])? ?(.+)/i);
    }
    catch (e) {
        // assume it's a one-off from an edge case that fails the regex and continue...
        console.log(`Error transating ${str}\nAssuming an edge case and continuing\nError: ${e}`);
        debugger; //does nothing if not in a debug enviro
    }
    let nameEN = umaDbData.umas[name] || name;
    
    if (type == "char") {
        let titleEN = umaDbData.titles[`[${title}]`] || `[${title}]`;
        return `${titleEN} ${nameEN}`;
    }
    else { //cards
        let fullName = umaDbData.fullCards[`[${title}]${name}`];
        if (fullName) return fullName;
        else {
            let cardTitle = umaDbData.cardTitles[`[${title}]`] || `[${title}]`;
            let res = str.replace(name, nameEN);
            if (cardTitle) {
                res = res.replace(`［${title}］`, cardTitle + " ");
            }
            return res;
        }
    }
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
