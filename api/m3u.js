export default async function handler(req, res) {
    try {
        // Adamın asıl yayın sağlayan gizli linki (senin bulduğun link)
        const targetUrl = 'https://boru-android-tv.vercel.app/boru-tv-2026?token=girtlaga-kadar-sokarim-kulaklarin-ister-serefsiz-uygulamana-sicarim';
        
        // 1. Vercel robotumuz adamın sitesine gizlice bağlanıyor
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        const htmlText = await response.text();
        
        // 2. HTML kodunun içindeki 'channelsData = {...}' kısmını cımbızla çekiyoruz (Kazıma/Scraping işlemi)
        const match = htmlText.match(/const channelsData\s*=\s*({[\s\S]*?});\s*const categoryOrder/);
        
        if (!match || !match[1]) {
            return res.status(500).send("Adamın sitesinden kanal verisi çekilemedi. Link değişmiş olabilir.");
        }
        
        // Veriyi kullanılabilir JSON formatına çeviriyoruz
        const channelsJson = JSON.parse(match[1]);
        
        // 3. JSON verisini standart bir IPTV M3U listesine dönüştürüyoruz
        let m3u = "#EXTM3U\n";
        
        for (const group in channelsJson) {
            const channels = channelsJson[group];
            for (const ch of channels) {
                m3u += `#EXTINF:-1 tvg-chno="${ch.number}" tvg-logo="${ch.logo}" group-title="${group}",${ch.name}\n`;
                m3u += `${ch.url}\n`;
            }
        }
        
        // 4. Sonucu M3U dosyası olarak dışarı aktarıyoruz
        res.setHeader('Content-Type', 'audio/x-mpegurl; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="kablotv-guncel.m3u"');
        res.status(200).send(m3u);
        
    } catch (error) {
        res.status(500).send("Bir hata oluştu: " + error.message);
    }
}
