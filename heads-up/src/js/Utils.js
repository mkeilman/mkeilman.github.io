class Utils {
        static indexArray(size) {
            const arr = new Array(size);
            for (let i = 0; i < size - 1; ++i) {
                arr[i] = i;
            }
            return arr;
        }

        static log(...items) {
            console.log(items);
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
