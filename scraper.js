const { chromium } = require('playwright');
const axios = require('axios');

const WP_URL = process.env.WP_URL;
const TOKEN = process.env.VYGODA_SCRAPER_TOKEN;

async function scrapeTrains() {
    console.log(`Starting scraper with URL: ${WP_URL}`);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // ... (тут ваш звичайний код скрапінгу) ...
    // ЗАРАЗ Я ЗМІНИВ ТІЛЬКИ ЧАСТИНУ ВІДПРАВКИ:

    const trains = [{number: 'GH-SUCCESS', route: 'GITHUB -> STAGING', arrival: '11:11', departure: '22:22'}]; // Тестовий потяг для перевірки

    if (trains.length > 0) {
        const apiEndpoint = `${WP_URL}/vygoda/v1/update-trains`;
        console.log(`Sending to: ${apiEndpoint}`);
        
        try {
            const response = await axios.post(apiEndpoint, {
                token: TOKEN,
                trains: trains
            });
            console.log('--- API SUCCESS! ---');
            console.log('Response status:', response.status);
            console.log('Response data:', JSON.stringify(response.data));
        } catch (e) {
            console.error('--- API ERROR! ---');
            if (e.response) {
                console.error('Status:', e.response.status);
                console.error('Headers:', JSON.stringify(e.response.headers));
                console.log('Data:', JSON.stringify(e.response.data));
            } else {
                console.error('Message:', e.message);
            }
        }
    }
    await browser.close();
}
scrapeTrains();
