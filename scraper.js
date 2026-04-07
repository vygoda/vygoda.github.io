const { chromium } = require('playwright');
const axios = require('axios');

const WP_URL = process.env.WP_URL;
const TOKEN = process.env.VYGODA_SCRAPER_TOKEN;

async function scrapeTrains() {
    console.log(`🚀 Starting Global Scraper (Fallback)... Target: ${WP_URL}`);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // МИ ЗМІНИЛИ ДЖЕРЕЛО НА POIZDATO.NET (воно не блокує GitHub)
    const stations = [
        { id: 'vyhoda', name: 'Вигода', url: 'https://poizdato.net/rozklad-poizdiv-po-stantsii/vyhoda/' },
        { id: 'odesa', name: 'Одеса', url: 'https://poizdato.net/rozklad-poizdiv-po-stantsii/odesa-holovna/' }
    ];

    let allResults = [];

    for (const station of stations) {
        console.log(`🔍 Scraping ${station.name} from public source...`);
        try {
            await page.goto(station.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
            
            const trains = await page.evaluate((sid) => {
                const rows = Array.from(document.querySelectorAll('table.schedule_table tr')).slice(1);
                return rows.map(r => {
                    const cols = r.querySelectorAll('td');
                    if (cols.length < 5) return null;
                    return {
                        number: cols[0].innerText.trim(),
                        route: cols[1].innerText.trim(),
                        arrival: cols[2].innerText.trim() === '-' ? '' : cols[2].innerText.trim(),
                        departure: cols[3].innerText.trim() === '-' ? '' : cols[3].innerText.trim(),
                        station_id: sid === 'vyhoda' ? '2208479' : '2208001' // Повертаємо ID для вашої теми
                    };
                }).filter(t => t);
            }, station.id);

            allResults = allResults.concat(trains);
            console.log(`✅ Success! Found ${trains.length} trains for ${station.name}`);
        } catch (e) {
            console.error(`❌ Error ${station.name}: ${e.message}`);
        }
    }

    await browser.close();

    if (allResults.length > 0) {
        const apiEndpoint = `${WP_URL}/vygoda/v1/update-trains`;
        try {
            await axios.post(apiEndpoint, { token: TOKEN, trains: allResults }, {
                headers: { 'X-Vygoda-Token': TOKEN, 'Content-Type': 'application/json' },
                timeout: 30000
            });
            console.log('--- ALL DONE! DATA UPDATED ---');
        } catch (e) { console.error('API Error:', e.message); }
    } else {
        process.exit(1);
    }
}

scrapeTrains();
