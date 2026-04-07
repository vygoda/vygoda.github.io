const { chromium } = require('playwright');
const axios = require('axios');

const WP_URL = process.env.WP_URL;
const TOKEN = process.env.VYGODA_SCRAPER_TOKEN;

async function scrapeTrains() {
    console.log(`🚀 Starting persistent scraper... Target: ${WP_URL}`);
    const browser = await chromium.launch({ headless: true });
    
    // Емулюємо "людську" поведінку
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    const stations = [
        { id: '2208479', name: 'Вигода', url: 'https://uz.gov.ua/passengers/timetable/?station=2208479&by_station=1' },
        { id: '2208001', name: 'Одеса', url: 'https://uz.gov.ua/passengers/timetable/?station=2208001&by_station=1' }
    ];

    let allResults = [];

    for (const station of stations) {
        let attempts = 0;
        let success = false;
        
        while (attempts < 2 && !success) { // Робимо до 2 спроб на станцію
            attempts++;
            console.log(`🔍 [Attempt ${attempts}] Scraping ${station.name}...`);
            try {
                // ЗБІЛЬШУЄМО ТАЙМАУТ ДО 90 СЕКУНД
                await page.goto(station.url, { waitUntil: 'load', timeout: 90000 });
                
                // Даємо 5 секунд на рендер скриптів
                await page.waitForTimeout(5000); 

                const trains = await page.evaluate((sid) => {
                    const rows = Array.from(document.querySelectorAll('table tr')).slice(1);
                    return rows.map(r => {
                        const cols = r.querySelectorAll('td');
                        return cols.length >= 4 ? {number: cols[0].innerText.trim(), route: cols[1].innerText.trim(), arrival: cols[2].innerText.trim(), departure: cols[3].innerText.trim(), station_id: sid} : null;
                    }).filter(t => t);
                }, station.id);

                if (trains.length > 0) {
                    allResults = allResults.concat(trains);
                    console.log(`✅ Success! Found ${trains.length} trains for ${station.name}`);
                    success = true;
                } else {
                    console.warn('⚠️ Table found, but it is empty.');
                }
            } catch (e) {
                console.error(`❌ Error on attempt ${attempts}: ${e.message}`);
                await page.waitForTimeout(10000); // Чекаємо перед повтором
            }
        }
    }

    await browser.close();

    if (allResults.length > 0) {
        const apiEndpoint = `${WP_URL}/vygoda/v1/update-trains`;
        console.log(`📤 Sending data to API...`);
        try {
            await axios.post(apiEndpoint, { token: TOKEN, trains: allResults }, {
                headers: { 'X-Vygoda-Token': TOKEN, 'Content-Type': 'application/json' },
                timeout: 30000
            });
            console.log('--- FINAL SUCCESS! --- DATA RECEIVED BY WP');
        } catch (e) {
            console.error('--- REST API REJECTED ---', e.response ? e.response.data : e.message);
        }
    } else {
        console.warn('--- FINISHED WITHOUT DATA ---');
        process.exit(1);
    }
}

scrapeTrains();
