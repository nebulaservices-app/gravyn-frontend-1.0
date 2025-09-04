const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Helper function to scrape contact info
async function scrapeContactInfo(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const pageContent = await page.content();
    const $ = cheerio.load(pageContent);

    // Extract exporter name (from <title> or <h1>)
    const exporterName = $('title').text() || $('h1').text() || 'Exporter Name Not Found';

    // Extract emails and phones using regex
    const emails = [];
    const phones = [];

    // Find email addresses
    $('a[href^="mailto:"]').each((index, el) => {
        const email = $(el).attr('href').replace('mailto:', '').trim();
        emails.push(email);
    });

    // Find phone numbers (this can be more complex, based on the format of the website)
    $('a[href^="tel:"]').each((index, el) => {
        const phone = $(el).attr('href').replace('tel:', '').trim();
        phones.push(phone);
    });

    // Get text for the snippet (description, contact section)
    const snippet = $('body').text().substring(0, 200); // Limit to first 200 characters for brevity

    // Close the browser
    await browser.close();

    return { exporterName, emails, phones, snippet, url };
}

async function extractFromList() {
    const importersLinks = [
        'https://www.yellowpages-uae.com/uae/rice', // Example link
        'http://waqartraders.com/', // Another example link
        // Add more importer links
    ];

    const results = [];

    for (const link of importersLinks) {
        console.log(`Fetching: ${link}`);
        try {
            const contactInfo = await scrapeContactInfo(link);
            results.push(contactInfo);
            console.log(`✅ Data scraped for: ${link}`);
        } catch (err) {
            console.log(`❌ Failed to scrape: ${link}`);
        }
    }

    // Format data for CSV
    const header = 'Exporter Name,URL,Emails,Phones,Snippet';
    const csvData = results.map(info => {
        const emails = info.emails.join('; ') || 'N/A';
        const phones = info.phones.join('; ') || 'N/A';
        const snippet = info.snippet.replace(/[\r\n]+/g, ' ').trim();
        return `"${info.exporterName}","${info.url}","${emails}","${phones}","${snippet}"`;
    }).join('\n');

    // Save results to CSV
    fs.writeFileSync('rice_importers_contacts.csv', `${header}\n${csvData}`);
    console.log('✅ Data saved to rice_importers_contacts.csv');
}

extractFromList();