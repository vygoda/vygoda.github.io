const { chromium } = require('playwright');
const axios = require('axios');

async function scrape(browser, sid1, sid2, direction) {
    const url = `https://swrailway.gov.ua/timetable/eltrain/?sid1=${sid1}&sid2=${sid2}&eventdate=${new Date().toISOString().split('T')[0]}`;
    const page = await browser.newPage();
    console.log(`[Scraper] Відкриваємо ${direction}: ${url}`);
    
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        const trains = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('tr'));
            return rows.filter(r => r.innerHTML.includes('tid=')).map(r => {
                const tds = Array.from(r.querySelectorAll('td'));
                if (tds.length < 6) return null;
                return {
                    number: tds[0].innerText.trim().substring(0,4),
                    route: tds[2].innerText.trim().replace(/\s+/g, ' '),
                    schedule: tds[1].innerText.trim(),
                    time_1: tds[3].innerText.trim().replace(/[\s.]/g, ':'),
                    time_3: tds[5].innerText.trim().replace(/[\s.]/g, ':')
                };
            }).filter(t => t !== null && (t.time_1 || t.time_3));
        });
        await page.close();
        console.log(`[Scraper] Знайдено ${trains.length} поїздів.`);
        return trains;
    } catch (e) {
        console.log(`[Scraper] Помилка: ${e.message}`);
        await page.close();
        return [];
    }
}

async function run() {
    const browser = await chromium.launch({ headless: true });
    const from = await scrape(browser, 1374, 1407, 'ВІД ВИГОДИ');
    const to = await scrape(browser, 1407, 1374, 'ДО ВИГОДИ');
    await browser.close();

    if (from.length > 0 || to.length > 0) {
        let wpUrl = process.env.WP_URL;
        wpUrl = wpUrl.includes('?') ? wpUrl + '/vygoda/v1/update-trains' : wpUrl.replace(/\/$/, '') + '/wp-json/vygoda/v1/update-trains';
        
        try {
            await axios.post(wpUrl, { from_vygoda: from, to_vygoda: to }, {
                headers: { 'X-Vygoda-Token': process.env.WP_TOKEN }
            });
            console.log('[WP-API] Успішно оновлено!');
        } catch (e) {
            console.log('[WP-API] Помилка:', e.message);
        }
    }
}
run();
