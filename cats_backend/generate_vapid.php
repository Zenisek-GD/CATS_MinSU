<?php
require 'vendor/autoload.php';
use Minishlink\WebPush\VAPID;

$vapid = VAPID::createVapidKeys();
echo "VAPID_PUBLIC_KEY=" . $vapid['publicKey'] . "\n";
echo "VAPID_PRIVATE_KEY=" . $vapid['privateKey'] . "\n";
