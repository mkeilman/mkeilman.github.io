//
//  collectionUtils.ts
//  WatchWords
//
//  Created by Michael Keilman on 2025-03-05
//  Copyright (c) 2025 Michael Keilman. All rights reserved
//
export function buildObj(keys: any[], values: any[]) {
	if (keys.length !== values.length) {
		throw new Error(`number of keys must equal number of values: ${keys.length} != ${values.length}`);
	}
	const o = {};
	for (const i in keys) {
		o[`${keys[i]}`] = values[i];
	}
	return o;
}

export function indexArray(size: number): number[] {
	return Array(size).fill(0).map((_, i) => i);
}

export function intArrayFromDigitString(inString :string, zeroToTen=false): number[] {
	var arr: number[] = [];
	return inString.split("").map(x => {
		const i = parseInt(x);
		return i ? i : (zeroToTen ? 10: 0);
	});
}

export function randomElement(arr: any[]): any {
	return arr[Math.floor(Math.random() * arr.length)];
}

export function randomIndices(size: number): number[] {
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

