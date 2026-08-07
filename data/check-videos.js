const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'enriched/products_enriched.json'), 'utf8'));
const p = products.find(x => x.id === '4712');
const desc = p.description?.ru || '';

// Find all mp4 URLs
const mp4Regex = /https?:\/\/[^\s"'<>]+\.mp4/gi;
const matches = desc.match(mp4Regex) || [];
console.log('MP4 URLs found in description:', matches.length);
matches.forEach((url, i) => console.log('  [' + i + ']', url));

// Also check for video tags
const videoTagRegex = /<video[^>]*>[\s\S]*?<\/video>/gi;
const videoTags = desc.match(videoTagRegex) || [];
console.log('\nVideo tags found:', videoTags.length);
videoTags.forEach((tag, i) => console.log('  [' + i + ']', tag.substring(0, 200)));
