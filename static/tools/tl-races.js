import csvParser from "csv-parse/lib/sync.js"
import fs from "fs"
import { exit } from "process";
import {dirname, join} from "path";

var inputFile = process.argv[2],
    refFile = process.argv[3],
    inputData,
    refData = {};

function readFiles() {
    inputData = JSON.parse(fs.readFileSync(inputFile, "utf8"));
    csvParser(fs.readFileSync(refFile, "utf8"), {columns: true, escape: "\\", trim: true, skip_empty_lines: true, from: 3, on_record: parseRecords});
    console.log("Files read.")
}
function parseRecords (rec, ctx) {
    refData[rec.text] = rec.translation;
    return null;
}

function translate() {
    let races = inputData["Race"];
    let grade = Object.entries(races);

    grade.forEach(([grade, racesArr]) => {
        racesArr.forEach(race => {
            let name = race["Name"];
            race["Name"] = refData[name] || name;
        });
    });
}

function writeFile() {
    fs.writeFileSync(join(dirname(inputFile), "en/RaceDataLibrary.json"), JSON.stringify(inputData), "utf-8");
}

if (!refFile) {
    console.log("Usage:\nnode tl-races.js <(JP-UmaCruise)RaceDataLibrary.json> <(EN-db-patch)race-name.csv>");
    exit();
}

console.log("Reading...");
readFiles();
console.log("Translating...");
translate();
console.log("Writing...");
writeFile();