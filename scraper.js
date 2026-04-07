const { chromium } = require('playwright');
const axios = require('axios');

const WP_URL = process.env.WP_URL;
const TOKEN = process.env.VYGODA_SCRAPER_TOKEN;

async function scrapeTrains() {
    console.log(`🚀 Smart Scraper (RASP.COM.UA)... Target: ${WP_URL}`);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // МИ ВИКОРИСТОВУЄМО RASP.COM.UA - ВІН НАЙКРАЩИЙ ДЛЯ СКРАПІНГУ
    const stations = [
        { id: '2208479', name: 'Вигода', url: 'https://rasp.com.ua/stancyya/vyhoda/' },
        { id: '2208001', name: 'Одеса', url: 'https://rasp.com.ua/stancyya/odesa-golovna/' }
    ];

    let allResults = [];

    for (const station of stations) {
        console.log(`🔍 Scraping ${station.name}...`);
        try {
            // ЧЕКАЄМО NETWORKIDLE (повна тиша в мережі)
            await page.goto(station.url, { waitUntil: 'networkidle', timeout: 90000 });
            await page.waitForTimeout(5000); // Додаткові 5 секунд "на подумати"

            const trains = await page.evaluate((sid) => {
                const rows = Array.from(document.querySelectorAll('tr'));
                return rows.map(r => {
                    const cols = r.querySelectorAll('td');
                    if (cols.length < 3) return null;
                    
                    const number = cols[0].innerText.trim();
                    const route = cols[1].innerText.trim();
                    const time = cols[2].innerText.trim();

                    // Якщо є час і номер - це наш клієнт
                    if (time.includes(':') && route.length > 5) {
                        return {
                            number: number || '---',
                            route: route,
                            arrival: time,
                            departure: time,
                            station_id: sid
                        };
                    }
                    return null;
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
        console.log(`📤 Sending ${allResults.length} trains to API...`);
        try {
            const resp = await axios.post(apiEndpoint, { token: TOKEN, trains: allResults }, {
                headers: { 'X-Vygoda-Token': TOKEN, 'Content-Type': 'application/json' },
                timeout: 30000
            });
            console.log('--- ALL DONE! SUCCESS ---', resp.data);
        } catch (e) {
            console.error('API Rejected:', e.response ? JSON.stringify(e.response.data) : e.message);
        }
    } else {
        console.error('⚠️ FAILURE: No data found on ANY site.');
        process.exit(1);
    }
}
scrapeTrains();
