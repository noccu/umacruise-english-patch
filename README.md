This project provides [UmaCruise's](https://github.com/amate/UmaUmaCruise) library files in English with translations from the [UmaTL project](https://github.com/noccu/umamusu-translate).  
Translations are automatically updated ever monday based on data from GameWith through [this project](https://github.com/po-po-po-pong/umaumacruise_customjson).

## Installation

1. Download the latest release. (Ignore date, it's still updated)
2. Extract and overwrite the .json files in the `UmaLibrary` folder inside your umacruise folder.

<!---
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

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
--->
