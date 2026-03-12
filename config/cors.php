<?php

return [

    'paths' => ['api/*', 'broadcasting/auth'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['https://ead.dcmmarketingdigital.com.br','http://localhost:5173','http://localhost:5174','http://localhost:8080','http://localhost'],

    'allowed_headers' => ['*'],

    'supports_credentials' => true,

];