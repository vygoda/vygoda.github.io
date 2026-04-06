const axios = require('axios');
const cheerio = require('cheerio');

async function scrape(sid1, sid2) {
    const url = 'https://swrailway.gov.ua/timetable/eltrain/?sid1=' + sid1 + '&sid2=' + sid2 + '&eventdate=' + new Date().toISOString().split('T')[0];
    try {
        const res = await axios.get(url, { 
            headers: { 'User-Agent': 'Mozilla/5.0' }, 
            timeout: 20000 
        });
        const $ = cheerio.load(res.data);
        let list = [];
        
        $('tr').each((i, el) => {
            if ($(el).html().includes('tid=')) {
                const tds = $(el).find('td');
                if (tds.length >= 6) {
                    list.push({
                        number: $(tds[0]).text().trim().substring(0,4),
                        route: $(tds[2]).text().trim().replace(/\s+/g, ' '),
                        schedule: $(tds[1]).text().trim(),
                        time_1: $(tds[3]).text().trim().replace('.', ':'),
                        time_3: $(tds[5]).text().trim().replace('.', ':')
                    });
                }
            }
        });
        return list;
    } catch (e) { 
        console.log('Error scraping:', e.message);
        return []; 
    }
}

async function run() {
    console.log('Starting scrape...');
    const from = await scrape(1374, 1407); 
    const to = await scrape(1407, 1374); 
    
    console.log(`Found ${from.length} trains from Vygoda, ${to.length} to Vygoda`);

    if (from.length > 0 || to.length > 0) {
        try {
            const wpRes = await axios.post(process.env.WP_URL + '/wp-json/vygoda/v1/update-trains', 
                { from_vygoda: from, to_vygoda: to }, 
                { headers: { 'X-Vygoda-Auth': process.env.WP_TOKEN } }
            );
            console.log('Successfully pushed to WP:', wpRes.data);
        } catch (e) {
            console.log('Error pushing to WP:', e.response ? e.response.data : e.message);
        }
    }
}
run();
