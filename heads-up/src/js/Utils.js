class Utils {
    static capitalize(str) {
        return str[0].toUpperCase() + str.slice(1);
    }

    static distinctElementsAtPositions(arr, posArr) {
		const elements = [];
		for (const pos of posArr) {
			if (pos >= 0 && pos < arr.length) {
				elements.push(arr[pos]);
			}
		}
		return elements;
	}

    static elementsAtPositions(arr, posArr)  {
		return arr.filter(x => posArr.includes(arr.indexOf(x)));
	}

    static indexArray(size) {
        const arr = new Array(size);
        for (let i = 0; i < size; ++i) {
            arr[i] = i;
        }
        return arr;
    }

    static invertMap(m) {
        const v = Object.values(m);
        if (new Set(v).size !== v.length) {
            throw new Error('Map in not onto');
        }
        const n = {};
        Object.keys(m).forEach((x, i) => {
            n[v[i]] = x;
        });
        return n;
    }

    static log(...items) {
        console.log(...items);
    }

    static randomIndicesForArrayOfSize(size) {
        const arr= [];
        const iArr = Utils.indexArray(size);
        let temp = 0;
        for (let i = 0; i < size; ++i) {
            const r =  Math.floor(Math.random() * (size - i));
            arr.push(iArr[r]);
            temp = iArr[r];
            iArr[r] = iArr[size - i - 1];
            iArr[size - i - 1] = temp;
        }
        return arr;
    }
}

export {Utils}
