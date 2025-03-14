import { randomIndices, randomElement, indexArray } from "./collectionUtils.js";
import { LetterSet } from "./LetterSet.js";


const message = 'Hello, World!!';
console.log(message);


console.log(`RND IDX ${randomIndices(10)}`);
console.log(`RND EL ${randomElement(indexArray(5))}`);

const ls = new  LetterSet();
console.log(`RND L ${ls.randomLetter()} RND V ${ls.randomVowel()}`)