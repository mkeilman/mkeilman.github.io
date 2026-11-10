<?php

$retVal = null;
$res = null;
$year =  $_GET['year'] ?? '';
$execString = 'python3 ../gift_exchange.py ' . year . ' --regift'

header('Content-type: application/json');

//$res = shell_exec(escapeshellcmd('python3 gift_exchange.py 2025 --regift'));
// use exec to see possible errors in the return value
// (could fail silently otherwise)
exec($execString, $res, $retVal);
// exec result is an array!
echo json_encode($res[0]);
//echo $res;
//echo $retVal;
?>
