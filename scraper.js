const { chromium } = require('playwright');
const axios = require('axios');

const WP_URL = process.env.WP_URL;
const TOKEN = process.env.VYGODA_SCRAPER_TOKEN;

async function scrapeTrains() {
    console.log(`🚀 Persistant Scraper (Simple HTML)... Target: ${WP_URL}`);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // МИ ВИКОРИСТОВУЄМО ROZKLAD-POIZDIV.COM.UA - ВІН НАЙПРОСТІШИЙ
    const stations = [
        { id: '2208479', name: 'Вигода', url: 'http://rozklad-poizdiv.com.ua/stancyya/vyhoda/' },
        { id: '2208001', name: 'Одеса', url: 'http://rozklad-poizdiv.com.ua/stancyya/odesa-golovna/' }
    ];

    let allResults = [];

    for (const station of stations) {
        console.log(`🔍 Scraping ${station.name}...`);
        try {
            await page.goto(station.url, { waitUntil: 'load', timeout: 60000 });
            await page.waitForTimeout(5000); 

            const trains = await page.evaluate((sid) => {
                const data = [];
                // На цьому сайті таблиці мають клас station_table_tab
                const rows = Array.from(document.querySelectorAll('table tr')).slice(1);
                
                rows.forEach(r => {
                    const cols = r.querySelectorAll('td');
                    if (cols.length >= 4) {
                        const number = cols[0].innerText.trim();
                        const route = cols[1].innerText.trim();
                        // Якщо це не заголовок і є дані
                        if (route.length > 5 && (/\d/.test(number) || number.length > 1)) {
                            data.push({
                                number: number,
                                route: route,
                                arrival: cols[2].innerText.trim() === '-' ? '' : cols[2].innerText.trim(),
                                departure: cols[3].innerText.trim() === '-' ? '' : cols[3].innerText.trim(),
                                station_id: sid
                            });
                        }
                    }
                });
                return data;
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
        console.log(`📤 Sending ${allResults.length} records to API...`);
        try {
            const resp = await axios.post(apiEndpoint, { token: TOKEN, trains: allResults }, {
                headers: { 'X-Vygoda-Token': TOKEN, 'Content-Type': 'application/json' },
                timeout: 30000
            });
            console.log('--- ALL SYSTEMS GO! --- SUCCESS! ---', resp.data);
        } catch (e) {
            console.error('API Rejected:', e.response ? JSON.stringify(e.response.data) : e.message);
        }
    } else {
        process.exit(1);
    }
}
scrapeTrains();
