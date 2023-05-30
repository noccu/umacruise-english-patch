import fs from "fs/promises";
import { exit } from "process";

var jpFile = process.argv[2];
var enFile = process.argv[3];

function findEvents(json, compareObj) {
    let events = {};

    for (let [key, value] of Object.entries(json)) {
        if (key == "Event") {
            value.forEach(eventObj => {
                if (compareObj) {
                    let name = Object.keys(eventObj)[0];
                    if (!Object.hasOwn(compareObj, name)) {
                        console.log(name);
                        Object.assign(events, eventObj);
                    }
                }
                else {
                    Object.assign(events, eventObj);
                    // return value
                }
            });
        }
        else {
            // findEvents(json[key]);
            Object.assign(events, findEvents(json[key], compareObj));
        }
    }

    return events;
}

async function readFiles() {
    jpFile = await fs.readFile(jpFile, "utf8").then(s => JSON.parse(s));
    enFile = await fs.readFile(enFile, "utf8").then(s => JSON.parse(s));
    console.log("Files read.")
}

if (!jpFile || !enFile) {
    console.log("Usage:\nnode tl-update-check.js JP-File.json EN-File.json");
    exit();
}
console.log("Starting...");
readFiles().then(x => {
    if (typeof jpFile == "object" && typeof enFile == "object") {
        console.log("Parsing EN file");
        enFile = findEvents(enFile);
        console.log("Looking for new events in JP file");
        let e = findEvents(jpFile, enFile);
        if (!Object.keys(e).length) { console.log("No changes!")}
    }
})
