class Utils {
    static capitalize(str) {
        return str[0].toUpperCase() + str.slice(1);
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
