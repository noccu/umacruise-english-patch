//* Run from static dir
import csvParser from "csv-parse/lib/sync.js"
import fs from "fs"
import { exit } from "process";
import {dirname, join} from "path";

var inputFile = process.argv[3] || "UmaMusumeLibrary.json",
    tlFile = process.argv[4] || "../UmaMusume_EffectTranslation.json",
    skillFile = process.argv[2], //single arg usage = skill file
    inputData,
    tlData,
    skillData = {};

function readFiles() {
    inputData = JSON.parse(fs.readFileSync(inputFile, "utf8"));
    tlData = JSON.parse(fs.readFileSync(tlFile, "utf8"));
    if (skillFile) {
        csvParser(fs.readFileSync(skillFile, "utf8"), {
                columns: true, 
                escape: "\\", 
                trim: true, 
                skip_empty_lines: true, 
                on_record: (rec) => {
                    skillData[rec.text] = rec.translation;
                    return null;
                }
            });
    }
    console.log("Files read.")
}

function translate(json) {
    if (typeof json == "string") return;
    for (let [key, value] of Object.entries(json)) {
        if (key == "Effect") {
            //translate skills first so we can match the japanese
            if (skillFile) {
                for (let entry of lookupSkills(value)) {
                    value = value.replace(entry.jp, entry.en);
                }
            }
            for (let entry of tlData) {
                value = value.replace(entry.regex, entry.effect);
            }
            json[key] = value;
        }
        else {
            translate(value);
        }
    }
}
function lookupSkills(str) {
    let lookup = []
    for (let [, jpSkill] of str.matchAll(/「([^a-z].*?)」の?ヒント/gi)) {
        let enSkill = skillData[jpSkill.replace("〇", "○")];
        if (enSkill) {
            lookup.push({jp: jpSkill, en: enSkill});
        }
    };
    return lookup;
}

function buildRegexes() {
    for (let entry of tlData) {
        // entry.regex = new RegExp(`(?<=effect.*)${entry.originEffect}`, "gi");
        entry.regex = new RegExp(entry.originEffect, "gim");
    }
}

function writeFile() {
    fs.writeFileSync(join(dirname(inputFile), "UmaMusumeLibrary.json"), JSON.stringify(inputData, null, 2), "utf-8");
}

fs.access(inputFile, err => {
    if (err) {
        console.log("Usage:\nnode autotl.js [<(EN - db-translate) skill-name.csv>] [<UmaMusumeLibrary.json>] [<UmaMusume_EffectTranslation.json>]");
        exit();
    }
});

console.log("Reading...");
readFiles();
console.log("Translating...");
buildRegexes();
translate(inputData);
console.log("Writing...");
writeFile();
console.log(inputFile + " updated!");
