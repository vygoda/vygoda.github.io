const { chromium } = require('playwright');
const axios = require('axios');

const WP_URL = process.env.WP_URL;
const TOKEN = process.env.VYGODA_SCRAPER_TOKEN;

async function scrapeTrains() {
    console.log(`🚀 Persistent Scraper (Global)... Target: ${WP_URL}`);
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
            await page.goto(station.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
            
            // Смарт-скрапінг: Шукаємо будь-яку таблицю з даними
            const trains = await page.evaluate((sid) => {
                const tables = Array.from(document.querySelectorAll('table'));
                let data = [];
                
                tables.forEach(table => {
                    const rows = Array.from(table.querySelectorAll('tr')).slice(1);
                    rows.forEach(row => {
                        const cols = row.querySelectorAll('td');
                        // Ми шукаємо рядки, де є як мінімум 4 колонки
                        if (cols.length >= 4) {
                            const number = cols[0].innerText.trim();
                            const route = cols[1].innerText.trim();
                            // Перевіряємо, чи це дійсно потяг (номер має містити цифри)
                            if (/\d/.test(number) && route.length > 3) {
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
                });
                return data;
            }, station.id);

            allResults = allResults.concat(trains);
            console.log(`✅ Success! Found ${trains.length} trains for ${station.name}`);
        } catch (e) { console.error(`❌ Error ${station.name}: ${e.message}`); }
    }

    await browser.close();

    if (allResults.length > 0) {
        // ВИДАЛЯЄМО ДУБЛІКАТИ (якщо вони є після перебору таблиць)
        const uniqueTrains = Array.from(new Set(allResults.map(a => JSON.stringify(a)))).map(a => JSON.parse(a));
        
        const apiEndpoint = `${WP_URL}/vygoda/v1/update-trains`;
        console.log(`📤 Sending ${uniqueTrains.length} unique trains to API...`);
        try {
            const resp = await axios.post(apiEndpoint, { token: TOKEN, trains: uniqueTrains }, {
                headers: { 'X-Vygoda-Token': TOKEN, 'Content-Type': 'application/json' },
                timeout: 30000
            });
            console.log('--- ALL SYSTEMS GREEN! ---', resp.data);
        } catch (e) {
            console.error('API Rejected:', e.response ? JSON.stringify(e.response.data) : e.message);
        }
    } else {
        console.error('⚠️ Still no data. Please check site structure.');
        process.exit(1);
    }
}
scrapeTrains();
