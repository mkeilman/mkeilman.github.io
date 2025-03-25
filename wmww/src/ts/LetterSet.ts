//
//  LetterSet.ts
//  WatchWords
//
//  Created by Michael Keilman on 2025-03-04
//  Copyright (c) 2025 Michael Keilman. All rights reserved
//

import { buildObj, randomElement } from "./collectionUtils.js";


const _LETTERS =               "abcdefghijklmnopqrstuvwxyz";
const _LETTERS_DISPLAY =       _LETTERS.toUpperCase();
const _VOWELS =                "aeiou";
const _VOWELS_DISPLAY =        _VOWELS.toUpperCase();
const _LETTER_EXCHANGES =      "whjgzndbkcirxfvsulpyqoamte";  // exchange these...
const _LETTER_FREQUENCIES =    "82340226711437821669312121";  // 0 -> 10, out of 100 (actually 102)
const _LETTER_VALUES =         "12221322194221120111234826";  // 0 -> 10
const _LETTER_EXCHANGE_COUNT = "11111211122311132111122233";  // ...for this many...
const _LETTER_PRICES =         "52527122511254421333611121";  // ...at these prices

const POINT_COST_FACTOR = 1.5

export class LetterSet  {
    static KEY_LETTER_SET = "LetterSet";
    static KEY_LETTER_SET_LETTERS = "letters";
    static KEY_LETTER_SET_VALUES = "values";
    static KEY_LETTER_SET_EXCHANGES = "exchanges";
    static KEY_LETTER_SET_EXCHANGE_COUNT = "exchangeCount";
    static KEY_LETTER_SET_PRICES = "prices";

	static KEY_LETTERS = "_LETTERS";
    static KEY_VOWELS = "_VOWELS";
    static KEY_LETTER_FREQUENCIES = "_LETTER_FREQUENCIES";
    static KEY_LETTER_VALUES = "_LETTER_VALUES";
    static KEY_LETTER_EXCHANGES = "_LETTER_EXCHANGES";
    static KEY_LETTER_EXCHANGE_COUNT = "_LETTER_EXCHANGE_COUNT";
    static KEY_LETTER_PRICES = "_LETTER_PRICES";

	static letters = _LETTERS.split("");
    static vowels = _VOWELS.split("");
    static frequencies = _LETTER_FREQUENCIES.split("").map(x => x ? parseInt(x) : 10);
    static vowelIndices = this.vowels.map(x => this.letters.indexOf(x));
	static letterValues = _LETTER_VALUES.split("").map(x => x ? parseInt(x) : 10);
	static letterExchangeIndices = _LETTER_EXCHANGES.split("").map(x => this.letters.indexOf(x));
    static letterPrices = _LETTER_PRICES.split("").map(x => parseInt(x));
	static letterExchangeCounts = _LETTER_EXCHANGE_COUNT.split("").map(x => parseInt(x));
    static letterIndices = this._letterIndices();

    static fromJSON(json: object) {
        const ls = new LetterSet();

        return ls;
    }

    private static _letterIndices(): number[] {
        let index = 0;
        let a: number[] = [];
        for (let i of this.frequencies) {
            a = a.concat(Array(i).fill(index));
            index += 1;
        }
        return a;
    }

    frequencies: number[];
    letterExchangeCounts: number[];
    letterExchangeIndices: number[];
    letterIndices: number[];
    letterPrices: number[];
    letters: string[];
    letterValues: number[];
    vowelIndices: number[];
    vowels: string[];
    
	constructor(protected locale="en-US") {
         // ignore locale for now - eventually these instance properties will be based on that
        this.frequencies = LetterSet.frequencies.slice();
        this.letterExchangeCounts = LetterSet.letterExchangeCounts.slice();
        this.letterExchangeIndices = LetterSet.letterExchangeIndices.slice();
        this.letterIndices = LetterSet.letterIndices.slice();
        this.letterPrices = LetterSet.letterPrices.slice();
        this.letters = LetterSet.letters.slice();
        this.letterValues = LetterSet.letterValues.slice();
        this.vowelIndices = LetterSet.vowelIndices.slice();
        this.vowels = LetterSet.vowels.slice();
	}
	
    indicesToLetters(indices: number[]): string[] {
        return indices.map(x => this.letters[x]);
    }
	
	// pick 1 random letter index
	randomLetterIndex(): number {
		return randomElement(LetterSet.letterIndices);
	}

	randomVowelIndex(): number {
		return randomElement(LetterSet.vowelIndices);
	}

	toJSON(): object {
        return buildObj(
            [LetterSet.KEY_LETTER_SET],
            [buildObj(
                [
                    LetterSet.KEY_LETTER_SET_LETTERS,
                    LetterSet.KEY_LETTER_SET_VALUES,
                    LetterSet.KEY_LETTER_SET_EXCHANGES,
                    LetterSet.KEY_LETTER_SET_EXCHANGE_COUNT,
                    LetterSet.KEY_LETTER_SET_PRICES,
                ],
                [
                    LetterSet.letters,
                    LetterSet.letterValues,
                    LetterSet.letterExchangeIndices,
                    LetterSet.letterExchangeCounts,
                    LetterSet.letterPrices,
                ]
            )]
        )
	}

}

