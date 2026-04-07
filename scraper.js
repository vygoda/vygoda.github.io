const { chromium } = require('playwright');
const axios = require('axios');

const WP_URL = process.env.WP_URL;
const TOKEN = process.env.VYGODA_SCRAPER_TOKEN;

async function scrapeTrains() {
    console.log(`🚀 Start Heavy Scraper (Autonomous)... Target: ${WP_URL}`);
    const browser = await chromium.launch({ headless: true });
    
    // ІМІТУЄМО СУЧАСНИЙ БРАУЗЕР (щоб не блокував Cloudflare)
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0',
        viewport: { width: 1366, height: 768 }
    });
    
    const page = await context.newPage();
    const stations = [
        { id: '2208479', url: 'https://poizdato.net/rozklad-poizdiv-po-stantsii/vyhoda/' },
        { id: '2208001', url: 'https://poizdato.net/rozklad-poizdiv-po-stantsii/odesa-holovna/' }
    ];

    let allResults = [];

    for (const station of stations) {
        console.log(`🔍 Try scraping: ${station.url}`);
        try {
            await page.goto(station.url, { waitUntil: 'load', timeout: 90000 });
            
            // ДАЄМО ЧАС СКРИПТАМ (15 СЕКУНД)
            await page.waitForTimeout(15000); 

            const trains = await page.evaluate((sid) => {
                const data = [];
                // Шукаємо будь-які елементи, які схожі на розклад
                const items = document.querySelectorAll('tr, div.station_table_row');
                items.forEach(el => {
                    const txt = el.innerText;
                    // Ми шукаємо час (00:00) та стрілку чи тире (-> або -)
                    if (txt.includes(':') && txt.length < 200) {
                        const parts = txt.split('\n').map(p => p.trim()).filter(p => p.length > 0);
                        if (parts.length >= 3) {
                            data.push({
                                number: parts[0],
                                route: parts[1],
                                arrival: parts[2],
                                departure: parts[2],
                                station_id: sid
                            });
                        }
                    }
                });
                return data;
            }, station.id);

            if (trains.length > 0) {
                allResults = allResults.concat(trains);
                console.log(`✅ FOUND ${trains.length} TRAINS!`);
            }
        } catch (e) {
            console.error(`❌ Page error: ${e.message}`);
        }
    }

    await browser.close();

    if (allResults.length > 0) {
        console.log(`📤 Push to Staging API: ${WP_URL}`);
        try {
            const resp = await axios.post(WP_URL, { token: TOKEN, trains: allResults }, {
                headers: { 'X-Vygoda-Token': TOKEN, 'Content-Type': 'application/json' },
                timeout: 30000
            });
            console.log('--- ALL GREEN! STAGING UPDATED! ---', resp.data);
        } catch (e) {
            console.error('API Error:', e.response ? JSON.stringify(e.response.data) : e.message);
        }
    } else {
        console.error('⚠️ Empty results again. Need to check if Cloudflare blocks GitHub.');
        process.exit(1);
    }
}
scrapeTrains();
