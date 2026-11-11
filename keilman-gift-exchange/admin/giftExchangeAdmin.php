<?php

$retVal = null;
$res = null;
$year =  $_GET['year'] ?? '';
$dataFile = '../data/' . $year . '.json';
$execString = 'python3 ../gift_exchange.py ' . $year . ' --regift';
$mode = $_GET['mode'] ?? '';

header('Content-type: application/json');

// update mode saves the provided data
// must use php://input to get json
if ($mode == 'update')
    $newData = file_get_contents('php://input');
    file_put_contents($dataFile, $newData, LOCK_EX);
    echo json_encode($newData);
    return;

//$res = shell_exec(escapeshellcmd('python3 gift_exchange.py 2025 --regift'));
// use exec to see possible errors in the return value
// (could fail silently otherwise)
exec($execString, $res, $retVal);
// exec result is an array!
echo json_encode($res[0]);
//echo $res;
//echo $retVal;
?>
