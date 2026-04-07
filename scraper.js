const { chromium } = require('playwright');
const axios = require('axios');

const WP_URL = process.env.WP_URL;
const TOKEN = process.env.VYGODA_SCRAPER_TOKEN;

async function scrapeTrains() {
    console.log(`🚀 Final Scraper Strategy... Target: ${WP_URL}`);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    const stations = [
        { id: 'vyhoda', name: 'Вигода', url: 'https://poizdato.net/rozklad-poizdiv-po-stantsii/vyhoda/' },
        { id: 'odesa', name: 'Одеса', url: 'https://poizdato.net/rozklad-poizdiv-po-stantsii/odesa-holovna/' }
    ];

    let allResults = [];

    for (const station of stations) {
        console.log(`🔍 Scraping ${station.name}...`);
        try {
            // ЗАКРІПЛЮЄМО ВЕРСІЮ З ПОВНИМ ЗАВАНТАЖЕННЯМ МЕРЕЖІ
            await page.goto(station.url, { waitUntil: 'load', timeout: 90000 });
            
            // ДУЖЕ ВАЖЛИВО: Чекаємо будь-якої таблиці 10 секунд
            await page.waitForTimeout(10000); 

            const trains = await page.evaluate((sid) => {
                const data = [];
                // Беремо ВСІ рядки, які тільки є на сторінці
                const rows = Array.from(document.querySelectorAll('tr'));
                
                rows.forEach(r => {
                    const cols = r.querySelectorAll('td');
                    if (cols.length >= 4) {
                        const number = cols[0].innerText.trim();
                        const route = cols[1].innerText.trim();
                        const time = cols[2].innerText.trim() || cols[3].innerText.trim();

                        // Шукаємо дані, де є номер і напрямок
                        if (route.length > 5 && /\d/.test(number)) {
                            data.push({
                                number: number,
                                route: route,
                                arrival: cols[2].innerText.trim().replace('-', ''),
                                departure: cols[3].innerText.trim().replace('-', ''),
                                station_id: sid === 'vyhoda' ? '2208479' : '2208001'
                            });
                        }
                    }
                });
                return data;
            }, station.id);

            allResults = allResults.concat(trains);
            console.log(`✅ Success! Found ${trains.length} trains for ${station.name}`);
        } catch (e) { console.error(`❌ Error ${station.name}: ${e.message}`); }
    }

    await browser.close();

    if (allResults.length > 0) {
        // ВИДАЛЯЄМО ДУБЛІКАТИ (якщо він знайде таблицю і для поїздів, і для електричок разом)
        const unique = Array.from(new Set(allResults.map(a => JSON.stringify(a)))).map(a => JSON.parse(a));
        
        const apiEndpoint = `${WP_URL}/vygoda/v1/update-trains`;
        console.log(`📤 Sending ${unique.length} records to API...`);
        try {
            await axios.post(apiEndpoint, { token: TOKEN, trains: unique }, {
                headers: { 'X-Vygoda-Token': TOKEN, 'Content-Type': 'application/json' },
                timeout: 30000
            });
            console.log('--- VICTORY! DATA SENT ---');
        } catch (e) { console.error('API Error:', e.message); }
    } else {
        process.exit(1);
    }
}
scrapeTrains();
