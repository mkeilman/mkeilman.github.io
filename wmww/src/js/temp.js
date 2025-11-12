import { randomIndices, randomElement, indexArray } from "./collectionUtils.js";
import { GameModel } from "./GameModel.js";
import { LetterSet } from "./LetterSet.js";
import { LetterBank } from "./LetterBank.js";
import { TextManager } from "./TextManager.js";
import { ModifierType } from "./common.js";

import { readFile, readFileSync } from "fs";
import * as zlib from "node:zlib";

import Rand, { PRNG } from "rand-seed";


//const message = 'Hello, World!!';
//console.log(message);


//console.log(`RND IDX ${randomIndices(10)}`);
//console.log(`RND EL ${randomElement(indexArray(5))}`);

//const ls = new  LetterSet();
//console.log(`RND L ${ls.randomLetterIndex()} RND V ${ls.randomVowelIndex()}`);

const lb = new LetterBank();
//console.log("LB", lb);
//lb.withdrawWordFromBank("cat");
//lb.withdrawFromBank(0);
//console.log(`LB AFTER WD ${lb.description()}`);
//lb.depositWordIntoBank("dog", [ModifierType.spin]);
//console.log(`LB AFTER DEP ${lb.description()}`);
//lb.doExchangeOfLetterAtIndex(0);
//console.log(`LB AFTER EXCH ${lb.description()}`);
//console.log(`PICK ${lb.pick()}`);
//const j = lb.toJSON();
//console.log("JSON", j);
//const jlb = LetterBank.fromJSON(j);
//console.log("FROM JSON", jlb);

//const z = new JSZip();
/*
readFile("../data/words_alpha.txt", "utf-8", (err, data) => {
    if (err) {
        throw err;
    }
    const a = data.split("\n").map(x => x.toLowerCase());
    console.log("DATA", a[1]);
});


readFile("../data/WordMeta.json", "utf-8", (err, data) => {
    if (err) {
        throw err;
    }
    console.log(JSON.parse(data));
});

*/
/*
let o = {"a": "A"}
console.log(o.a);

const n = Date.now();
const s = Math.floor(n / (60 * 60 * 24));
const r = new Rand("" + s, PRNG.xoshiro128ss);
console.log(n, s, r.next());
*/

//const tm = new TextManager();
/*
const tm = await TextManager.instantiate();
let w = "apartment";
let i = tm.find(w);
console.log(`FIND ${w}: ${i}`);
w = "yelp";
console.log(`${w} HAS VOWEL Y?`, tm.hasYAsVowel(w));

let letters = lb.pick();
let wds = await tm.wordsForLetters(letters, lb);
console.log(`LETTERS ${lb.letterSet.indicesToLetters(letters)} CAN MAKE ${wds}`);

let a = [[1,2], [3,4], [[5, 6], [7, 8]]];
console.log(a.flat(Infinity));
*/
const gm =  await GameModel.instantiate();
console.log("PA", gm.watchWords);