<?php
require_once 'engine.php';
    $obj = new apiAmoController();
    $obj->index();


/*
 *
 * @integration with amo crm
 */
class apiAmoController {
    protected $path;
    protected $config;
    protected $engine;
    protected $um_config;
    public function __construct() {
        $this->path = realpath(dirname(__FILE__) . '/amo');
        $this->config = $this->path.'/config.php';
        $this->engine = new DataHandler($this->path);
        $this->um_config = $this->path.'/um_config.php';
    }

    public function index()
    {
        date_default_timezone_set("Europe/Warsaw");
        $today = date("d/m/Y в H:i ");
        if ($_SERVER["REQUEST_METHOD"] != "POST") {
            header('location: index.html');
            die();
        }
        if(isset($_POST['cartJson'])){
            $cart = $_POST['cartJson'];
        }else $cart = null;

        //
        if(isset($_POST['cartName'])){
            $cartName = $_POST['cartName'];
        }else $cartName = null;

        if(isset($_POST['oldPrice'])){
            $cartOldPrice = $_POST['oldPrice'];
        }else $cartOldPrice = null;

        if(isset($_POST['newPrice'])){
            $cartNewPrice = $_POST['newPrice'];
        }else $cartNewPrice = null;

        if(isset($_POST['quantity'])){
            $cartQuantity = $_POST['quantity'];
        }else $cartQuantity = null;


        if(isset($_POST['name'])){
            $name = $_POST['name'];
        }else $name = null;
        if(isset($_POST['lastname'])){
            $lastname = $_POST['lastname'];
        }else $lastname = null;
        if(isset($_POST['address'])){
            $address = $_POST['address'];
        }else $address = null;
        if(isset($_POST['city'])){
            $city = $_POST['city'];
        }else $city = null;
        if(isset($_POST['kod'])){
            $kod = $_POST['kod'];
        }else $kod = null;
        if(isset($_POST['tel'])){
            $tel = $_POST['tel'];
        }else $tel = null;
        $data = [
            'name' => $name,
            'lastname' => $lastname,
            'address' => $address,
            'city' => $city,
            'kod' => $kod,
            'tel' => $tel,
            'date' => $today,
            'cartName' => $cartName,
            'cartOldPrice' => $cartOldPrice,
            'cartNewPrice' => $cartNewPrice,
            'cartQuantity' => $cartQuantity,
        ];
        if($this->sendAmo($data)){
            header('location: success.html');
            $this->sendTelegram($data);
            die();
        }
        echo '<h3>Ошибка синхронизации с срм! Смотри лог файл.(amo/log.log)</h3>';
        return false;

    }
    protected function getToken()
    {
        require $this->config;

        $dataToken = $this->engine->load($token_file);
        $dataToken = json_decode($dataToken, true);
        if ($dataToken["endTokenTime"] - 60 < time()) {
            // refresh token
            $data = [
                'client_id'     => $client_id,
                'client_secret' => $client_secret,
                'grant_type'    => 'refresh_token',
                'refresh_token' => $dataToken["refresh_token"],
                'redirect_uri'  => $redirect_uri,

            ];
            $response = $this->refreshToken($data, $subdomain);
            $this->engine->save($token_file, $response[0]);
            return [$response[1], $subdomain];
        }
        return [$dataToken["access_token"], $subdomain];

    }
    protected function refreshToken($data, $subdomain)
    {
        $link = "https://$subdomain.amocrm.ru/oauth2/access_token";
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_USERAGENT, 'amoCRM-oAuth-client/1.0');
        curl_setopt($curl, CURLOPT_URL, $link);
        curl_setopt($curl, CURLOPT_HTTPHEADER, ['Content-Type:application/json']);
        curl_setopt($curl, CURLOPT_HEADER, false);
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'POST');
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 1);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 2);
        $out = curl_exec($curl);
        $code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        $code = (int)$code;
        if ($code < 200 || $code > 204) {
            //log
            $this->engine->save('log.log', 'refresh token error: '. $code);
            die();
        }
        $response = json_decode($out, true);
        $arrParamsAmo = [
            "access_token"  => $response['access_token'],
            "refresh_token" => $response['refresh_token'],
            "token_type"    => $response['token_type'],
            "expires_in"    => $response['expires_in'],
            "endTokenTime"  => $response['expires_in'] + time(),
        ];
        $arrParamsAmo = json_encode($arrParamsAmo);
        return [$arrParamsAmo, $response['access_token']];
    }

    protected function sendAmo($data)
    {
        $array = $this->getToken();
        $subdomain = $array[1];
        $access_token = $array[0];
        $methodTags = "/api/v4/leads/tags";
        $link = "https://".$subdomain.".amocrm.ru".$methodTags;
        $cookie = $this->path.'/cookie.txt';
        include $this->um_config;
        //$cart = json_decode($data['cart'], true);
        $title = '';
        $total_cost = 0;
        $name_main = '';
        $qty_main = 0;
        $name_prod_2 = '';
        $qty_prod_2 = 0;
        $name_prod_3 = '';
        $qty_prod_3 = 0;
        $price_main = 0;
        $price_prod_2 = 0;
        $price_prod_3 = 0;
        // sizes for the first message template
        $main_size = '';
        $prod2_size = '';
        $prod3_size = '';

 /*       foreach($cart as $index => $item){
            $abr = $this->createAbbreviation($item['name']);
            $title .= $item['qty'].' '.$abr.'+';
            $total_cost += $item['qty'] * $item['priceNow'];
            if($index == 0){
                $name_main = $this->extractBeforeDash($item['name']);
                $qty_main = $item['qty'];
                $price_main = $item['priceNow'];
            }
            if($index == 1){
                $name_prod_2 = $this->extractBeforeDash($item['name']);
                $qty_prod_2 = $item['qty'];
                $price_prod_2 = $item['priceNow'];
            }
            if($index == 2){
                $name_prod_3 = $this->extractBeforeDash($item['name']);
                $qty_prod_3 = $item['qty'];
                $price_prod_3 = $item['priceNow'];
            }
            if($index == 3){
                $name_prod_3 = $name_prod_3.' + '.$this->extractBeforeDash($item['name']);
                $qty_prod_3 = $qty_prod_3+$item['qty'];
                $price_prod_3 = $price_prod_3+$item['priceNow'];
            }
           // $name_main .= $this->getFirstTwoNonNumericWords($item['name']).'; ';

          //  $qty_main += 1;
        }
        */
      //  $this->engine->save('log.log', 'cart : '.print_r($data, true));
        $abr = $this->createAbbreviation($data['cartName']);
        $title = $data['cartQuantity'].' '.$abr;
        $total_cost = (int) $data['cartNewPrice'];
        $name_main = $this->extractBeforeDash($data['cartName']);
        $qty_main = (int) $data['cartQuantity'];
        if($qty_main !== 0){
            $price_main = (int) $data['cartNewPrice'] / $qty_main;
        }



        if($total_cost == 0){
            //log
            $this->engine->save('log.log', 'cart error: ');
        }

       // $total_cost = $total_cost + 21;
 //       if (str_ends_with($title, '+')) {
 //           $title = substr($title, 0, -1);
  //      }
   //     if(str_ends_with($name_main, '; ')) {
    //        $name_main = substr($name_main, 0, -1);
    //    }

/*
        $main = $cart[0];
        if(isset($cart[1])){
            $prod_2 = $cart[1];
        }else $prod_2 = null;

        $price_main = $main['priceNow'];
        $price_prod_2 = ($prod_2 == null) ? 0 : $prod_2['priceNow'];
        $qty_main = $main['qty'];
        $qty_prod_2 = ($prod_2 == null) ? 0 : $prod_2['qty'];
        $total_cost = $qty_main * $price_main + $price_prod_2 * $qty_prod_2;
        $name_main_array = explode(' ', $main['name']);
        $name_main = $name_main_array[0].' '.$name_main_array[1];
        if($prod_2 != null){
            $name_prod_2_array = explode(' ', $prod_2['name']);
            $name_prod_2 = $name_prod_2_array[0].' '.$name_prod_2_array[1];
        } else $name_prod_2 = null;

        $title = $main['qty'].' PR'.($prod_2 == null ? "" : '+'.$prod_2['qty'].' DS');
*/
        $dataTags = [
        //    [
        //        "name" => $_SERVER['SERVER_NAME'],
        //    ],
            [
                "name" => $data['tel'],
            ],
        ];
        $headers = [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $access_token,
        ];
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_USERAGENT, 'amoCRM-API-client/1.0');
        curl_setopt($curl, CURLOPT_URL, $link);
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'POST');
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($dataTags));
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($curl, CURLOPT_HEADER, false);
        curl_setopt($curl, CURLOPT_COOKIEFILE, $cookie);
        curl_setopt($curl, CURLOPT_COOKIEJAR, $cookie);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);

        $out = curl_exec($curl);
        $code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        $code = (int) $code;

        $responseBody = '';
        $tag_phone_id = null;
        $tag_domain_id = null;
        if ($code === 200) {
            $responseBody = json_decode($out, true);
            if (isset($responseBody['_embedded']['tags'])) {
                $tags = $responseBody['_embedded']['tags'];

                if (isset($tags[0]['id'])) {
                    $tag_phone_id = $tags[0]['id'];
                }
              //  if (isset($tags[1]['id'])) {
               //     $tag_domain_id = $tags[0]['id'];
              //  }
            }
        }
        if ($code < 200 || $code > 204){
            // log
            $this->engine->save('log.log', 'send tags error: '. $code);
            die();
        }
        date_default_timezone_set("Europe/Warsaw");
        $dataLead = [
            [
                "name" => $title,
                "price" => $total_cost,
                "_embedded" => [
                    "contacts" => [
                        [
                            "name" => $data['name'].' '.$data['lastname'],
                            "custom_fields_values" => [
                                [
                                    "field_code" => "PHONE",
                                    "values" => [
                                        [
                                            "enum_code" => "WORK",
                                            "value" => $data['tel'],
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ],
                    "tags" => [
                        [
                            "id" => (int)$tag_phone_id
                        ],
                    //    [
                     //       "id"=> (int)$tag_domain_id
                     //   ]
                    ]
                ],
                'custom_fields_values' => [
                    [
                        'field_id' => (int) $field_id_order, // ID кастомного поля "order"
                        'values' => [
                            [
                                'value' => $name_main
                            ]
                        ]
                    ],
                    [
                        'field_id' => (int) $field_id_kod, // ID кастомного поля "kod"
                        'values' => [
                            [
                                'value' => $data['kod']//$kod
                            ]
                        ]
                    ],
                    [
                        'field_id' => (int) $field_id_name, // ID кастомного поля "name"
                        'values' => [
                            [
                                'value' => $data['name'].' '.$data['lastname']//$name
                            ]
                        ]
                    ],
                    [
                        'field_id' => (int) $field_id_phone, // ID кастомного поля "phone"
                        'values' => [
                            [
                                'value' => $data['tel']
                            ]
                        ]
                    ],
                    [
                        'field_id' => (int) $field_id_city, // ID кастомного поля "city"
                        'values' => [
                            [
                                'value' => $data['city']//$city
                            ]
                        ]
                    ],
                    [
                        'field_id' => (int) $field_id_adress, // ID кастомного поля "address"
                        'values' => [
                            [
                                'value' => $data['address']
                            ]
                        ]
                    ],
                    [
                        'field_id' => (int) $field_id_quantity, // ID кастомного поля " main qnt"
                        'values' => [
                            [
                                'value' => (int)$qty_main
                            ]
                        ]
                    ],
                    [
                        'field_id' => (int) $field_id_today, // ID кастомного поля recent date
                        'values' => [
                            [
                                'value' => date("d/m/Y в H:i ")
                            ]
                        ]
                    ],
                    [
                        'field_id' => (int) $field_id_price, // ID кастомного поля price of main prod
                        'values' => [
                            [
                                'value' => $price_main
                            ]
                        ]
                    ],
                    [
                        'field_id' => (int) $field_id_size, // ID кастомного поля price of main prod
                        'values' => [
                            [
                                'value' => $main_size
                            ]
                        ]
                    ],

                    ['field_id' => (int) $field_id_quantity1, // ID кастомного поля quantity prod2
                        'values' => [
                            [
                                'value' => $qty_prod_2
                            ]
                        ]
                    ],
                    ['field_id' => (int) $field_id_order1, // ID кастомного поля "name-2"
                        'values' => [
                            [
                                'value' => $name_prod_2
                            ]
                        ]
                    ],
                    ['field_id' => (int) $field_id_price1, // ID кастомного поля "name-2"
                        'values' => [
                            [
                                'value' => $price_prod_2
                            ]
                        ]
                    ],
                    [
                        'field_id' => (int) $field_id_size1, // ID кастомного поля price of main prod
                        'values' => [
                            [
                                'value' => $prod2_size
                            ]
                        ]
                    ],

                    ['field_id' => (int) $field_id_order2, // ID кастомного поля "name-2"
                        'values' => [
                            [
                                'value' => $name_prod_3
                            ]
                        ]
                    ],
                    ['field_id' => (int) $field_id_quantity2, // ID кастомного поля "name-2"
                        'values' => [
                            [
                                'value' => $qty_prod_3
                            ]
                        ]
                    ],
                    ['field_id' => (int) $field_id_price2, // ID кастомного поля "name-2"
                        'values' => [
                            [
                                'value' => $price_prod_3
                            ]
                        ]
                    ],
                    [
                        'field_id' => (int) $field_id_size2, // ID кастомного поля price of main prod
                        'values' => [
                            [
                                'value' => $prod3_size
                            ]
                        ]
                    ],

                ],
            ]
        ];

        $methodLead = "/api/v4/leads/complex";
        $link = "https://".$subdomain.".amocrm.ru".$methodLead;

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_USERAGENT, 'amoCRM-API-client/1.0');
        curl_setopt($curl, CURLOPT_URL, $link);
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'POST');
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($dataLead));
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($curl, CURLOPT_HEADER, false);
        curl_setopt($curl, CURLOPT_COOKIEFILE, $cookie);
        curl_setopt($curl, CURLOPT_COOKIEJAR, $cookie);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);

        $out = curl_exec($curl);

        $code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        $code = (int) $code;
        if ($code < 200 || $code > 204){
            //log
            $this->engine->save('log.log', 'send lead error: '. $code.' out: '.print_r($out, true));
            die();
        }
        return true;

    }

    protected  function createAbbreviation($string) {
        $trimmed = trim($string);
        $words = preg_split('/\s+/', $trimmed);

        $filteredWords = array_filter($words, function($word) {
            return preg_match('/[a-zA-Zа-яА-Я]/', $word);
        });
        if (empty($filteredWords)) {
            return '';
        }

        $firstTwoWords = array_slice($filteredWords, 0, 2);
        $abbreviation = '';

        foreach ($firstTwoWords as $word) {
            if (preg_match('/[a-zA-Zа-яА-Я]/u', $word, $matches)) {
                $abbreviation .= mb_strtoupper($matches[0]);
            }
        }

        return $abbreviation;
    }

    protected  function getFirstTwoNonNumericWords($string) {
        $trimmed = trim($string);
        $words = preg_split('/\s+/', $trimmed);

        $filteredWords = array_filter($words, function($word) {
            return preg_match('/[a-zA-Zа-яА-Я]/u', $word);
        });

        $firstTwoWords = array_slice($filteredWords, 0, 2);
        return implode('-', $firstTwoWords);
    }

    protected function extractBeforeDash($string) {
        // Разделяем строку по тире (с учетом пробелов вокруг)
        $parts = preg_split('/\s*[—\-]\s*/u', $string, 2);

        // Возвращаем первую часть (до тире), обрезая пробелы
        return trim($parts[0]);
    }

    protected function sendTelegram($data)
    {
        $token = "6298998649:AAG6wLxg9uAE5iaHUPn-Vb_RCrMHQFUSzYk";
        $chat_id = "-1001956913033";

        $message = $this->createMessage($data);
        $url = "https://api.telegram.org/bot" . $token;
        $params=[
            'chat_id'=>$chat_id,
            'text'=>$message,
        ];
        $ch = curl_init($url . '/sendMessage');
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, ($params));
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $result = curl_exec($ch);
        curl_close($ch);
        if ($result) {
            return true;
        } else {
            return false;
        }
    }

    protected function createMessage($data)
    {
        $abr = $this->createAbbreviation($data['cartName']);
        $title = $data['cartQuantity'].' '.$abr;
        $total_cost = (int) $data['cartNewPrice'];
        $name_main = $this->extractBeforeDash($data['cartName']);
        $qty_main = (int) $data['cartQuantity'];
        if($qty_main !== 0){
            $price_main = (int) $data['cartNewPrice'] / $qty_main;
        }else $price_main = 0;

        $message = 'Заголовок: '.$title."\n";
        $message .= "****************** \n";
        $message .= 'Товар: '.$name_main."\n";
        $message .= 'Количество: '.$qty_main."\n";
        $message .= 'Цена: '.$price_main.' zł'."\n";
        $message .= 'Общая стоимость: '.$total_cost.' zł'."\n";
        $message .= "******************\n";
        $message .= "Имя: ".$data['name'].' '.$data['lastname']."\n";
        $message .= 'Телефон: '. $data['tel']."\n";
        $message .= 'Адрес: '.$data['address']."\n";
        $message .= 'Город: '.$data['city']."\n";
        $message .= 'Индекс: '.$data['kod']."\n";
        $message .= "******************\n";
        return $message;
    }

}
