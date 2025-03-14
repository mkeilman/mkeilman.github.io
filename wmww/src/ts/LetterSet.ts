//
//  LetterSet.ts
//  WatchWords
//
//  Created by Michael Keilman on 2025-03-04
//  Copyright (c) 2025 Michael Keilman. All rights reserved
//

import { randomElement } from "./collectionUtils.js";

const KEY_LETTERS: string = "_LETTERS";
const KEY_VOWELS: string = "_VOWELS";
const KEY_LETTER_FREQUENCIES: string = "_LETTER_FREQUENCIES";
const KEY_LETTER_VALUES: string = "_LETTER_VALUES";
const KEY_LETTER_EXCHANGES: string = "_LETTER_EXCHANGES";
const KEY_LETTER_EXCHANGE_COUNT: string = "_LETTER_EXCHANGE_COUNT";
const KEY_LETTER_PRICES: string = "_LETTER_PRICES";

const _LETTERS: string =               "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const _VOWELS: string =                "AEIOU";
const _LETTER_EXCHANGES: string =      "WHJGZNDBKCIRXFVSULPYQOAMTE";  // exchange these...
const _LETTER_FREQUENCIES: string =    "82340226711437821669312121";  // 0 -> 10, out of 100 (actually 102)
const _LETTER_VALUES: string =         "12221322194221120111234826";  // 0 -> 10
const _LETTER_EXCHANGE_COUNT: string = "11111211122311132111122233";  // ...for this many...
const _LETTER_PRICES: string =         "52527122511254421333611121";  // ...at these prices

const POINT_COST_FACTOR = 1.5

export class LetterSet  {
	
	static letters = _LETTERS.split("");
    static vowels = _VOWELS.split("");
    static frequencies = _LETTER_FREQUENCIES.split("").map(x => x ? parseInt(x) : 10);
    static vowelIndices = this.vowels.map(x => this.letters.indexOf(x));
	static letterValues = _LETTER_VALUES.split("").map(x => x ? parseInt(x) : 10);
	static letterExchangeIndices = _LETTER_EXCHANGES.split("").map(x => this.letters.indexOf(x));
    static letterPrices = _LETTER_PRICES.split("").map(x => parseInt(x));
	static letterExchangeCounts = _LETTER_EXCHANGE_COUNT.split("").map(x => parseInt(x));
    static letterIndices = this._letterIndices();

    private static _letterIndices(): number[] {
        let index = 0;
        let a: number[] = [];
        for (let i of this.frequencies) {
            a = a.concat(Array(i).fill(index));
            index += 1;
        }
        return a;
    }

    // ignore locale for now
	constructor(protected locale="en-US") {
	}
	
	
	// pick 1 random letter index
	randomLetter(): string {
		return randomElement(LetterSet.letters);
	}

	randomVowel(): string {
		return randomElement(LetterSet.vowels);
	}

	toJSONValid(): object {
		return {
            KEY_LETTER_SET : {
                KEY_LETTER_SET_LETTERS : LetterSet.letters,
                KEY_LETTER_SET_VALUES : LetterSet.letterValues,
                KEY_LETTER_SET_EXCHANGES : LetterSet.letterExchangeIndices,
                KEY_LETTER_SET_EXCHANGE_COUNT : LetterSet.letterExchangeCounts,
                KEY_LETTER_SET_PRICES : LetterSet.letterPrices
            }
        };
	}

}

