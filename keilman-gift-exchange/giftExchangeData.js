'use strict';

const loadData = async(url) => {
    let data;
    try {
        // tack on the timestamp for cache-busting
        const res = await fetch (
            url + `?t=${new Date().getTime()}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            }
        );
        data = await res.clone().json();
    }
    catch (error) {
        console.log(error);
    }
    finally {
        return data;
    }
};

const saveData = async (url, data) => {
    const json = JSON.stringify(data, null, 4);
    let savedData;

    try {
        const res = await fetch (
            url,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: json,
            }
        );
        // clone the response to ensure the promise is not locked
        savedData = await res.clone().json();
    }
    catch (error) {
        console.log(error);
    }
    finally {
        return savedData;
    }
};
