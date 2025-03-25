//
//  LetterSet.ts
//  WatchWords
//
//  Created by Michael Keilman on 2025-03-04
//  Copyright (c) 2025 Michael Keilman. All rights reserved
//
var _a;
import { buildObj, randomElement } from "./collectionUtils.js";
const _LETTERS = "abcdefghijklmnopqrstuvwxyz";
const _LETTERS_DISPLAY = _LETTERS.toUpperCase();
const _VOWELS = "aeiou";
const _VOWELS_DISPLAY = _VOWELS.toUpperCase();
const _LETTER_EXCHANGES = "whjgzndbkcirxfvsulpyqoamte"; // exchange these...
const _LETTER_FREQUENCIES = "82340226711437821669312121"; // 0 -> 10, out of 100 (actually 102)
const _LETTER_VALUES = "12221322194221120111234826"; // 0 -> 10
const _LETTER_EXCHANGE_COUNT = "11111211122311132111122233"; // ...for this many...
const _LETTER_PRICES = "52527122511254421333611121"; // ...at these prices
const POINT_COST_FACTOR = 1.5;
export class LetterSet {
    static fromJSON(json) {
        const ls = new _a();
        return ls;
    }
    static _letterIndices() {
        let index = 0;
        let a = [];
        for (let i of this.frequencies) {
            a = a.concat(Array(i).fill(index));
            index += 1;
        }
        return a;
    }
    constructor(locale = "en-US") {
        this.locale = locale;
        // ignore locale for now - eventually these instance properties will be based on that
        this.frequencies = _a.frequencies.slice();
        this.letterExchangeCounts = _a.letterExchangeCounts.slice();
        this.letterExchangeIndices = _a.letterExchangeIndices.slice();
        this.letterIndices = _a.letterIndices.slice();
        this.letterPrices = _a.letterPrices.slice();
        this.letters = _a.letters.slice();
        this.letterValues = _a.letterValues.slice();
        this.vowelIndices = _a.vowelIndices.slice();
        this.vowels = _a.vowels.slice();
    }
    indicesToLetters(indices) {
        return indices.map(x => this.letters[x]);
    }
    // pick 1 random letter index
    randomLetterIndex() {
        return randomElement(_a.letterIndices);
    }
    randomVowelIndex() {
        return randomElement(_a.vowelIndices);
    }
    toJSON() {
        return buildObj([_a.KEY_LETTER_SET], [buildObj([
                _a.KEY_LETTER_SET_LETTERS,
                _a.KEY_LETTER_SET_VALUES,
                _a.KEY_LETTER_SET_EXCHANGES,
                _a.KEY_LETTER_SET_EXCHANGE_COUNT,
                _a.KEY_LETTER_SET_PRICES,
            ], [
                _a.letters,
                _a.letterValues,
                _a.letterExchangeIndices,
                _a.letterExchangeCounts,
                _a.letterPrices,
            ])]);
    }
}
_a = LetterSet;
LetterSet.KEY_LETTER_SET = "LetterSet";
LetterSet.KEY_LETTER_SET_LETTERS = "letters";
LetterSet.KEY_LETTER_SET_VALUES = "values";
LetterSet.KEY_LETTER_SET_EXCHANGES = "exchanges";
LetterSet.KEY_LETTER_SET_EXCHANGE_COUNT = "exchangeCount";
LetterSet.KEY_LETTER_SET_PRICES = "prices";
LetterSet.KEY_LETTERS = "_LETTERS";
LetterSet.KEY_VOWELS = "_VOWELS";
LetterSet.KEY_LETTER_FREQUENCIES = "_LETTER_FREQUENCIES";
LetterSet.KEY_LETTER_VALUES = "_LETTER_VALUES";
LetterSet.KEY_LETTER_EXCHANGES = "_LETTER_EXCHANGES";
LetterSet.KEY_LETTER_EXCHANGE_COUNT = "_LETTER_EXCHANGE_COUNT";
LetterSet.KEY_LETTER_PRICES = "_LETTER_PRICES";
LetterSet.letters = _LETTERS.split("");
LetterSet.vowels = _VOWELS.split("");
LetterSet.frequencies = _LETTER_FREQUENCIES.split("").map(x => x ? parseInt(x) : 10);
LetterSet.vowelIndices = _a.vowels.map(x => _a.letters.indexOf(x));
LetterSet.letterValues = _LETTER_VALUES.split("").map(x => x ? parseInt(x) : 10);
LetterSet.letterExchangeIndices = _LETTER_EXCHANGES.split("").map(x => _a.letters.indexOf(x));
LetterSet.letterPrices = _LETTER_PRICES.split("").map(x => parseInt(x));
LetterSet.letterExchangeCounts = _LETTER_EXCHANGE_COUNT.split("").map(x => parseInt(x));
LetterSet.letterIndices = _a._letterIndices();
