//* Run from static dir
// This script sorts keys in an old UmaMusumeLibrary.json file, to the order of a new one, and logs missing keys. For diffing.
// newfile = translated straight from the japanese one
// oldfile = previous translated file (static)
import fs from "fs"
import { exit } from "process";

const oldfile = process.argv[3] || "UmaMusumeLibrary.json",
    newFile = process.argv[2];
var oldData,
    newData;
var sortedData = {};

function readFiles() {
    oldData = JSON.parse(fs.readFileSync(oldfile, "utf8"));
    newData = JSON.parse(fs.readFileSync(newFile, "utf8"));
}

//takes new file and updates old to the same key order
function sort(newJson, oldJson, sortedJson = sortedData, depth = 0) {
    if (depth > 2) return;
    for (let [newKey, newVal] of Object.entries(newJson)) {
        if (depth < 2) {
            sortedJson[newKey] = {};
        }
        // Uma or Card name
        else if (depth == 2) {
            sortedJson[newKey] = oldJson[newKey];
        }

        sort(newVal, oldJson[newKey], sortedJson[newKey], depth + 1);
    }

    //rarity, keys = umas or cards
    if (depth == 2) {
        let oldKeys = Object.keys(oldJson),
            sortedKeys = Object.keys(sortedJson);
        // if (oldKeys.length != sortedKeys.length) {
        //     console.warn("len mismatch");
        // }
        let missing = false;
        sortedKeys.forEach(k => {
            if (!oldKeys.includes(k)) {
                if (!missing) {
                    console.log(`[Missing in ${oldfile}]`);
                    missing = true;
                }
                console.log(`Missing key: ${k}`);
            }
        })
        if (missing) console.log(""); //newline
        missing = false;
        oldKeys.forEach(k => {
            if (!sortedKeys.includes(k)) {
                if (!missing) {
                    console.log(`[Missing in ${newFile}]`);
                    missing = true;
                }
                console.log(`Missing key: ${k}`);
            }
        })
        if (missing) console.log(""); //newline
    }
}

function writeFile() {
    fs.writeFileSync("UmaMusumeLibrary.sorted.json", JSON.stringify(sortedData, null, 2), "utf-8");
}

//* Main
if (!oldfile || !newFile) {
    console.log("Sorts and checks for missing keys between new and old UmaMusumeLibrary.json files.\nBoth files should be translated.\nWrites sorted output to UmaMusumeLibrary.sorted.json.\n")
    console.log("Usage:\nnode tools/sort.js <(new) UmaMusumeLibrary.json> [<(old) UmaMusumeLibrary.json>]");
    console.log("Old file defaults to static UmaMusumeLibrary.json");
    exit();
}

console.log("Reading...");
readFiles();
console.log("Sorting...");
sort(newData, oldData);
console.log("Writing...");
writeFile();
console.log("Sorted!");
