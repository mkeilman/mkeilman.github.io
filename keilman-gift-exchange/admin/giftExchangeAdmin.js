'use strict';

const PARTICIPANT_ROW_ID_PREFIX = 'participant-';

/*
const NO_SUCH_KEY = 'NO_SUCH_KEY';

let dirty = false;

const queryValForKey = (key) => {
    location.search.substr(1).split('&').forEach((item) => {
        const tmp = item.split('=');
        if (tmp[0] === key) {
            return decodeURIComponent(tmp[1]);
        }
    });
    return NO_SUCH_KEY;
}

const pIDFromQuery = () => queryValForKey('pID');

const jsonFileFromQuery = () => {
    const pID = pIDFromQuery();
    let f = null;
    return pID == NO_SUCH_KEY ? null : `${pID}.json`;
}
*/


const addParticipant = (participantData) => {
    const name = document.getElementById('newName').value.trim();
    const participants = participantData.participants;
    if (! name || name in participants) {
        return;
    }
    participants[name] = {
        name: name,
        giftee: '',
        gifteeCode: '',
        suggestions: [],
        code: name,
    }
    buildParticipantTable(participantData);
};

const buildPairTable = (participantData, pairType) => {
    
    const pairs = participantData[pairType];
    const t = document.getElementById(`${pairType}Table`);
    
    for (let p of pairs) {
        const row = document.createElement('tr');
        for (let g of p) {
            const d = document.createElement('td');
            d.appendChild(document.createTextNode(g));
            row.appendChild(d);
        }
        t.appendChild(row);
    }
};


const buildParticipantTable = (participantData) => {
    
    // non-anonymous so re-adding does not duplicate listeners
    function addParticipantListener() {
        addParticipant(participantData);
    }
    
    //console.log(participantData);
    const participants = participantData.participants;
    document.getElementById('addParticipant')
        .addEventListener('click', addParticipantListener);
    const nameField =  document.getElementById('newName');
    
    // clear the text fields
    nameField.value = '';

    const t = document.getElementById('participantTable');
    
    // easiest to clear out all participants and regenerate them
    // start at the end so the row is always the "last"
    for (let i = t.children.length - 1; i >= 0; --i) {
        const r = t.children[t.children.length - 1];
        if (r.id.startsWith(PARTICIPANT_ROW_ID_PREFIX)) {
            t.deleteRow(-1);
        }
    }

    for (let name in participants) {
        t.appendChild(buildRow(name, participantData));
    }
};


const buildRow = (name, participantData) => {
    
    const participants = participantData.participants;
    const p = participants[name];
    const row = document.createElement('tr');
    row.setAttribute('id', participantRowId(name));
                
    let el = document.createElement('td');
    el.appendChild(document.createTextNode(name));
    row.appendChild(el);
    
    el = document.createElement('td');
    const g = p.giftee;
    const c = p.code;
    //console.log('G', g, 'C', c);
    const link = g && c ? `https://slickanix.com/giftExchange/index.html?code=${c}` : 'N/A';
    //el.appendChild(document.createTextNode(p.giftee || 'N/A'));
    const anchor = document.createElement('a');
    anchor.setAttribute('href', link);
    anchor.innerHTML = c;
    //el.appendChild(document.createTextNode(link));
    el.appendChild(anchor);
    row.appendChild(el);
    
    el = document.createElement('td');
    const b = document.createElement('button');
    b.setAttribute('type', 'button');
    b.setAttribute('value', 'Delete');
    b.setAttribute('title', `Delete ${p.name}`);
    b.appendChild(document.createTextNode('\u20E0'));
    
    // note this cannot be done by setting the onclick attribute - 
    // "p" is not defined in the global scope
    b.addEventListener(
        'click',
        () => { deleteParticipant(name, participantData); }
    );
    el.appendChild(b);
    row.appendChild(el);

    return row;
};

const buildTables = (participantData) => {
    buildParticipantTable(participantData);
    ['inclusions', 'exclusions'].forEach(x => buildPairTable(participantData, x));
}

const deleteParticipant = (name, participantData) => {
    delete participantData.participants[name];
    buildParticipantTable(participantData);
};

const init = (participantData) => {
    document
        .getElementById('regenerateButton')
        .addEventListener(
            'click',
            () => { regenerateExchanges(buildParticipantTable); }
    );
    buildTables(participantData);
};


const participantRowId = (name) => `${PARTICIPANT_ROW_ID_PREFIX}${name}`;

const regenerateExchanges = async (callback) => {
    const year = document.getElementById('yearText').value.trim();
    const url = `https://slickanix.com/giftExchange/admin/giftExchangeAdmin.php?year=${year}`;

    try {
        const res = await fetch (
            url,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            }
        );
        exchangeData = await res.json();
        if (callback) {
            // we get back a string, so we must parse it here
            callback(JSON.parse(exchangeData));
        }
    }
    catch (error) {
        console.log(error);
    }
};

const saveParticipants = (participantData) => {
    
};

const setActiveYear = async () => {
    const url = `https://slickanix.com/giftExchange/admin/giftExchangeAdmin.php?year=${year}&mode=config`;
    const json = JSON.stringify(adminConfig, null, 4);

    try {
        const _ = await fetch (
            url,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: json,
            }
        );
        buildSuggestionTable(gifter);
    }
    catch (error) {
        console.log(error);
    }
};
