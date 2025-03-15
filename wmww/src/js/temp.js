import { randomIndices, randomElement, indexArray } from "./collectionUtils.js";
import { LetterSet } from "./LetterSet.js";
import { LetterBank } from "./LetterBank.js";
import { ModifierType } from "./common.js";


const message = 'Hello, World!!';
console.log(message);


console.log(`RND IDX ${randomIndices(10)}`);
console.log(`RND EL ${randomElement(indexArray(5))}`);

const ls = new  LetterSet();
console.log(`RND L ${ls.randomLetterIndex()} RND V ${ls.randomVowelIndex()}`);

const lb = new LetterBank();
console.log(`LB ${lb.description()}`);
//lb.withdrawWordFromBank("cat");
//lb.withdrawFromBank(0);
//console.log(`LB AFTER WD ${lb.description()}`);
//lb.depositWordIntoBank("dog", [ModifierType.spin]);
//console.log(`LB AFTER DEP ${lb.description()}`);
//lb.doExchangeOfLetterAtIndex(0);
//console.log(`LB AFTER EXCH ${lb.description()}`);
console.log(`PICK ${lb.pick()}`);


