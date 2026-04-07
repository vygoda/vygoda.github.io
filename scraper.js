const { chromium } = require('playwright');
const axios = require('axios');

const WP_URL = process.env.WP_URL;
const TOKEN = process.env.VYGODA_SCRAPER_TOKEN;

async function scrapeTrains() {
    console.log(`🚀 Deep Scraper (POIZDATO.NET)... Target: ${WP_URL}`);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    const stations = [
        { id: 'vyhoda', name: 'Вигода', url: 'https://poizdato.net/rozklad-poizdiv-po-stantsii/vyhoda/' },
        { id: 'odesa', name: 'Одеса', url: 'https://poizdato.net/rozklad-poizdiv-po-stantsii/odesa-holovna/' }
    ];

    let allResults = [];

    for (const station of stations) {
        console.log(`🔍 Deep Scanning ${station.name}...`);
        try {
            await page.goto(station.url, { waitUntil: 'networkidle', timeout: 90000 });
            await page.waitForTimeout(10000); // 10 секунд на повне завантаження

            const trains = await page.evaluate((sid) => {
                const results = [];
                // ШУКАЄМО ВСІ ЕЛЕМЕНТИ TR, LI або DIV, де є час (00:00)
                const items = Array.from(document.querySelectorAll('tr, li, div'));
                
                items.forEach(item => {
                    const text = item.innerText;
                    // Патерн часу: 00:00
                    const timeRegex = /\d{1,2}:\d{2}/g;
                    const times = text.match(timeRegex);
                    
                    // Якщо в елементі є час, номер потяга і він достатньо великий
                    if (times && times.length >= 1 && text.includes(' - ') && text.length < 300) {
                        const parts = text.split('\n').map(p => p.trim()).filter(p => p.length > 0);
                        if (parts.length >= 3) {
                            results.push({
                                number: parts[0] || '---',
                                route: parts[1] || '---',
                                arrival: times[0] || '',
                                departure: times[1] || times[0] || '',
                                station_id: sid === 'vyhoda' ? '2208479' : '2208001'
                            });
                        }
                    }
                });
                return results;
            }, station.id);

            // Очищення від дублікатів (бо ми шукаємо по всіх елементах)
            const clean = Array.from(new Set(trains.map(a => JSON.stringify(a)))).map(a => JSON.parse(a));
            allResults = allResults.concat(clean);
            console.log(`✅ Success! Found ${clean.length} unique records for ${station.name}`);
        } catch (e) {
            console.error(`❌ Error ${station.name}: ${e.message}`);
        }
    }

    await browser.close();

    if (allResults.length > 0) {
        const apiEndpoint = `${WP_URL}/vygoda/v1/update-trains`;
        console.log(`📤 Sending ${allResults.length} records to API...`);
        try {
            const resp = await axios.post(apiEndpoint, { token: TOKEN, trains: allResults }, {
                headers: { 'X-Vygoda-Token': TOKEN, 'Content-Type': 'application/json' },
                timeout: 30000
            });
            console.log('🏁 MISSION ACCOMPLISHED! ---', resp.data);
        } catch (e) {
            console.error('API Rejected:', e.response ? JSON.stringify(e.response.data) : e.message);
        }
    } else {
        process.exit(1);
    }
}
scrapeTrains();
