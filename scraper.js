const axios = require('axios');
const cheerio = require('cheerio');

async function scrape(sid1, sid2, direction) {
    const today = new Date().toISOString().split('T')[0];
    const url = `https://swrailway.gov.ua/timetable/eltrain/?sid1=${sid1}&sid2=${sid2}&eventdate=${today}`;
    
    console.log(`[Scraper] Отримуємо дані для ${direction}: ${url}`);
    
    try {
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                'Accept-Language': 'uk-UA,uk;q=0.9',
                'Referer': 'https://swrailway.gov.ua/timetable/eltrain/'
            },
            timeout: 25000
        });

        const $ = cheerio.load(res.data);
        let list = [];
        
        $('tr').each((i, el) => {
            if ($(el).html().includes('tid=')) {
                const tds = $(el).find('td');
                if (tds.length >= 6) {
                    const time1 = $(tds[3]).text().trim().replace(/[\s.]/g, ':');
                    const time3 = $(tds[5]).text().trim().replace(/[\s.]/g, ':');

                    if (time1 || time3) {
                        list.push({
                            number: $(tds[0]).text().trim().substring(0,4),
                            route: $(tds[2]).text().trim().replace(/\s+/g, ' '),
                            schedule: $(tds[1]).text().trim(),
                            time_1: time1 || time3,
                            time_3: time3 || time1
                        });
                    }
                }
            }
        });

        console.log(`[Scraper] Знайдено ${list.length} поїздів.`);
        return list;
    } catch (e) {
        console.log(`[Scraper] Помилка на сайті залізниці: ${e.message}`);
        return [];
    }
}

async function run() {
    const from = await scrape(1374, 1407, 'ВИГОДА -> ОДЕСА'); 
    const to = await scrape(1407, 1374, 'ОДЕСА -> ВИГОДА'); 

    if (from.length === 0 && to.length === 0) {
        console.log('[Scraper] Критично: даних немає. Скасовуємо оновлення.');
        process.exit(1);
    }

    // Формуємо адресу API (підтримка як ?rest_route= так і wp-json)
    let wpUrl = process.env.WP_URL;
    if (wpUrl.includes('?')) {
        wpUrl = wpUrl + '/vygoda/v1/update-trains';
    } else {
        wpUrl = wpUrl.replace(/\/$/, '') + '/wp-json/vygoda/v1/update-trains';
    }

    console.log(`[WP-API] Надсилаємо дані на: ${wpUrl}`);

    try {
        const response = await axios.post(wpUrl, {
            from_vygoda: from,
            to_vygoda: to
        }, {
            headers: {
                'X-Vygoda-Token': process.env.WP_TOKEN,
                'Content-Type': 'application/json'
            }
        });
        console.log('[WP-API] Успіх! Сайт відповів:', response.data);
    } catch (e) {
        console.log('[WP-API] ПОМИЛКА ОНОВЛЕННЯ:');
        if (e.response) {
            console.log(`Статус: ${e.response.status}`);
            console.log('Помилка сервера:', JSON.stringify(e.response.data));
        } else {
            console.log('Повідомлення:', e.message);
        }
        process.exit(1);
    }
}

run();
