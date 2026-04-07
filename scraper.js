/**
 * Vygoda Transport Scraper (GitHub Action version)
 * Uses Playwright to bypass blocks and sends data to WordPress REST API
 */

const { chromium } = require('playwright');
const axios = require('axios');

// Отримання налаштувань із секретів GitHub
const WP_URL = process.env.WP_URL;
const TOKEN = process.env.VYGODA_SCRAPER_TOKEN;

async function scrapeTrains() {
    console.log(`🚀 Scraper started at: ${new Date().toLocaleString()}`);
    console.log(`📂 Target: ${WP_URL}`);

    // Перевірка токена
    if (!TOKEN) {
        console.error('❌ ERROR: VYGODA_SCRAPER_TOKEN is not set in secrets!');
        process.exit(1);
    }

    const browser = await chromium.launch({ headless: true });
    // Емуляція звичайного браузера
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    const stations = [
        { id: '2208479', name: 'Вигода', url: 'https://uz.gov.ua/passengers/timetable/?station=2208479&by_station=1' },
        { id: '2208001', name: 'Одеса', url: 'https://uz.gov.ua/passengers/timetable/?station=2208001&by_station=1' }
    ];

    let allResults = [];

    for (const station of stations) {
        console.log(`🔍 Scraping station: ${station.name}...`);
        try {
            await page.goto(station.url, { waitUntil: 'domcontentloaded', timeout: 40000 });
            
            // Чекаємо, поки таблиця з розкладом з'явиться
            await page.waitForSelector('table', { timeout: 15000 }).catch(() => null);

            const trains = await page.evaluate((stationId) => {
                const rows = Array.from(document.querySelectorAll('table tr')).slice(1);
                return rows.map(row => {
                    const cols = row.querySelectorAll('td');
                    if (cols.length < 4) return null;
                    return {
                        number: cols[0].innerText.trim(),
                        route: cols[1].innerText.trim(),
                        arrival: cols[2].innerText.trim(),
                        departure: cols[3].innerText.trim(),
                        station_id: stationId
                    };
                }).filter(t => t !== null);
            }, station.id);

            allResults = allResults.concat(trains);
            console.log(`✅ Found ${trains.length} trains for ${station.name}`);
        } catch (e) {
            console.error(`❌ Error for ${station.name}: ${e.message}`);
        }
    }

    await browser.close();

    if (allResults.length > 0) {
        const apiEndpoint = `${WP_URL}/vygoda/v1/update-trains`;
        console.log(`📤 Sending ${allResults.length} trains to API...`);
        
        try {
            const resp = await axios.post(apiEndpoint, {
                token: TOKEN,
                trains: allResults
            }, {
                headers: {
                    'X-Vygoda-Token': TOKEN, // Пряма передача в заголовку як дублювання
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });
            console.log('🎉 SUCCESS! WordPress API response:', resp.data);
        } catch (e) {
            console.error('🔴 API REJECTED REQUEST!');
            if (e.response) {
                console.error(`Status: ${e.response.status}`);
                console.error('Data:', JSON.stringify(e.response.data));
            } else {
                console.error('Message:', e.message);
            }
            process.exit(1); // Сигналізуємо GitHub про помилку
        }
    } else {
        console.warn('⚠️ No data found to send.');
        process.exit(1);
    }
}

scrapeTrains();
