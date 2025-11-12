"use strict";
//
//  index.ts
//  collectionUtils
//
//  Created by Michael Keilman on 2025-03-05
//  Copyright (c) 2025 Michael Keilman. All rights reserved
//
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexArray = indexArray;
exports.randomIndices = randomIndices;
exports.intArrayFromDigitString = intArrayFromDigitString;
exports.randomElement = randomElement;
exports.randomExchanges = randomExchanges;
// why did tsc ruin this?
function indexArray(size) {
    return Array(size).map((_, i) => i);
}
function randomIndices(size) {
    let arr = [];
    let iArr = this.indexArray(size);
    let temp = 0;
    for (let i of iArr) {
        const r = Math.floor(Math.random() * size);
        arr.push(iArr[r]);
        temp = iArr[r];
        iArr[r] = iArr[size - i - 1];
        iArr[size - i - 1] = temp;
    }
    return arr;
}
function intArrayFromDigitString(inString, zeroToTen = false) {
    var arr = [];
    return inString.split("").map(x => {
        const i = parseInt(x);
        return i ? i : (zeroToTen ? 10 : 0);
    });
}
function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
/**
* From the given array, retruns a list of pairs of random elements
* where each element appears in each position once and only once, and
* never in both positions of a single pair. Consider a gift exchange where each person draws a
* name not their own to give to.
*
* Args:
*    elements (any[]): elements to pair
*/
function randomExchanges(elements) {
    const exchanges = [];
    function availableElements(element) {
        const n = [];
        for (let x of elements) {
            if (x != element && !(x in exchanges)) {
                n.push(x);
            }
        }
        return n;
    }
    for (let e of elements) {
        exchanges.push([e, randomElement(availableElements(e))]);
    }
    return exchanges;
}
