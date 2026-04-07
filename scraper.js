const { chromium } = require('playwright');
const axios = require('axios');

const WP_URL = process.env.WP_URL;
const TOKEN = process.env.VYGODA_SCRAPER_TOKEN;

async function scrapeTrains() {
    console.log(`Starting... Target: ${WP_URL}`);
    
    // ПЕРЕВІРКА ТОКЕНА В ЛОГАХ (БЕЗПЕЧНА)
    if (!TOKEN) {
        console.error('--- ERROR: VYGODA_SCRAPER_TOKEN IS EMPTY! ---');
    } else {
        console.log(`--- TOKEN DETECTED! Length: ${TOKEN.length} chars ---`);
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ userAgent: 'Mozilla/5.0' });
    const page = await context.newPage();

    const stations = [
        { id: '2208479', name: 'Вигода', url: 'https://uz.gov.ua/passengers/timetable/?station=2208479&by_station=1' },
        { id: '2208001', name: 'Одеса', url: 'https://uz.gov.ua/passengers/timetable/?station=2208001&by_station=1' }
    ];

    let allResults = [];
    for (const station of stations) {
        try {
            console.log(`Scraping ${station.name}...`);
            await page.goto(station.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            const trains = await page.evaluate((sid) => {
                const rows = Array.from(document.querySelectorAll('table tr')).slice(1);
                return rows.map(r => {
                    const cols = r.querySelectorAll('td');
                    return cols.length >= 4 ? {number: cols[0].innerText.trim(), route: cols[1].innerText.trim(), arrival: cols[2].innerText.trim(), departure: cols[3].innerText.trim(), station_id: sid} : null;
                }).filter(t => t);
            }, station.id);
            allResults = allResults.concat(trains);
        } catch (e) { console.error(`Error ${station.name}: ${e.message}`); }
    }
    await browser.close();

    if (allResults.length > 0) {
        const apiEndpoint = `${WP_URL}/vygoda/v1/update-trains`;
        console.log(`Sending ${allResults.length} trains to API...`);
        try {
            const resp = await axios.post(apiEndpoint, { token: TOKEN, trains: allResults });
            console.log('🎉 SUCCESS!', JSON.stringify(resp.data));
        } catch (e) {
            console.error('🔴 API REJECTED REQUEST:', e.response ? JSON.stringify(e.response.data) : e.message);
        }
    }
}
scrapeTrains();
