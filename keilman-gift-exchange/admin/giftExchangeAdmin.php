<?php

$res = null;
$retVal = null;

$mode = $_GET['mode'] ?? '';
$year =  $_GET['year'] ?? '';

$GIFT_DATA_TEMPLATE = [
    'participants' => [],
    'inclusions' => [],
    'exclusions' => []
];

function dataFile($y) {
    return '../data/' . $y . '.json';
}

function getParticipant($code, $data) {
    $participants = $data['participants'];
    foreach ($participants as $k => $v) {
        if ($v['code'] == $code) {
            return $v;
        }
    }
    return null;
}

function getGifterOfParticipant($code, $data) {
    $participants = $data['participants'];
    foreach ($participants as $k => $v) {
        if ($v['gifteeCode'] == $code) {
            return $v;
        }
    }
    return null;
}

function returnError($code, $message) {
    error_log($message);
    echo json_encode(
        [
            'status' => 'error',
            'code' => $code,
            'message' => $message
        ]
    );
    exit();
}

// posted json, if any; must use php://input, not $_POST.
// returns false if no data or other error
$dataIn = file_get_contents('php://input');

header('Content-type: application/json');

// config mode saves the provided config
if ($mode == 'config') {
    if ($dataIn == false) {
        returnError(400, 'no data provided');
    }
    
    // if the provided year has no data file, create one before
    // saving the change
    $activeYear = json_decode($dataIn, true)['activeYear'];
    $dataFile = dataFile($activeYear);
    
    if (! file_exists($dataFile)) {
        $n = file_put_contents($dataFile, json_encode($GIFT_DATA_TEMPLATE), LOCK_EX);
        if ($n == false) {
            returnError(500, 'error writing to ' . $dataFile);
            return;
        }
    }
    
    file_put_contents('config.json', $dataIn, LOCK_EX);
    echo $dataIn;
    return;
}

// notify mode emails the gifter of the sender that there
// are new gift suggestions
if ($mode == 'notify') {
    $code = $_GET['code'] ?? '';
    if ($code == '') {
        returnError(400, 'no code provided');
    }
    
    $dataFile = dataFile($year);
    
    if (! file_exists($dataFile)) {
        returnError(404, 'no gift data for ' . $year);
    }
    $data = json_decode(file_get_contents($dataFile), true);
    $g = getGifterOfParticipant($code, $data);
    if ($g == null) {
        returnError(404, 'no gifter assigned');
    }
    
    $email = $g['email'];
    if ($email == null) {
        returnError(500, 'gifter has no email');
    }
    
    $gifterURL = 'https://slickanix.com/giftExchange/index.html?year=' . $year . '&code=' . $code;
    
    $headers = [
        'From' => 'support@slickanix.com',
        'Reply-To' => 'support@slickanix.com',
        'X-Mailer' => 'PHP/' . phpversion()
    ];
    
    mail(
        $email,
        'Keilman Gift Exchange',
        'Your giftee has new gift suggestions! Visit ' . $gifterURL . ' to see them!',
        $headers
    );
    
    return;
}

// update mode saves the provided data
if ($mode == 'update') {
    if ($dataIn == false) {
        returnError(400, 'no data provided');
    }
    
    $dataFile = dataFile($year);
    //error_log('updating ' . $dataFile);
    $n = file_put_contents($dataFile, $dataIn, LOCK_EX);
    if ($n == false) {
        returnError(500, 'error writing to ' . $dataFile);
    }
    
    //error_log('wrote ' . $n . ' bytes');
    echo $dataIn;
    return;
}
exit();
$execString = 'python3 ../gift_exchange.py ' . $year . ' --regift';

//$res = shell_exec(escapeshellcmd('python3 gift_exchange.py 2025 --regift'));
// use exec to see possible errors in the return value
// (could fail silently otherwise)
exec($execString, $res, $retVal);
// exec result is an array!
echo json_encode($res[0]);
//echo $res;
//echo $retVal;
?>
