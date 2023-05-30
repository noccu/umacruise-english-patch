import helpers
from sys import argv

RACE_LIB_JP = "UmaLibrary/RaceDataLibrary.json"
RACE_LIB_EN = "libraries/RaceDataLibrary.json"

if len(argv) != 2:
    print("Usage: tl-races <path to race-name.json> (from uma-tl project)")
    raise SystemExit

try:
    raceData = helpers.readJson(RACE_LIB_JP)
except FileNotFoundError:
    print("RaceDataLibrary.json not found. Either was not updated, or script not run from root dir.")
    raise SystemExit
refData = helpers.readJson(argv[1]).get('text')

for grade in raceData.get('Race', {}).values():
    for race in grade:
        try:
            race['Name'] = refData[race['Name']] or race['Name']
        except KeyError:
            pass

helpers.writeJson(RACE_LIB_EN, raceData)
print("Races translated.")