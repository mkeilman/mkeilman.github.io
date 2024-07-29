class Utils {
    	static randomIndicesForArrayOfSize(size) {
            const arr= [];
            const iArr = new Array(size).fill(0);
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
