'use strict';

const loadData = async (url) => {
    let data;
    const q = url.includes('?') ? '&' : '?';
    try {
        // tack on the timestamp for cache-busting
        const res = await fetch (
            url + `${q}t=${new Date().getTime()}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Basic ' + 'c2xpY2thbml4R2lmdFg6Z3JlbmFkaW5lLWltbW9yYWwtY2hldnJvbg=='
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
                    'Authorization': 'Basic ' + 'c2xpY2thbml4R2lmdFg6Z3JlbmFkaW5lLWltbW9yYWwtY2hldnJvbg=='
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
