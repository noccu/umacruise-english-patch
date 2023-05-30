This project is created to patch umacruise with english translations from the umamusume-db-translate project

## Installation

1. Download the latest release or grab the files from the `static` folder in the repo
2. Copy and overwrite the .json files into the `UmaLibrary` folder inside your umacruise folder.

## Development

Add translations for new content directly in their respective files.

Or use the scripts:
1. Use `autotl.js` on the newest japanese `UmaMusumeLibrary.json`, writing to a new file.
    > `node tools/autotl.js path/to/umamusume-db-translate/src/data path/to/amate's/newest/UmaMusumeLibrary.json new.json`
1. Use `sort.js` on the newly written file, comparing it with the existing file in the static dir.
    > `node tools/sort.js new.json`
1. Manually diff the result between the newly translated jp file and the sorted file in whichever way you like.
    > `diff new.json UmaMusumeLibrary.sorted.json`
    - Can also diff between old and sorted for extra security.

A few other workflows are possible too.
Of course you could also just run autotl.js on the new file and call it a day. But this way affords additional control, and fixes from this repo to not be lost.

## Library
English Translation : [https://github.com/noccu/umamusume-db-translate](https://github.com/noccu/umamusume-db-translate)

UmaCruise Original Source : [https://github.com/amate/UmaUmaCruise](https://github.com/amate/UmaUmaCruise)


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

