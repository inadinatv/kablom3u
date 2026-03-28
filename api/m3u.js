export default async function handler(req, res) {
    // Adamın asıl yayın sağlayan gizli linki
    const targetUrl = 'https://boru-android-tv.vercel.app/boru-tv-2026/?token=girtlaga-kadar-sokarim-kulaklarin-ister-serefsiz-uygulamana-sicarim';
    
    try {
        // Vercel robotumuz adamın sitesine bağlanıyor
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const htmlText = await response.text();
        
        // 1. İHTİMAL: Hedef site 404 (Bulunamadı) veriyor olabilir
        if (response.status === 404 || htmlText.includes('404: NOT_FOUND')) {
            return res.status(404).send("HATA: Hedef site (BoruTV) 404 hatası veriyor. Adam linki silmiş veya klasör adını değiştirmiş olabilir.");
        }
        
        // 2. İHTİMAL: Site açıldı ama adam kodu şifrelemiş/değiştirmiş
        const match = htmlText.match(/channelsData\s*=\s*(\{[\s\S]+?\});/);
        
        if (!match) {
            return res.status(500).send("HATA: Site açıldı ama kanallar yok. Gelen sayfanın ilk 500 harfi:\n\n" + htmlText.substring(0, 500));
        }
        
        // BAŞARILI: Veriyi JSON formatına çevirip M3U yapıyoruz
        const channelsJson = JSON.parse(match[1]);
        let m3u = "#EXTM3U\n";
        
        for (const group in channelsJson) {
            for (const ch of channelsJson[group]) {
                m3u += `#EXTINF:-1 tvg-chno="${ch.number}" tvg-logo="${ch.logo}" group-title="${group}",${ch.name}\n`;
                m3u += `${ch.url}\n`;
            }
        }
        
        // M3U dosyası olarak indirtiyoruz
        res.setHeader('Content-Type', 'audio/x-mpegurl; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="kablotv-guncel.m3u"');
        res.status(200).send(m3u);
        
    } catch (error) {
        res.status(500).send("Bir hata oluştu: " + error.message);
    }
}
