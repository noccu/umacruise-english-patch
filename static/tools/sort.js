//* Run from static dir
// This script sorts keys in an old UmaMusumeLibrary.json file, to the order of a new one, and logs missing keys. For diffing.
// newfile = translated straight from the japanese one
// oldfile = previous translated file (static)
import fs from "fs"
import { exit } from "process";

const oldfile = process.argv[3] || "UmaMusumeLibrary.json",
    newFile = process.argv[2],
    outFile = "UmaMusumeLibrary.sorted.json";
var oldData,
    newData;
const sortedData = {};

function readFiles() {
    oldData = JSON.parse(fs.readFileSync(oldfile, "utf8"));
    newData = JSON.parse(fs.readFileSync(newFile, "utf8"));
}

// Takes new file and updates old to the same key order
function sort(newJson, oldJson, sortedJson = sortedData, depth = 0) {
    if (depth > 2) return;
    for (let [newKey, newVal] of Object.entries(newJson)) {
        let entity = oldJson[newKey]
        // Copy keys before chars/cards
        if (depth < 2) {
            sortedJson[newKey] = {};
        }
        // Copy char/card objects from old file
        // newKey = char/card name
        else if (depth == 2) {
            if (!entity) {
                let recover = attemptEntityRecovery(newVal, oldJson);
                if (recover) {
                    console.warn(`Recovered ${newKey} as ${recover.oldEntityName}\n`);
                    ({oldEntity: entity, oldEntityName: newKey} = recover);
                }
                else {
                    // Add new values after exhausting options
                    // console.log(`Adding new key: ${newKey}`);
                    entity = newVal;
                }
            }
            sortedJson[newKey] = entity;
        }
        
        // Recurse, note use of newVal is not affected by entity recovery
        sort(newVal, entity, sortedJson[newKey], depth + 1);
    }

    //This depth is the list for a given rarity -> keys = chars/cards
    if (depth == 2) {
        let oldKeys = Object.keys(oldJson),
            sortedKeys = Object.keys(sortedJson);

        //Search each file for keys missing in the other
        let missing = false;
        sortedKeys.forEach(k => { // First those missing in the old file, showing mostly new additions.
            if (!oldKeys.includes(k)) {
                if (!missing) { // Print the heading for the file once
                    console.log(`[New keys in ${outFile}]`);
                    missing = true;
                }
                console.log(`Added new key: ${k}`); // Log all missing keys
            }
        })
        if (missing) console.log(""); //newline
        missing = false;
        oldKeys.forEach(k => { // Then those missing in the new file, more often showing issues.
            if (!sortedKeys.includes(k)) {
                if (!missing) {
                    console.log(`[Missing in ${outFile} (requires checking!)]`);
                    missing = true;
                }
                console.log(`Missing key: ${k}`);
                // Most of the time it's a translation issue on the key, so let's add it and let the diff deal with it
                // It's not necessarily easier to diff but it helps prevent accidental deletions.
                // We could do this in the newData loop above but then we can't log things as nicely for checks.
                // sortedJson[k] = oldJson[k];
            }
        })
        if (missing) console.log(""); //newline
    }
}

//If a char/card key isn't found in previous data, check if it isn't a translation/data error.
function attemptEntityRecovery(newEntity, oldEntityList) {
    // List event names
    let matchEvents = newEntity.Event.map(ev => Object.keys(ev)[0])
        // Go through old char/cards
        for (let [oldEntityName, oldEntity] of Object.entries(oldEntityList)) {
            // Go through each's event array
            let matches = 0,
                i = 0, max = oldEntity.Event.length / 3;
            for (let event of oldEntity.Event) {
                // Check if the first event's name exists in our new list
                if (i > max && matches / i < 0.5) break;
                let eventName = Object.keys(event)[0]
                if (matchEvents.includes(eventName)) {
                    matches++;
                }
                i++;
            }
            if (matches / matchEvents.length > 0.8) return {oldEntity, oldEntityName};
        }
        return;
}

function writeFile() {
    fs.writeFileSync(outFile, JSON.stringify(sortedData, null, 2), "utf-8");
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
