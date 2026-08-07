const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mirror', 'products.json'), 'utf8'));
const p = products.find(x => x.id === 59357);

if (p) {
    console.log('Product:', p.name);
    console.log('Videos count:', p.videos.length);
    p.videos.forEach((v, i) => {
        console.log(`  Video ${i}:`, v.url, v.local ? '(LOCAL)' : '(remote)');
    });
    
    // Find video URLs in description
    const videoRegex = /<video[^>]*>[\s\S]*?<\/video>/gi;
    const videos = p.description.match(videoRegex) || [];
    console.log('\nVideo tags in description:', videos.length);
    videos.forEach((v, i) => {
        console.log(`  Video ${i} HTML:`, v.substring(0, 300));
    });
    
    // Check local files
    const videoDir = path.join(__dirname, 'storefront', 'public', 'videos', '59357');
    if (fs.existsSync(videoDir)) {
        const files = fs.readdirSync(videoDir);
        console.log('\nLocal video files for product 59357:', files);
    }
}
