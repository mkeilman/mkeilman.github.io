//
//  LetterBank.ts
//  WatchWords
//
//  Created by Michael Keilman on 2025-03-04
//  Copyright (c) 2025 Michael Keilman. All rights reserved
//
import { LetterSet } from "./LetterSet.js";
const DEFAULT_BANK_SIZE = 50;
const DEFAULT_PICK_SIZE = 8;
export class LetterBank {
    constructor(letterSet = new LetterSet(), minBankSize = DEFAULT_BANK_SIZE) {
        this.letterSet = letterSet;
        this.minBankSize = minBankSize;
        this.letterCounts = Array(this.letterSet.letters.length).fill(0);
        this.fillBank();
    }
    currentBankSize() {
        return this.letterCounts.reduce((prev, curr) => prev + curr, 0);
    }
    description() {
        var desc = "";
        for (let i = 0; i <= this.letterSet.letters.length - 2; ++i) {
            desc += `${this.letterSet.letters[i]}: ${this.letterCounts[i]}; `;
        }
        desc += `${this.letterSet.letters[this.letterSet.letters.length - 1]}: ${this.letterCounts[this.letterSet.letters.length - 1]}`;
        return desc;
    }
    /*
    init?( letterSet: LetterSet, json: [String: AnyObject] ) {
        
        if( JSONSerialization.isValidJSONObject(json) ) {
            this.letterCounts = json[KEY_LETTER_BANK_COUNTS] as! [Int];
            this.minimumBankSize = json[KEY_LETTER_BANK_SIZE] as! Int;
            this.letterSet = letterSet;
        }
        else {
            return nil;
        }
    }
    */
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
        console.log(`LetterBank.fillBank - Bank now has size ${this.currentBankSize()}`);
    }
    topUpBank() {
        this.letterCounts = this.letterCounts.map(x => x == 0 ? 1 : x);
    }
}
