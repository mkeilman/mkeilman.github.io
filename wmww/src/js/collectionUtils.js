//
//  collectionUtils.ts
//  WatchWords
//
//  Created by Michael Keilman on 2025-03-05
//  Copyright (c) 2025 Michael Keilman. All rights reserved
//
export function indexArray(size) {
    return Array(size).fill(0).map((_, i) => i);
}
export function randomIndices(size) {
    let iArr = indexArray(size);
    let temp = 0;
    for (let i of iArr) {
        const r = Math.floor(Math.random() * size);
        temp = iArr[r];
        iArr[r] = iArr[size - i - 1];
        iArr[size - i - 1] = temp;
    }
    return iArr;
}
export function intArrayFromDigitString(inString, zeroToTen = false) {
    var arr = [];
    return inString.split("").map(x => {
        const i = parseInt(x);
        return i ? i : (zeroToTen ? 10 : 0);
    });
}
export function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
