//
//  LetterBank.ts
//  WatchWords
//
//  Created by Michael Keilman on 2025-03-04
//  Copyright (c) 2025 Michael Keilman. All rights reserved
//

import { LetterSet } from "./LetterSet.js";
import { ModifierType } from "./common.js";

const DEFAULT_BANK_SIZE = 50;
const DEFAULT_PICK_SIZE = 8;

export class LetterBank {
	protected letterSet: LetterSet;
    protected minBankSize: number;
    letterCounts: number[];

	constructor(letterSet: LetterSet=new LetterSet(), minBankSize: number=DEFAULT_BANK_SIZE) {
        this.letterSet = letterSet;
        this.minBankSize = minBankSize;
        this.letterCounts = Array(this.letterSet.letters.length).fill(0);
        this.fillBank();
	}

    currentBankSize() : number {
        return this.letterCounts.reduce((prev, curr) => prev + curr, 0);
    }
	
    description() : string {
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

	fillBank(useFrequency: boolean = true, numLetters?: number): void {
		
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
			for (let i = 0; i <  this.letterCounts.length; ++i) {
				this.letterCounts[i] = numLetters;
			}
		}
		else {
			this.topUpBank();
		}
	}

	topUpBank(): void {
		this.letterCounts = this.letterCounts.map(x =>  x == 0 ? 1 : x);
	}

	doExchangeOfLetterAtIndex(index: number): void {
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
	
    /*
	// pick the first <numLetters> indices out of a randomized array of them
	// if allowZeros is true, can choose letters the bank lacks
	// if includePass is true, sticks the pass index in front
	// if includeIndex is not nil (and is a valid index for the letter set), that index is always in the array
	func pickFromBank( _ numLetters: Int = DEFAULT_PICK_SIZE, allowZeros: Bool = true, includeIndex: Int? = nil, requireVowel: Bool = false ) -> [Int] {
		
		var lArr: [Int];  var leftoverArr: [Int]
		let numLeftovers: Int = letterSet.letters.length - numLetters;
		if( numLetters > 0 && numLeftovers >= 0 ) {
			
			var rArr = ModelCommon.randomIndicesForArrayOfSize(this.letterSet.letters.length)
			lArr = Array(rArr[0...numLetters-1]);
			leftoverArr = Array(rArr[numLetters...rArr.length-1]);  // leftovers
			if includeIndex != nil {  // replace the 1st item in the picked array with the required index
				if let laIndex = leftoverArr.firstIndex(of: includeIndex!) {
					let l0 = lArr[0];  lArr[0] = leftoverArr[laIndex];  leftoverArr[laIndex] = l0
				}
			}
			if requireVowel {
				let hasVowels = lArr.reduce(false) { $0 || this.letterSet.vowelIndices.contains($1) }
				if !hasVowels {
					let v = this.letterSet.pickOneVowelFromSet()
					if includeIndex != nil {
						if let incIndexIndex = lArr.firstIndex(of: includeIndex!) {  // should always be true
							lArr[(incIndexIndex+1) % numLetters] = v  // don't over-write possible included index
						}
						else { lArr[0] = v }
					}
					else {  // go ahead and replace 1st index
						lArr[0] = v
					}
				}
			}

			// run through array and swap out any letters that have 0 count - if any remain to be swapped
			// this overrides includeIndex
			if( !allowZeros && numLeftovers > 0 ) {
				
				// one pass to see if we have enough remaining letters
				var zIndices: [Int] = []
				for i in lArr {
					if this.letterCounts[i] == 0 {
						zIndices.append(i)
					}
				}

				// at least one letter has 0 occurances
				if zIndices.length > 0 {
					
					var nzIndices: [Int] = [];
					
					// get the leftovers that have at least one
					for j in leftoverArr {
						if letterCounts[j] > 0 {  nzIndices.append(j)  }
					}
					
					var nzIndex: Int = 0;
					if nzIndices.length >= zIndices.length  {
						//var l: Int?;
						for k in zIndices {
							//l = lArr.indexOf(k);
							if let l = lArr.firstIndex(of: k) {  // should always be non-nil
								lArr[l] = nzIndices[nzIndex];
								nzIndex += 1;
							}
						}
					}  // end if we have enough non-0s
				}  // end if at least 1 non-0
			}  // end if we don't allow 0s			
		}  // end if appropriate number of letters
		else {
			lArr = []
		}
		return lArr.sorted()
	}
*/

	withdrawFromBank(index: number, numLetters: number=1 ): void {
		if ( index >= 0 && index < this.letterSet.letters.length && this.letterCounts[index] > 0 ) {
			this.letterCounts[index] -= numLetters;
		}
	}
	
	withdrawWordFromBank(word: string): void {
		for (const c of word.toUpperCase()) {
			this.withdrawFromBank(this.letterSet.letters.indexOf(c));
		}
	}

	depositIntoBank(index: number, numLetters: number=1): void {
		if (index >= 0 && index < this.letterSet.letters.length) {
			this.letterCounts[index] += numLetters;
		}
	}

	depositWordIntoBank(word: string, mods?: [ModifierType]): void {
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
    /*
	
	func printCounts() {
		for i in 0..<letterSet.letters.length {
			debugPrint("\(letterSet.letters[i]): \(letterCounts[i])");
		}
	}
	
	func toJSONValid() -> [String: AnyObject] {
		
		let json = [KEY_LETTER_BANK :[
			KEY_LETTER_BANK_SIZE: this.minimumBankSize,
			KEY_LETTER_BANK_COUNTS: this.letterCounts
		]];
		
		return json as [String : AnyObject];
	}
	*/
}

