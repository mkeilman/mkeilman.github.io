//
//  LetterBank.ts
//  WatchWords
//
//  Created by Michael Keilman on 2025-03-04
//  Copyright (c) 2025 Michael Keilman. All rights reserved
//
import { randomIndices } from "./collectionUtils.js";
import { LetterSet } from "./LetterSet.js";
import { ModifierType } from "./common.js";
const DEFAULT_BANK_SIZE = 50;
const DEFAULT_PICK_SIZE = 8;
export class LetterBank {
    static fromJSON(json) {
        const b = new LetterBank(new LetterSet(), json[LetterBank.KEY_LETTER_BANK][LetterBank.KEY_LETTER_BANK_SIZE]);
        b.letterCounts = json[LetterBank.KEY_LETTER_BANK][LetterBank.KEY_LETTER_BANK_COUNTS];
        return b;
    }
    constructor(letterSet = new LetterSet(), minBankSize = DEFAULT_BANK_SIZE) {
        this.letterSet = letterSet;
        this.minBankSize = minBankSize;
        this.letterCounts = Array(this.letterSet.letters.length).fill(0);
        this.fillBank();
    }
    currentBankSize() {
        return this.letterCounts.reduce((prev, curr) => prev + curr, 0);
    }
    fillBank(useFrequency = true, numLetters) {
        if (useFrequency) {
            for (let i = 1; i <= this.minBankSize; ++i) {
                // index of character in frequency string
                const r = Math.floor(Math.random() * this.letterSet.letterIndices.length);
                this.letterCounts[this.letterSet.letterIndices[r]] += 1;
            }
            // insist on at least one of every letter
            this.topUpBank();
        }
        else if (numLetters != undefined) {
            for (let i = 0; i < this.letterCounts.length; ++i) {
                this.letterCounts[i] = numLetters;
            }
        }
        else {
            this.topUpBank();
        }
    }
    topUpBank() {
        this.letterCounts = this.letterCounts.map(x => x == 0 ? 1 : x);
    }
    doExchangeOfLetterAtIndex(index) {
        if (index >= this.letterSet.letters.length) {
            return;
        }
        const n = this.letterCounts[index];
        const p = this.letterSet.letterPrices[index];
        const xn = this.letterSet.letterExchangeCounts[index];
        //const xIndex = this.letterSet.letterExchangeIndices[index];
        //console.log(`LetterBank.doExchangeOfLetterAtIndex - Charging ${p} ${this.letterSet.letters[index]} for ${xn} ${this.letterSet.letters[xIndex]}`);
        if (n >= p) {
            this.letterCounts[index] -= p;
            this.letterCounts[this.letterSet.letterExchangeIndices[index]] += xn;
        }
        else {
            console.log(`LetterBank.doExchangeOfLetterAtIndex - Not enough ${this.letterSet.letters[index]}s`);
        }
    }
    // pick the first <numLetters> indices out of a randomized array of them
    // if allowZeros is true, can choose letters the bank lacks
    // if includePass is true, sticks the pass index in front
    // if includeIndex is not nil (and is a valid index for the letter set), that index is always in the array
    pick(numLetters = DEFAULT_PICK_SIZE, allowZeros = true, includeIndex, requireVowel = false) {
        let numLeftovers = this.letterSet.letters.length - numLetters;
        if (numLetters <= 0 || numLeftovers <= 0) {
            return [];
        }
        const rArr = randomIndices(this.letterSet.letters.length);
        const lArr = rArr.slice(0, numLetters - 1);
        const leftoverArr = rArr.slice(numLetters);
        if (includeIndex != undefined) {
            // replace the 1st item in the picked array with the required index
            const laIndex = leftoverArr.indexOf(includeIndex);
            if (laIndex >= 0) {
                let l0 = lArr[0];
                lArr[0] = leftoverArr[laIndex];
                leftoverArr[laIndex] = l0;
            }
        }
        const hasVowels = lArr.reduce((prev, curr) => prev || this.letterSet.vowelIndices.indexOf(curr) >= 0, false);
        if (requireVowel && !hasVowels) {
            let v = this.letterSet.randomVowelIndex();
            if (includeIndex != undefined) {
                let incIndexIndex = lArr.indexOf(includeIndex);
                // don't over-write possible included index
                lArr[(incIndexIndex + 1) % numLetters] = v;
            }
            else { // go ahead and replace 1st index
                lArr[0] = v;
            }
        }
        // run through array and swap out any letters that have 0 count - if any remain to be swapped
        // this overrides includeIndex
        if (!allowZeros && numLeftovers > 0) {
            // one pass to see if we have enough remaining letters
            var zIndices = lArr.filter(x => !this.letterCounts[x]);
            // at least one letter has 0 occurances
            if (zIndices.length > 0) {
                const nzIndices = this.letterCounts.filter(x => x);
                let nzIndex = 0;
                if (nzIndices.length >= zIndices.length) {
                    for (const k of zIndices) {
                        const l = lArr.indexOf(k);
                        if (l < 0) {
                            continue;
                        }
                        lArr[l] = nzIndices[nzIndex];
                        nzIndex += 1;
                    }
                } // end if we have enough non-0s
            } // end if at least 1 non-0
        } // end if we don't allow 0s			
        return lArr.sort();
    }
    withdrawFromBank(index, numLetters = 1) {
        if (index >= 0 && index < this.letterSet.letters.length && this.letterCounts[index] > 0) {
            this.letterCounts[index] -= numLetters;
        }
    }
    withdrawWordFromBank(word) {
        for (const c of word.toUpperCase()) {
            this.withdrawFromBank(this.letterSet.letters.indexOf(c));
        }
    }
    depositIntoBank(index, numLetters = 1) {
        if (index >= 0 && index < this.letterSet.letters.length) {
            this.letterCounts[index] += numLetters;
        }
    }
    depositWordIntoBank(word, mods) {
        let j = -1;
        for (const c of word.toUpperCase()) {
            ++j;
            const i = this.letterSet.letters.indexOf(c);
            this.depositIntoBank(i);
            if (j >= (mods || []).length) {
                continue;
            }
            const mType = mods[j];
            if (mType == ModifierType.poison) {
                this.withdrawFromBank(i, 2);
            }
            else if (mType == ModifierType.lightning) {
                this.letterCounts[i] = 0;
            }
        }
    }
    toJSON() {
        const json = {};
        json[`${LetterBank.KEY_LETTER_BANK}`] = {};
        json[`${LetterBank.KEY_LETTER_BANK}`][`${LetterBank.KEY_LETTER_BANK_SIZE}`] = this.minBankSize;
        json[`${LetterBank.KEY_LETTER_BANK}`][`${LetterBank.KEY_LETTER_BANK_COUNTS}`] = this.letterCounts;
        return json;
    }
}
LetterBank.KEY_LETTER_BANK = "LetterBank";
LetterBank.KEY_LETTER_BANK_LETTER_SET = "letterSet";
LetterBank.KEY_LETTER_BANK_SIZE = "minBankSize";
LetterBank.KEY_LETTER_BANK_COUNTS = "letterCounts";
