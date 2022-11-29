import helpers
from sys import argv


if len(argv) != 2:
    print("Usage: tl-races <path to race-name.json> (from uma-tl project)")
    raise SystemExit

try:
    raceData = helpers.readJson("RaceDataLibrary.json")
except FileNotFoundError:
    print("RaceDataLibrary.json not found. Run from /static dir, not /tools")
    raise SystemExit
refData = helpers.readJson(argv[1]).get('text')

for grade in raceData.get('Race', {}).values():
    for race in grade:
        try:
            race['Name'] = refData[race['Name']] or race['Name']
        except KeyError:
            pass

helpers.writeJson("RaceDataLibrary.json", raceData)
print("Races translated.")