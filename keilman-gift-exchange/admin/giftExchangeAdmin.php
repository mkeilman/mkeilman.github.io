<?php

$retVal = null;
$res = null;

header('Content-type: application/json');

//$res = shell_exec(escapeshellcmd('python3 gift_exchange.py 2025 --regift'));
// use exec to see possible errors in the return value
// (could fail silently otherwise)
exec('python3 ../gift_exchange.py 2025 --regift', $res, $retVal);
// exec result is an array!
echo json_encode($res[0]);
//echo $res;
//echo $retVal;
?>
