<?php

$res = null;
$retVal = null;

$mode = $_GET['mode'] ?? '';
$year =  $_GET['year'] ?? '';

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
    file_put_contents('config.json', $dataIn, LOCK_EX);
    echo json_encode($dataIn);
    return;
}

// update mode saves the provided data
if ($mode == 'update') {
    $dataFile = '../data/' . $year . '.json';
    //error_log('updating ' . $dataFile);
    $n = file_put_contents($dataFile, $dataIn, LOCK_EX);
    
    if ($n == false) {
        returnError(500, 'error writing to ' . $dataFile);
        return;
    }
    
    //error_log('wrote ' . $n . ' bytes');
    echo json_encode($dataIn);
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
