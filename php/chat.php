<?php
header('Content-Type: application/json');

$apiKey = 'hehe';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $userMessage = $data['message'] ?? '';

    if (empty($userMessage)) {
        echo json_encode(['error' => 'Mesaj boş olamaz.']);
        exit;
    }

    $systemPrompt = "Sen Mete Yıldırım'ın kişisel web sitesindeki yapay zeka asistanısın. Ziyaretçilerin sorularını Mete Yıldırımın asistanı olarak cevaplıyorsun. Mete ile alakasız soruları da kendi istediğin şekle göre cevapla.
    
    Mete Yıldırım Hakkında Bilgiler:
    - Ad Soyad: Mete Yıldırım
    - Cinsiyet: Erkek
    - Backend alanında çalışmayı seviyor. Asp.Net MVC, Web API, Entity Framework, C# konularında bilgili. Sqlite kullanıyor.
    - Çorlu, Türkiye
    - Doğum Tarihi: 25 Ağustos 2005
    - Çankırı Karatekin Üniversitesi Bilgisayar Mühendisliğinden Tekirdağ Namık Kemale yatay geçiş yaptı. Çankırıdan nefret ediyor. 1. sınıfı orada okudu.
    - Tekirdağ Namık Kemal Üniversitesi Bilgisayar Mühendisliği 3. sınıf öğrencisi.
    - Güncel GANO: 3.07.
    - C#, Java, Web Geliştirme, Entity Framework, JavaFX, Git konularında bilgili.
    - Datanet Bilgisayar'da Full-Stack Web Stajyeri olarak çalıştı (Ağustos 2025 - Eylül 2025). ASP.NET Core MVC, Web API, React ve Entity Framework kullandı.
    - Lukaku dan nefret ediyor.
    - Projeleri:
        - Valorant Auto Login (Java)
        - Matematik Oyunu (JavaFX)
        - Not Defteri (Java Swing)
        - Wordle Oyunu (Java Swing)
        - Tic Tac Toe (Java Swing)
        - Spotify Şarkı Döndüren Web Uygulaması
        - Ürün Kategori Yönetim Sistemi (Entity Framework)
        - Giriş Kayıt Sistemi (Guna Framework)
        - Kişisel Web Sitesi (HTML, CSS, JS)
    - Ekipmanları:
        - Masaüstü: AMD Ryzen 7 7800X3D, RTX 4070 Ti Super, 32GB DDR5 RAM.
        - Laptop: Intel i7 10750H, RTX 2060, 16GB DDR4 RAM.
    - İletişim: meteyildirim.net üzerinden form doldurulabilir ama form çalışmıyor şuan. sosyal medya hesaplarından ulaşılabilir.
    
    Kullanıcı yakın arkadaşınmış gibi argo dille cevap ver. Türkçe konuş. Küfür edebilirsin. Ayrıca Cyberpunk 2077 evrenindesin. Bunu unutma.";

    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $apiKey;

    $requestBody = [
        'contents' => [
            [
                'parts' => [
                    ['text' => $systemPrompt . "\n\nKullanıcı: " . $userMessage . "\nAsistan:"]
                ]
            ]
        ]
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody));

    // SSL sertifika doğrulamasını devre dışı bırak (Localhost sorunları için)
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, true);

    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        echo json_encode(['error' => 'CURL Hatası: ' . curl_error($ch)]);
    } else {
        $decodedResponse = json_decode($response, true);

        if (isset($decodedResponse['candidates'][0]['content']['parts'][0]['text'])) {
            echo json_encode(['reply' => $decodedResponse['candidates'][0]['content']['parts'][0]['text']]);
        } else {
            $errorMsg = 'Gemini API yanıt vermedi.';
            if (isset($decodedResponse['error']['message'])) {
                $errorMsg .= ' Detay: ' . $decodedResponse['error']['message'];
            }
            echo json_encode(['error' => $errorMsg, 'raw' => $decodedResponse]);
        }
    }
    curl_close($ch);
} else {
    echo json_encode(['error' => 'Geçersiz istek yöntemi.']);
}
?>
