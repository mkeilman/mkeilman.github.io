'use strict';

const PARTICIPANT_ROW_ID_PREFIX = 'participant-';

const addParticipant = () => {
    const name = document.getElementById('newName').value.trim();
    const participants = giftData.participants;
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
    buildParticipantTable();
};

const buildPairTable = (pairType) => {
    
    const pairs = giftData[pairType];
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


const buildParticipantTable = () => {
    
    // non-anonymous so re-adding does not duplicate listeners
    function addParticipantListener() {
        addParticipant(giftData);
    }
    
    //console.log(giftData);
    const participants = giftData.participants;
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
        t.appendChild(buildRow(name));
    }
};


const buildRow = (name) => {
    
    const participants = giftData.participants;
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
    const link = g && c ? `https://slickanix.com/giftExchange/index.html?year=${adminConfig.activeYear}&code=${c}` : 'N/A';
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
        () => { deleteParticipant(name); }
    );
    el.appendChild(b);
    row.appendChild(el);

    return row;
};

const buildTables = () => {
    buildParticipantTable(giftData);
    ['inclusions', 'exclusions'].forEach(x => buildPairTable(x));
}

const changeYear = async () => {
    adminConfig.activeYear = document.getElementById('yearText').value;
    await saveAdminConfig();
};

const deleteParticipant = (name) => {
    delete giftData.participants[name];
    buildParticipantTable();
};

const loadAdminConfig = async () => {
    adminConfig = await loadData('https://slickanix.com/giftExchange/admin/config.json');
    //return cfg || {};
};

const initAdmin = async () => {
    await updateAdmin();
    document.getElementById('yearText').value = adminConfig.activeYear;
    
    document
        .getElementById('regenerateButton')
        .addEventListener(
            'click',
            () => { regenerateExchanges(buildParticipantTable); }
    );
};

const loadGiftData = async () => {
    giftData = await loadData(`https://slickanix.com/giftExchange/data/${adminConfig.activeYear}.json`);
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
        giftData = await res.json();
        if (callback) {
            // we get back a string, so we must parse it here
            callback(JSON.parse(giftData));
        }
    }
    catch (error) {
        console.log(error);
    }
};

const saveAdminConfig = async () => {
    adminConfig = await saveData(
        `https://slickanix.com/giftExchange/admin/giftExchangeAdmin.php?mode=config`,
            adminConfig
        );
    updateAdmin(false);
}

const saveParticipants = (giftData) => {
    
};

const updateAdmin = async (reload=true) => {
    if (reload) {
        await loadAdminConfig();
    }
    await loadGiftData();
    buildTables();
};
