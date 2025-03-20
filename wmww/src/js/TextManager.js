var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//
//  TextManager.ts
//  WatchWords
//
//  Created by Michael Keilman on 2025-03-15.
//  Copyright (c) 2025 Michael Keilman. All rights reserved.
//
import Rand, { PRNG } from "rand-seed";
import { DifficultyLevels } from "./common.js";
import { readText } from "./common.js";
import { LetterSet } from "./LetterSet.js";
import { PASS_TOKEN } from "./common.js";
const WORD_LIST_FILENAME = "WordList";
const WORD_LIST_FILETYPE = "txt";
const WORD_META_FOLDER = "WordMeta";
const WORD_META_FILENAME = "WordMeta";
const WORD_META_FILETYPE = "json";
const WORD_META_LENGTHS_FILETYPE = "txt";
const WORD_DIFF_INDICES_FILETYPE = "txt";
let KEY_WORD_META = "WordMeta";
let KEY_WORD_META_LENGTH_FREQ = "lengthFreqencies";
const DEFAULT_WORD_MIN_LENGTH = 2;
const DEFAULT_WORD_MAX_LENGTH = 127;
let PASS_TOKEN_INDEX = -2;
let INVALID_WORD_INDEX = -1;
export class TextManager {
    static instantiate() {
        return __awaiter(this, arguments, void 0, function* (difficulty = DifficultyLevels.normal) {
            const tm = new TextManager(difficulty);
            yield tm.buildWordList();
            return tm;
        });
    }
    minWordLength() {
        const k = Object.keys(this.wordLengthFreq).map(x => parseInt(x));
        return k ? Math.min(...k) : DEFAULT_WORD_MIN_LENGTH;
    }
    maxWordLength() {
        const k = Object.keys(this.wordLengthFreq).map(x => parseInt(x));
        return k ? Math.max(...k) : DEFAULT_WORD_MAX_LENGTH;
    }
    constructor(difficulty = DifficultyLevels.normal) {
        this.didSeed = false;
        this.difficulty = DifficultyLevels.normal;
        this.wordSearchArray = [];
        this.difficulty = difficulty;
        this.letterSet = new LetterSet();
    }
    buildWordList() {
        return __awaiter(this, void 0, void 0, function* () {
            yield readText("../data/words_alpha.txt", data => {
                this.wordSearchArray = data.split("\n").map(x => x.trim().toLowerCase()).sort();
            });
            yield readText("../data/WordMeta.json", data => {
                this.wordLengthFreq = JSON.parse(data);
            });
        });
    }
    // build array of legal indices based on difficulty (??)
    buildDifficultyIndices() {
        return;
    }
    // binary search, returns index
    find(word) {
        if (word == PASS_TOKEN) {
            return PASS_TOKEN_INDEX;
        }
        let mid;
        var min = 0;
        var max = this.wordSearchArray.length - 1;
        while (min <= max) {
            mid = Math.floor((min + max) / 2);
            const listWord = this.wordSearchArray[mid];
            if (word == listWord) {
                return mid;
            }
            if (word < listWord) {
                max = mid - 1;
            }
            else {
                min = mid + 1;
            }
        }
        return INVALID_WORD_INDEX;
    }
    baseScore(word) {
        let score = 0;
        for (const c of word.toUpperCase()) {
            const i = this.letterSet.letters.indexOf(c);
            if (i < 0) {
                continue;
            }
            score += this.letterSet.letterValues[i];
        }
        return score;
    }
    indices(word) {
        return word.split("").map(x => this.letterSet.letters.indexOf(x));
    }
    valsForWord(word) {
        return this.indices(word).map(x => this.letterSet.letterValues[x]);
    }
    hasNonYVowel(word) {
        const i = this.find(word);
        if (i < 0) {
            return false;
        }
        return this.indices(word).some(x => this.letterSet.vowelIndices.indexOf(x) >= 0);
    }
    // for simplicity, we will define this as having a Y anywhere other than the 1st
    // position, EXCEPT when the initial Y is followed by a non-vowel
    hasYAsVowel(word) {
        const w = word.toLowerCase();
        const i = this.find(w);
        let j = w.indexOf("y");
        if (i < 0 || w.length <= 1 || j < 0) {
            return false;
        }
        return j > 0 || this.letterSet.vowels.indexOf(w[1]) < 0;
    }
    wordsForLetters(lArr, lb, minLength, maxLength, maxNum) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!lArr.length) {
                return [];
            }
            const sArr = [];
            const lCountArr = Array(this.letterSet.letters.length).fill(0);
            let lString = ""; // for quick comparisons
            let nLetters = 0;
            let nLettersInBank = 0;
            let maxIndex = lArr[lArr.length - 1];
            for (const lIndex of lArr) {
                nLettersInBank = lb.letterCounts[lIndex];
                if (!nLettersInBank) {
                    continue;
                }
                lCountArr[lIndex] += nLettersInBank;
                nLetters += nLettersInBank;
                lString += this.letterSet.letters[lIndex];
            }
            if (nLetters < this.minWordLength()) {
                return [];
            }
            console.log(`HAVE ${nLetters} LETTERS ${lCountArr}`);
            let lowerLen = minLength || this.minWordLength();
            let upperLen = maxLength || Math.min(this.maxWordLength(), nLetters);
            let maxWords = maxNum || Number.MAX_SAFE_INTEGER;
            for (let l = lowerLen; l <= upperLen; ++l) {
                if (sArr.length >= maxWords) {
                    break;
                }
                let wordArr;
                yield readText("../data/" + `${l}`.padStart(2, "0") + ".txt", data => {
                    wordArr = data.split("\n").map(x => this.wordSearchArray[parseInt(x)]);
                });
                if (!wordArr.length) {
                    continue;
                }
                //console.log(`FOUND ${wordArr.length} WORDS LEN ${l}`);
                const wCountArr = Array(lCountArr.length).fill(0);
                var lenDone = sArr.length >= maxWords;
                for (const word of wordArr) {
                    var wOK = true;
                    var j = 0;
                    for (const c of word) {
                        const cIndex = this.letterSet.letters.indexOf(c);
                        // if leading char bigger than any we have, no more of this length, because
                        // words are in alphabetical order
                        if (j == 0) {
                            lenDone = (cIndex > maxIndex) || sArr.length >= maxWords;
                        }
                        j += 1;
                        wOK = wOK && !lenDone && lString.includes(c);
                        if (!wOK) {
                            // don't have this letter, move on
                            break;
                        }
                        if (cIndex >= 0) {
                            wCountArr[cIndex] += 1;
                        }
                    }
                    if (wOK) {
                        for (let i = 0; i < wCountArr.length; ++i) {
                            if (wCountArr[i] > 0) {
                                wOK = wOK && (lCountArr[i] - wCountArr[i] >= 0);
                            }
                            if (!wOK) {
                                break;
                            }
                        }
                        if (wOK && word != "") {
                            sArr.push(word);
                            lenDone = sArr.length >= maxWords;
                        }
                    }
                    if (lenDone) {
                        break;
                    }
                } // end loop over words of this length
            } // end loop over lengths
            return sArr;
        });
    }
    getRandomWord() {
        return this.wordSearchArray[Math.floor(Math.random() * this.wordSearchArray.length)];
    }
    // for picking watchwords
    getRandomWordOfLength(lowerLength = DEFAULT_WORD_MIN_LENGTH, upperLength = DEFAULT_WORD_MAX_LENGTH, forDay = false) {
        var rw;
        let ll = Math.max(lowerLength, this.minWordLength());
        let ul = Math.min(upperLength, this.maxWordLength());
        if (ll < this.minWordLength() || ul > this.maxWordLength() || ll > ul) {
            return null;
        }
        let numWords = 0;
        let len = lowerLength;
        // one pass to get the number of words in this length range
        for (let l = ll; l <= ul; ++l) {
            const f = this.wordLengthFreq[`${l}`];
            numWords += (f ? f : 0);
        }
        if (!numWords) {
            return null;
        }
        let start = 0;
        let stop = 0;
        const seed = forDay ? `${Math.floor(Date.now() / (60 * 60 * 24))}` : null;
        const rr = new Rand(seed, PRNG.xoshiro128ss);
        const r = Math.floor(rr.next() * numWords);
        // next pass determines which length to use
        for (let l = ll; l <= ul; ++l) {
            const f = this.wordLengthFreq[`${l}`];
            if (!f) {
                continue;
            }
            stop += f;
            if (r >= start && r < stop) {
                len = l;
                break;
            }
            start += f;
        }
        const w = this.wordSearchArray.filter(x => x.length == len);
        return w[Math.floor(rr.next() * w.length)];
    }
    usesAllLettersInSet(s) {
        var bArr = Array(this.letterSet.letters.length).fill(false);
        for (const c of s) {
            const cIndex = this.letterSet.letters.indexOf(c);
            if (cIndex >= 0) {
                bArr[cIndex] = true;
            }
        }
        return bArr.every(x => x);
    }
    isInAlphaOrder(s) {
        if (s.length <= 1) {
            return true;
        }
        let c0 = s[0];
        for (const c of s.slice(1)) {
            if (c < c0) {
                return false;
            }
            c0 = c;
        }
        return true;
    }
    haveCharsInCommon(s1, s2) {
        return s1.split("").some(x => s2.includes(x));
    }
    numCharsWithIndex(s, lIndex) {
        return s.split("").filter(x => this.letterSet.letters.indexOf(x) == lIndex).length;
    }
    toJSON() {
        return {
            KEY_TEXT_MANAGER: {
                KEY_TEXT_MANAGER_LETTER_SET: this.letterSet.toJSON(),
            }
        };
    }
}
