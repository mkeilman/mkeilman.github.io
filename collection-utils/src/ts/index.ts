//
//  index.ts
//  collectionUtils
//
//  Created by Michael Keilman on 2025-03-05
//  Copyright (c) 2025 Michael Keilman. All rights reserved
//

// why did tsc ruin this?
export function indexArray(size: number): number[] {
	return Array(size).map((_, i) => i);
}

export function randomIndices(size: number): number[] {
		
	let arr: number[] = [];
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

/**
* From the given array, retruns a list of pairs of random elements
* where each element appears in each position once and only once, and
* never in both positions of a single pair. Consider a gift exchange where each person draws a
* name not their own to give to.
* 
* Args:
*    elements (any[]): elements to pair
*/
export function randomExchanges(elements: any[]): any[] {
	const exchanges = [];

	function availableElements(element: any): any[] {
		const n = [];
		for (let x of elements) {
			if (x != element && !(x in exchanges)) {
				n.push(x)
			}
		}
		return n;
	}

    

    for (let e of elements) {
        exchanges.push([e, randomElement(availableElements(e))]);
	}

    return exchanges;
}
