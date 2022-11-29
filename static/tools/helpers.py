# File copied and cut down from uma-tl project

from typing import Union
import json
from pathlib import Path
from os import PathLike

import regex

def readJson(file: PathLike) -> Union[dict, list]:
    with open(file, "r", encoding="utf8") as f:
        return json.load(f)


def writeJson(file: PathLike, data):
    file = Path(file)
    file.parent.mkdir(parents=True, exist_ok=True)
    with open(file, "w", encoding="utf8", newline="\n") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def mkdir(path, parents=True, exists=True):
    Path(path).mkdir(parents=parents, exist_ok=exists)

def isParseableInt(x):
    try:
        int(x)
        return True
    except ValueError:
        return False


def isJapanese(text):
    # Should be cached according to docs
    return regex.search(r"[\p{scx=Katakana}\p{scx=Hiragana}\p{Han}\p{InHalfwidth_and_Fullwidth_Forms}\p{General_Punctuation}]{3,}", text)


def isEnglish(text):
    return regex.fullmatch(r"[^\p{scx=Katakana}\p{scx=Hiragana}\p{Han}\p{InHalfwidth_and_Fullwidth_Forms}。]+", text)
