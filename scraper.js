const axios = require('axios');
const { JSDOM } = require('jsdom');

async function scrape(sid1, sid2) {
    const url = 'https://swrailway.gov.ua/timetable/eltrain/?sid1=' + sid1 + '&sid2=' + sid2 + '&eventdate=' + new Date().toISOString().split('T')[0];
    try {
        const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 });
        const dom = new JSDOM(res.data);
        const rows = dom.window.document.querySelectorAll('tr');
        let list = [];
        rows.forEach(r => {
            if (r.innerHTML.includes('tid=')) {
                const tds = r.querySelectorAll('td');
                if (tds.length >= 6) {
                    list.push({
                        number: tds[0].textContent.trim().substring(0,4),
                        route: tds[2].textContent.trim(),
                        schedule: tds[1].textContent.trim(),
                        time_1: tds[3].textContent.trim().replace('.', ':'),
                        time_3: tds[5].textContent.trim().replace('.', ':')
                    });
                }
            }
        });
        return list;
    } catch (e) { return []; }
}

async function run() {
    const from = await scrape(1374, 1407); 
    const to = await scrape(1407, 1374); 
    if (from.length > 0 || to.length > 0) {
        await axios.post(process.env.WP_URL + '/wp-json/vygoda/v1/update-trains', 
            { from_vygoda: from, to_vygoda: to }, 
            { headers: { 'X-Vygoda-Auth': process.env.WP_TOKEN } }
        );
        console.log('Successfully pushed to WP');
    }
}
run();
