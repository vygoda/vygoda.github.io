const { chromium } = require('playwright');
const axios = require('axios');

const WP_URL = process.env.WP_URL;
const TOKEN = process.env.VYGODA_SCRAPER_TOKEN;

async function scrapeTrains() {
    console.log(`🚀 DEBUG Scraper... Target: ${WP_URL}`);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        console.log(`🔍 Checking poizdato.net...`);
        await page.goto('https://poizdato.net/rozklad-poizdiv-po-stantsii/vyhoda/', { waitUntil: 'load', timeout: 60000 });
        await page.waitForTimeout(10000); 

        // ВИВОДИМО ТЕ, ЩО БАЧИТЬ GITHUB
        const pageTitle = await page.title();
        const pageText = await page.evaluate(() => document.body.innerText.substring(0, 1500));
        
        console.log(`--- [PAGE TITLE] ---: ${pageTitle}`);
        console.log(`--- [PAGE TEXT (FIRST 1500 CHARS)] ---:`);
        console.log(pageText);

        const trainsFound = pageText.includes('Вигода') && pageText.includes(':');
        console.log(`--- Trains data detected in text? : ${trainsFound} ---`);

        // Спробуємо зібрати хоч щось
        const results = await page.evaluate(() => {
            const data = [];
            const rows = Array.from(document.querySelectorAll('tr, div.row'));
            rows.forEach(r => {
                const txt = r.innerText;
                if (txt.includes(' - ') && /\d{1,2}:\d{2}/.test(txt)) {
                    data.push({number: 'N/A', route: txt.trim(), arrival: '00:00', departure: '00:00', station_id: '2208479'});
                }
            });
            return data;
        });

        if (results.length > 0) {
            console.log(`✅ FOUND ${results.length} RECORDS BY TEXT SCAN!`);
            const apiEndpoint = `${WP_URL}/vygoda/v1/update-trains`;
            await axios.post(apiEndpoint, { token: TOKEN, trains: results }, { headers: { 'X-Vygoda-Token': TOKEN } });
        }

    } catch (e) {
        console.error(`❌ Global error: ${e.message}`);
    }

    await browser.close();
}
scrapeTrains();
