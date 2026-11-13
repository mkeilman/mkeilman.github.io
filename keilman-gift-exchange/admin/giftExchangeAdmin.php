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

function returnError($code, $message) {
    error_log($message);
    echo json_encode(
        [
            'status' => 'error',
            'code' => $code,
            'message' => $message
        ]
    );
}

function dataFile($y) {
    return '../data/' . $y . '.json';
}

// posted json, if any; must use php://input, not $_POST.
// returns false if no data or other error
$dataIn = file_get_contents('php://input');

if ($dataIn == false) {
    returnError(400, 'no data provided');
    return;
}

header('Content-type: application/json');

// config mode saves the provided config
if ($mode == 'config') {
    
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

// update mode saves the provided data
if ($mode == 'update') {
    $dataFile = dataFile($year);
    //error_log('updating ' . $dataFile);
    $n = file_put_contents($dataFile, $dataIn, LOCK_EX);
    if ($n == false) {
        returnError(500, 'error writing to ' . $dataFile);
        return;
    }
    
    //error_log('wrote ' . $n . ' bytes');
    echo $dataIn;
    return;
}

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
