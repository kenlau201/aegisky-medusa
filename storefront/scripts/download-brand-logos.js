/**
 * Download brand logos using Clearbit Logo API
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'brands');

// Brand slug -> domain mapping
const BRAND_DOMAINS = {
  'dji': 'dji.com',
  'autel': 'autelrobotics.com',
  'gopro': 'gopro.com',
  'sony': 'sony.com',
  'canon': 'canon.com',
  'insta360': 'insta360.com',
  'raspberry-pi': 'raspberrypi.com',
  'arduino': 'arduino.cc',
  'nvidia': 'nvidia.com',
  'intel': 'intel.com',
  't-motor': 'tmotor.com',
  'hobbywing': 'hobbywing.com',
  'frsky': 'frsky-rc.com',
  'flysky': 'flysky-cn.com',
  'futaba': 'futaba.com',
  'spektrum': 'spektrumrc.com',
  'fatshark': 'fatshark.com',
  'skyzone': 'skyzonefpv.com',
  'caddx': 'caddxfpv.com',
  'runcam': 'runcam.com',
  'foxeer': 'foxeer.com',
  'betafpv': 'betafpv.com',
  'geprc': 'geprc.com',
  'iflight': 'iflight.com',
  'emax': 'emax-usa.com',
  'diatone': 'diatonefpv.com',
  'brotherhobby': 'brotherhobby.com',
  'mateksys': 'mateksys.com',
  'holybro': 'holybro.com',
  'cuav': 'cuav.net',
  'siyi': 'siyi.biz',
  'flir': 'flir.com',
  'garmin': 'garmin.com',
  'panasonic': 'panasonic.com',
  'samsung': 'samsung.com',
  'sandisk': 'sandisk.com',
  'logitech': 'logitech.com',
  'walkera': 'walkera.com',
  'yuneec': 'yuneec.com',
  'parrot': 'parrot.com',
  'fimi': 'fimi.com',
  'hubsan': 'hubsan.com',
  'eachine': 'eachine.com',
  'radiomaster': 'radiomasterrc.com',
  'jumper': 'jumper.ai',
  'radiolink': 'radiolink.com.cn',
  'hglrc': 'hglrc.com',
  'speedybee': 'speedybee.com',
  'rushfpv': 'rushfpv.com',
  'walksnail': 'walksnail.com',
  'gemfan': 'gemfan.com',
  'hqprop': 'hqprop.com',
  'tattu': 'gensace.com',
  'gens-ace': 'gensace.com',
  'isdt': 'isdt.co',
  'toolkitrc': 'toolkitrc.com',
  'gremsy': 'gremsy.com',
  'tarot': 'tarot-rc.com',
  'topcon': 'topcon.com',
  'leica': 'leica-geosystems.com',
  'sokkia': 'sokkia.com',
  'chcnav': 'chcnav.com',
  'velodyne': 'velodynelidar.com',
  'livox': 'livoxtech.com',
  'hesai': 'hesaitech.com',
  'robosense': 'robosense.ai',
  'ouster': 'ouster.com',
  'viewpro': 'viewpro.com',
  'swellpro': 'swellpro.com',
  'unitree': 'unitree.com',
  'ubiquiti': 'ui.com',
  'quectel': 'quectel.com',
  'sipeed': 'sipeed.com',
  'lilygo': 'lilygo.cc',
  'orange-pi': 'orangepi.org',
  'nanopi': 'friendlyelec.com',
  'khadas': 'khadas.com',
  'radxa': 'radxa.com',
  'waveshare': 'waveshare.com',
  'hikvision': 'hikvision.com',
  'motorola': 'motorolasolutions.com',
  'hytera': 'hytera.com',
  'baofeng': 'baofengradio.com',
  'sennheiser': 'sennheiser.com',
  'feelworld': 'feelworld.com',
  'seetec': 'seetec.com',
  'viltrox': 'viltrox.com',
  'd-link': 'dlink.com',
  'jackery': 'jackery.com',
  'bluetti': 'bluettipower.com',
  'ecoflow': 'ecoflow.com',
  'allpowers': 'allpowers.com',
  'hd-zero': 'hd-zero.com',
  'mugin': 'muginuav.com',
  't-drones': 't-drones.com',
  'axisflying': 'axisflying.com',
  'happymodel': 'happymodel.cn',
  'flywoo': 'flywoo.net',
  'immersionrc': 'immersionrc.com',
  'lumenier': 'lumenier.com',
  'team-blacksheep': 'team-blacksheep.com',
  'truerc': 'truerc.com',
  'skydroid': 'skydroid.com',
  'flipsky': 'flipsky.net',
  'maytech': 'maytech.cn',
  'sunnysky': 'sunnysky.com.cn',
  'dualsky': 'dualsky.com',
  'castle-creations': 'castlecreations.com',
  'hitec': 'hitecrcd.com',
  'savox': 'savox.com',
  'kst': 'kstsz.com',
  'feetech': 'feetechrc.com',
  'powerhd': 'powerhd.com',
  'surpass': 'surpasshobby.com',
  'ztw': 'ztw-hobby.com',
  'spedix': 'spedixfpv.com',
  'rcinpower': 'rcinpower.com',
  'mad': 'mad-mav.com',
  'darwinfpv': 'darwinfpv.com',
  'oddityrc': 'oddityrc.com',
  'sub250': 'sub250.com',
  'flyfishrc': 'flyfishrc.com',
  'drotek': 'drotek.fr',
  'benewake': 'benewake.com',
  'ydlidar': 'ydlidar.com',
  'slamtec': 'slamtec.com',
  'ldrobot': 'ldrobot.com',
  'insta360': 'insta360.com',
  'fifish': 'fifish.com',
  'qyh': 'qyhy.com',
  'solo-good': 'solgood.com',
  'gnb': 'gaonengbattery.com',
  'gaoneng': 'gaonengbattery.com',
  'cnhl': 'cnhl-battery.com',
  'hrb': 'hrbattery.com',
  'herewin': 'herewinbattery.com',
  'sunpadow': 'sunpadow.com',
  'youme': 'youmebattery.com',
  'zop-power': 'zopbattery.com',
  'zeee-power': 'zeeepower.com',
  'romoss': 'romoss.com',
  'choetech': 'choetech.com',
  'ugreen': 'ugreen.com',
  'netac': 'netac.com',
  'flashfish': 'flashfish.com',
  'aferiy': 'aferiy.com',
  'ctechi': 'ctechi.com',
  'gizzu': 'gizzu.co.za',
  'mornsun': 'mornsun-power.com',
  'marrsriva': 'marrsriva.com',
  'mean-well': 'meanwell.com',
  'victor': 'victor.com',
  'korad': 'korad.com',
  'owon': 'owon.com',
  'fluke': 'fluke.com',
  'sick': 'sick.com',
  'omron': 'omron.com',
  'schneider': 'se.com',
  'siemens': 'siemens.com',
  'abb': 'abb.com',
  'microsoft': 'microsoft.com',
  'google': 'google.com',
  'amazon': 'amazon.com',
  'apple': 'apple.com',
  'samsung-2': 'samsung.com',
  'lg': 'lg.com',
  'bosch': 'bosch.com',
  'dji-2': 'dji.com',
  'autel-2': 'autelrobotics.com',
  'parrot-2': 'parrot.com',
  'skydio': 'skydio.com',
  'wingtra': 'wingtra.com',
  'sensefly': 'sensefly.com',
  'delair': 'delair.aero',
  'quantum-systems': 'quantum-systems.com',
  'uvify': 'uvify.com',
  'teal-drones': 'tealdrones.com',
  'vantage-robotics': 'vantagerobotics.com',
  'flirtey': 'flirtey.com',
  'zipline': 'flyzipline.com',
  'wing': 'wing.com',
  'amazon-prime-air': 'amazon.com',
  'ups': 'ups.com',
  'dhl': 'dhl.com',
  'fedex': 'fedex.com',
  'matternet': 'matternet.us',
  'volansi': 'volansi.com',
  'swoop-aero': 'swoop.aero',
  'elroy-air': 'elroyair.com',
  'pipistrel': 'pipistrel-aircraft.com',
  'airbus': 'airbus.com',
  'boeing': 'boeing.com',
  'lockheed-martin': 'lockheedmartin.com',
  'northrop-grumman': 'northropgrumman.com',
  'raytheon': 'rtx.com',
  'general-atomics': 'ga-asi.com',
  'textron': 'textron.com',
  'bell': 'bellflight.com',
  'saab': 'saabgroup.com',
  'dassault': 'dassault-aviation.com',
  'thales': 'thalesgroup.com',
  'leonardo': 'leonardocompany.com',
  'bae-systems': 'baesystems.com',
  'rolls-royce': 'rolls-royce.com',
  'general-electric': 'ge.com',
  'honeywell': 'honeywell.com',
  'collins-aerospace': 'collinsaerospace.com',
  'l3harris': 'l3harris.com',
  'anduril': 'anduril.com',
  'palantir': 'palantir.com',
  'shield-ai': 'shield.ai',
  'skydio-2': 'skydio.com',
  'parrot-3': 'parrot.com',
  'dji-3': 'dji.com',
  'autel-3': 'autelrobotics.com',
};

function downloadLogo(slug, domain) {
  return new Promise((resolve) => {
    const outPath = path.join(OUT_DIR, `${slug}.png`);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 1000) {
      return resolve(true);
    }
    const url = `https://logo.clearbit.com/${domain}?size=128&format=png`;
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 8000,
    }, (res) => {
      if (res.statusCode === 200) {
        const chunks = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          if (buf.length > 500) {
            fs.writeFileSync(outPath, buf);
            console.log(`  [OK] ${slug} <- ${domain} (${buf.length}b)`);
            resolve(true);
          } else {
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Downloading to: ${OUT_DIR}`);
  const entries = Object.entries(BRAND_DOMAINS);
  let ok = 0, fail = 0;
  for (const [slug, domain] of entries) {
    const success = await downloadLogo(slug, domain);
    if (success) ok++; else fail++;
    await new Promise(r => setTimeout(r, 150));
  }
  console.log(`\nDone: ${ok} downloaded, ${fail} failed`);
}

main().catch(console.error);
