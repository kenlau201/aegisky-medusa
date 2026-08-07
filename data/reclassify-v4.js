/**
 * Product classification v4 - much stricter drone identification
 */
const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'enriched/products_enriched.json'), 'utf8'));

// Accessory name starters - if product name STARTS with these, it's definitely an accessory, not a drone
const ACCESSORY_STARTERS = [
  /^motor\s/i, /^мотор\s/i, /^двигатель\s/i, /^бесколлекторный\s/i, /^бесщеточный\s/i,
  /^battery\s/i, /^аккумулятор\s/i, /^аккум\s/i, /^lipo\s/i, /^li-po\s/i, /^lihv\s/i,
  /^зарядное\s/i, /^charger\s/i, /^зарядка\s/i, /^balance charger/i,
  /^esc\s/i, /^регулятор\s/i, /^speed controller/i,
  /^propeller\s/i, /^пропеллер\s/i, /^проп\s/i, /^лопаст/i, /^винт\s/i, /^воздушный винт/i,
  /^сервопривод\s/i, /^сервомашин/i, /^servo\s/i,
  /^flight controller/i, /^полетный контроллер/i, /^контроллер полета/i, /^fc\s/i,
  /^frame\s/i, /^рама\s/i, /^каркас\s/i, /^кит рамы/i, /^луч\s/i, /^arm\s/i,
  /^camera\s/i, /^камера\s/i, /^fpv camera/i, /^runcam/i, /^caddx/i, /^foxeer/i,
  /^fpv.*очки/i, /^goggles/i, /^видеошлем/i, /^очки\s/i,
  /^vtx\s/i, /^video transmitter/i, /^видеопередатчик/i, /^передатчик видео/i,
  /^vrx\s/i, /^video receiver/i, /^видеоприемник/i,
  /^receiver\s/i, /^приемник\s/i, /^приёмник\s/i,
  /^transmitter\s/i, /^пульт управления/i, /^аппаратура/i, /^передатчик управления/i,
  /^антенна/i, /^antenna\s/i,
  /^monitor\s/i, /^монитор\s/i, /^экран\s/i, /^дисплей\s/i,
  /^gimbal\s/i, /^подвес\s/i, /^стабилизатор/i, /^трехосевой подвес/i,
  /^силовой кабель/i, /^кабель\s/i, /^cable\s/i, /^провод\s/i, /^wire\s/i,
  /^разъем\s/i, /^connector\s/i, /^штекер\s/i,
  /^модуль\s/i, /^module\s/i, /^плата\s/i, /^board\s/i,
  /^датчик\s/i, /^sensor\s/i,
  /^лидар\s/i, /^lidar\s/i,
  /^gps\s/i, /^gnss\s/i, /^gps module/i,
  /^power module/i, /^модуль питания/i, /^bec\s/i, /^ubec\s/i,
  /^power supply/i, /^блок питания/i, /^источник питания/i,
  /^sound module/i, /^speaker\s/i, /^громкоговоритель/i, /^мегафон/i,
  /^spotlight/i, /^прожектор/i, /^фара\s/i, /^светодиод/i, /^led\s/i,
  /^payload release/i, /^устройство сброса/i, /^механизм сброса/i,
  /^case\s/i, /^кейс\s/i, /^чехол\s/i, /^сумка\s/i, /^рюкзак/i,
  /^memory card/i, /^microsd/i, /^карта памяти/i, /^sd card/i,
  /^tool/i, /^инструмент/i, /^отвертка/i, /^ключ\s/i, /^шестигранник/i,
  /^запчаст/i, /^spare part/i, /^ремкомплект/i, /^repair kit/i,
  /^пропеллеры для/i, /^лопасти для/i, /^аксессуар/i, /^accessory/i,
  /^крепление/i, /^mount\s/i, /^держатель/i, /^holder\s/i, /^адаптер/i, /^adapter\s/i,
  /^сонар/i, /^sonar/i, /^эхолот/i, /^картплоттер/i, /^chartplotter/i,
  /^тепловизор/i, /^thermal camera/i, /^тепловизионная камера/i,
  /^объектив/i, /^lens\s/i,
  /^autopilot/i, /^автопилот/i,
  /^sbc\s/i, /^raspberry/i, /^orange pi/i, /^jetson/i, /^одноплатный/i,
  /^противодрон/i, /^антидрон/i, /^anti-drone/i, /^counter-drone/i,
  /^подавитель/i, /^jammer/i, /^глушилка/i,
  /^обнаружитель/i, /^детектор дрон/i, /^drone detector/i,
  /^спектр.*анализатор/i, /^spectrum analyz/i,
  /^чип\s/i, /^микросхема/i, /^integrated circuit/i,
  /^программное/i, /^software/i, /^лицензия/i, /^прошивка/i,
  /^робот\s/i, /^robot\s/i, /^робопес/i, /^robot dog/i,
  /^шасси\s/i, /^landing gear/i,
  /^регулятор скорости/i, /^контроллер.*мотора/i, /^motor controller/i,
  /^регулятор.*оборотов/i, /^турбореактивный/i,
  /^всенаправленная/i, /^направленная.*антенна/i,
  /^вспомогательная.*камера/i, /^запасная.*камера/i,
  /^захват.*манипулятора/i, /^манипулятор/i, /^роботизированная.*рука/i,
  /^коммутатор/i, /^switch\s/i, /^маршрутизатор/i, /^router\s/i, /^сетевое/i,
  /^радиостанция/i, /^радиомодуль/i, /^радиомодем/i, /^radio module/i,
  /^pbm/i, /^vin/i, /^преобразователь/i, /^converter/i,
  /^pbm.*motor/i, /^ CubeMars/i,
  /^подводный.*захват/i, /^подводный.*манипулятор/i,
  /^акб для/i, /^battery for/i,
  /^портативная.*зарядная/i, /^зарядная станция/i,
  /^ tb\d+/i, /^wb\d+/i,
  /^комплект.*пропеллеров/i, /^set.*propeller/i,
  /^дополнительный.*набор/i, /^extra.*set/i,
  /^соединитель/i, /^connector.*for/i,
  /^шлейф/i, /^ribbon cable/i, /^косичка/i,
  /^площадка.*для/i, /^mounting.*plate/i,
  /^нога.*для/i, /^leg.*for/i,
  /^крышка.*для/i, /^cover.*for/i,
  /^фильтр.*для/i, /^filter.*for/i,
  /^док-?станция/i, /^dock.*station/i,
  /^зарядное.*устройство/i,
  /^инвертор/i, /^inverter/i,
  /^реле/i, /^relay\s/i,
  /^транзистор/i, /^диод/i, /^резистор/i, /^конденсатор/i,
  /^усилитель/i, /^amplifier/i,
  /^микрофон/i, /^microphone/i,
  /^сирена/i, /^siren/i,
  /^клапан/i, /^valve/i,
  /^насос/i, /^pump/i,
  /^вентилятор/i, /^fan\s/i,
  /^радиатор/i, /^heat sink/i,
  /^измеритель/i, /^meter\s/i, /^тестер/i, /^мультиметр/i,
  /^осциллограф/i, /^oscilloscope/i,
  /^паяльник/i, /^soldering/i,
  /^3d-?принтер/i, /^3d printer/i,
  /^сканер/i, /^scanner/i,
  /^джойстик/i, /^joystick/i,
  /^кнопка/i, /^button/i, /^переключатель/i, /^switch.*button/i,
  /^дисплей.*для/i, /^screen.*for/i,
  /^плата.*расширения/i, /^expansion board/i,
  /^отладочная.*плата/i, /^development board/i,
  /^одноплатный/i, /^single board/i,
  /^модуль.*камеры/i, /^camera module/i,
  /^модуль.*gps/i, /^gps module/i,
  /^модуль.*датчика/i, /^sensor module/i,
  /^инерциальный/i, /^imu\s/i,
  /^барометр/i, /^barometer/i,
  /^компас/i, /^compass/i,
  /^акселерометр/i, /^accelerometer/i,
  /^гироскоп/i, /^gyroscope/i,
  /^дальномер/i, /^range finder/i,
  /^лазерный.*дальномер/i, /^laser.*range/i,
  /^tof/i, /^vl53/i, /^tf-?luna/i, /^tf02/i,
  /^оптический.*поток/i, /^optical flow/i,
  /^токоизмеритель/i, /^current sensor/i,
  /^навигационный.*огонь/i, /^navigation light/i,
  /^стробоскоп/i, /^strobe/i,
  /^маяк/i, /^beacon/i,
  /^buzzer/i, /^зуммер/i,
  /^led.*strip/i, /^светодиодная.*лента/i,
  /^подсветка/i, /^backlight/i,
  /^вибромотор/i, /^vibration motor/i,
  /^виброразвязка/i, /^vibration damp/i,
  /^гребной.*винт/i, /^подводный.*мотор/i,
  /^плавник/i, /^fin\s/i,
  /^балласт/i, /^ballast/i,
  /^камера.*заднего/i, /^fpv.*камера.*для/i,
  /^курсовая.*камера/i,
  /^hd.*камера/i,
  /^4k.*камера/i,
  /^камера.*1080/i,
  /^камера.*4k/i,
  /^ru\.?as/i,
  /^sub250/i,
  /^hglrc/i,
  /^geprc/i,
  /^iflight/i,
  /^t-motor/i,
  /^tmotor/i,
  /^mad/i,
  /^emax/i,
  /^brotherhobby/i,
  /^xnova/i,
  /^scorpion/i,
  /^dualsky/i,
  /^sunnysky/i,
  /^rcinpower/i,
  /^ipower/i,
  /^atway/i,
  /^tbs/i,
  /^akk/i,
  /^rush/i,
  /^matek/i,
  /^speedybee/i,
  /^diatone/i,
  /^mamba/i,
  /^hakrc/i,
  /^flywoo/i,
  /^betafpv/i,
  /^eachine/i,
  /^radiomaster/i,
  /^jumper/i,
  /^frsky/i,
  /^flysky/i,
  /^spektrum/i,
  /^futaba/i,
  /^skyzone/i,
  /^fatshark/i,
  /^fat shark/i,
  /^toolkitrc/i,
  /^isdt/i,
  /^hota/i,
  /^skyrc/i,
  /^dji.*tb/i,
  /^dji.*wb/i,
  /^zenmuse.*l/i,
  /^zenmuse.*xt/i,
  /^zenmuse.*p/i,
  /^zenmuse.*h20n/i,
  /^zenmuse.*h30/i,
  /^zenmuse.*v1/i,
  /^zenmuse.*s1/i,
  /^siyi.*a2/i,
  /^siyi.*r1m/i,
  /^siyi.*zr/i,
  /^siyi.*zt/i,
  /^siyi.*mk/i,
  /^siyi.*fm/i,
  /^siyi.*hm/i,
  /^viewpro/i,
  /^gremsy/i,
  /^tarot.*gimbal/i,
  /^tarot.*подвес/i,
  /^unitree.*l/i,
  /^ydlidar/i,
  /^rplidar/i,
  /^livox/i,
  /^slamtec/i,
  /^holybro.*h-?rtk/i,
  /^holybro.*here/i,
  /^ublox/i,
  /^neo-?m/i,
  /^m8n/i,
  /^m9n/i,
  /^m10/i,
  /^cuav/i,
  /^here\+/i,
  /^prince/i,
  /^bayckrc/i,
  /^gaoneng/i,
  /^gaolag/i,
  /^честная/i,
  /^b&c/i,
  /^tattu/i,
  /^grepow/i,
  /^gens ace/i,
  /^fullymax/i,
  /^dinogy/i,
  /^atway.*motor/i,
  /^cubemars/i,
  /^cube mars/i,
  /^surpass/i,
  /^qx-?motor/i,
  /^дмр-/i,
  /^эд-?бкм/i,
  /^ед-/i,
  /^уппо/i,
  /^у-?уппо/i,
  /^furious/i,
  /^sub250/i,
  /^hexacharger/i,
  /^osh\s/i,
  /^cw1/i,
  /^mushroom/i,
  /^mf\d+/i,
  /^its\d+/i,
  /^gl\d+/i,
  /^wp\d+/i,
  /^ns\d+/i,
  /^p\d+×/i,
  /^p\d+x/i,
  /^qf\d+/i,
  /^s\d+/i,
  /^x\d+/i,
  /^mn\d+/i,
  /^gbm\d+/i,
  /^gm\d+/i,
  /^am\d+/i,
  /^at\d+/i,
  /^mn\d+/i,
  /^cl\d+/i,
  /^xl\d+/i,
  /^st\d+/i,
  /^fl\d+/i,
  /^ld\d+/i,
  /^tw\d+/i,
  /^sdm\d+/i,
  /^gs\d+/i,
  /^stl\d+/i,
  /^m750/i,
  /^mega 360/i,
  /^echomap/i,
  /^striker/i,
  /^arm b/i,
  /^arm 2/i,
  /^wsrc/i,
  /^ф1/i,
];

// Positive drone indicators
const DRONE_POSITIVE = [
  /квадрокоптер/i, /quadcopter/i, /квадр[оo]коптер/i,
  /\brtf\b/i, /\bbnf\b/i, /\bpnf\b/i, /\barf\b/i,
  /готовый.*к.*полетам/i, /ready.*to.*fly/i, /bind.*and.*fly/i, /plug.*and.*fly/i,
  /гексакоптер/i, /hexacopter/i,
  /октокоптер/i, /octocopter/i,
  /трикоптер/i, /tricopter/i,
  /самолет.*р\/у/i, /\brc\s*plane/i, /fixed.?wing.*drone/i, /vtol.*drone/i,
  /подводный.*аппарат/i, /подводный.*дрон/i, /\brov\b/i,
  /fpv.*(?:комплект|набор|kit|set|ready|drone|quad|copter)/i,
  /(?:комплект|набор|kit|set).*fpv/i,
  /\bdrone\b.*(?:combo|kit|set|package|ready|rtf|bnf|pnp)/i,
  /(?:combo|kit|set|package|ready|rtf|bnf|pnp).*\bdrone\b/i,
  /дрон.*(?:комплект|набор|готовый|rtf|bnf|combo)/i,
  /(?:комплект|набор|готовый|rtf|bnf|combo).*дрон/i,
  /дрон.*с.*камерой/i, /drone.*with.*camera/i,
  /дрон.*с.*gps/i, /drone.*with.*gps/i,
  /квадрокоптер.*dji/i, /quadcopter.*dji/i,
  /дрон.*autel/i, /drone.*autel/i,
  /дрон.*syma/i, /drone.*syma/i,
  /mavic.*(?:combo|fly more|pro|air|mini)/i,
  /matrice.*(?:combo|rtk|worry)/i,
  /phantom.*(?:combo|rtk|pro)/i,
  /inspire.*(?:combo|pro)/i,
  /evo.*(?:pro|max|lite)/i,
  /anafi/i,
  /skydio/i,
  /fifish/i,
  /qysea/i,
  /camoro.*(?:underwater|space|seaflyer)/i,
  /подводный.*(?:аппарат|дрон|робот)/i,
  /underwater.*(?:drone|rov|vehicle)/i,
  /fpv.*дрон/i, /fpv.*drone/i,
  /гоночный.*дрон/i, /racing.*drone/i,
  /сельскохозяйственный.*дрон/i, /agricultural.*drone/i,
  /агродрон/i,
  /промышленный.*дрон/i, /industrial.*drone/i,
  /грузовой.*дрон/i, /cargo.*drone/i,
  /транспортный.*дрон/i, /transport.*drone/i,
  /профессиональный.*дрон/i, /professional.*drone/i,
  /потребительский.*дрон/i, /consumer.*drone/i,
  /игрушечный.*дрон/i, /toy.*drone/i,
  /детский.*дрон/i,
  /тепловизионный.*дрон/i, /thermal.*drone/i,
  /дрон.*с.*тепловизором/i,
  /военный.*дрон/i, /military.*drone/i,
  /боевой.*дрон/i,
  /ударный.*дрон/i,
  /дрон-?камикадзе/i,
  /barrage.*munition/i,
  /loitering.*munition/i,
  /"Кречет"/i,
  /"Разведчик"/i,
  /"Охотник"/i,
  /"Герань"/i,
  /"Шахед"/i,
  /"Ланцет"/i,
  /"Куб"/i,
  /Охранник-?\d/i,
  /ПУТЬ.*\d/i,
  /Корвет/i,
  /Водяной-?\d/i,
  /Девятый/i,
  /H300/i,
  /H200/i,
  /Copterparts.*H\d/i,
  /Copterparts.*M\d/i,
];

function isDrone(name, description) {
  const nameLower = (name || '').toLowerCase();
  const text = (nameLower + ' ' + (description || '').toLowerCase()).substring(0, 5000);

  // If name starts with an accessory keyword, it's NOT a drone
  for (const pattern of ACCESSORY_STARTERS) {
    if (pattern.test(nameLower)) return false;
  }

  // Check positive indicators
  for (const pattern of DRONE_POSITIVE) {
    if (pattern.test(text)) return true;
  }

  return false;
}

function matchesPatterns(text, patterns) {
  if (!patterns) return false;
  for (const p of patterns) {
    try {
      const regex = new RegExp(p, 'i');
      if (regex.test(text)) return true;
    } catch(e) {}
  }
  return false;
}

// Classification rules
const classificationRules = [
  // Counter-drone first
  { category: 'anti-drone-guns', namePatterns: ['антидрон.*ружье', 'anti-?drone.*gun', 'противодроновое ружье', 'портативный.*подавитель.*дрон', 'portable.*drone.*jammer.*gun', 'глушилка.*дрон.*ружье', 'drone.*jammer.*gun', 'бластер'] },
  { category: 'drone-detectors', namePatterns: ['обнаружитель.*дрон', 'детектор.*дрон', 'drone.*detect', 'система.*обнаружения.*дрон', 'радар.*дрон', 'radar.*drone', 'пеленгатор.*дрон', 'аэроскоп', 'aeroscope', 'система.*мониторинга.*воздушного'] },
  { category: 'anti-drone', namePatterns: ['антидрон', 'anti-?drone', 'подавитель.*беспилотник', 'противодрон', 'counter.?drone', 'глушилка.*fpv', 'jammer.*drone', 'система.*подавлен.*беспилотник', 'защита.*от.*дрон', 'купол.*защита', 'шторм.*мини'] },
  { category: 'spectrum-analyzers', namePatterns: ['спектр.*анализатор', 'spectrum.*analyz', 'анализатор.*спектр'] },

  // Drones
  { category: 'underwater-drones', namePatterns: ['подводн.*аппарат', 'подводн.*дрон', 'underwater.*drone', 'underwater.*rov', '\\brov\\b', 'fifish', 'qysea', 'seaflyer', 'camoro.*underwater', 'водяной.*про', 'водяной-\\d+', 'submarine.*drone', 'глубоководный.*аппарат'], mustBeDrone: true },
  { category: 'military-drones', namePatterns: ['военный.*дрон', 'military.*drone', 'боевой.*дрон', 'ударный.*дрон', 'герань', 'шахед', 'ланцет', 'куб-?бла', 'fpv.*ударн', 'fpv.*боев', 'камикадзе.*дрон', 'barrage.*munition', 'loitering.*munition', 'дрон-?камикадзе', 'охранник.*м', 'разведчик.*\\d', 'охотник.*дрон'], mustBeDrone: true },
  { category: 'agricultural-drones', namePatterns: ['агродрон', 'agricultural.*drone', 'сельскохоз.*дрон', 'опрыскивател.*дрон', 'распылител.*дрон', 'агрокоптер', 'дрон.*для.*опрыскивания', 'spraying.*drone', 't10.*drone', 't20p.*drone', 't30.*drone', 't40.*drone', 'agr.*drone', 'корвет.*агро'], mustBeDrone: true },
  { category: 'racing-drones', namePatterns: ['racing.*drone', 'гоночный.*дрон', 'гонк.*дрон', 'race.*quad', 'fpv.*racer', 'tinywhoop', 'tiny whoop', 'cinewhoop', 'speed.*drone', 'гоночный.*квадрокоптер'], mustBeDrone: true },
  { category: 'enterprise-drones', namePatterns: ['matrice', 'm30 ', 'm30t', 'm300', 'm350', 'm400', 'm4e', 'm4t', 'm4td', 'mavic 3e', 'mavic 3t', 'mavic 3 enterprise', 'mavic 3m', 'phantom 4 rtk', 'phantom 4 multisp', 'enterprise.*drone', 'дрон.*для.*предприятий', 'inspire 3', 'wingtra', 'delair', 'm30.*rtk', 'm300.*rtk', 'm350.*rtk', 'matrice.*combo', 'matrice.*rtk', 'm200', 'm210', 'm30t.*combo', 'm30.*combo', 'm300.*combo', 'кречет'], mustBeDrone: true },
  { category: 'thermal-drones', namePatterns: ['thermal.*drone', 'тепловизион.*дрон', 'дрон.*с.*тепловизор', 'thermal.*quad', 'mavic.*thermal', 'm3t.*drone', 'h20t.*combo', 'h30t.*combo', 'дрон.*теплови'], mustBeDrone: true },
  { category: 'industrial-drones', namePatterns: ['промышленный.*дрон', 'industrial.*drone', 'грузовой.*дрон', 'cargo.*drone', 'heavy.*lift.*drone', 'большой.*грузоподъем.*дрон', 'транспортный.*дрон', 'transport.*drone', 'h300.*drone', 'h200.*drone', 'copterparts.*h\\d', 'корвет.*дрон'], mustBeDrone: true },
  { category: 'fpv-drones', namePatterns: ['fpv.*drone', 'fpv.*quad', 'fpv.*коптер', 'fpv.*комплект', 'fpv.*набор', 'fpv.*ready', 'rtf.*fpv', 'bnf.*fpv', 'pnp.*fpv', 'analog.*fpv.*drone', 'digital.*fpv.*drone', 'elrs.*drone', 'nazgul.*fpv', 'venom.*fpv', 'crux3', 'meteor.*fpv', 'protek.*fpv', 'iflight.*fpv.*drone', 'iflight.*nazgul', 'flywoo.*venom', 'гексакоптер.*fpv', 'hexacopter.*fpv', 'fpv.*сет', 'fpv.*set', 'fpv.*kit', 'atway.*путь', 'девятый'], mustBeDrone: true },
  { category: 'professional-drones', namePatterns: ['pro.*drone', 'professional.*drone', 'профессиональный.*дрон', 'autel.*evo', 'skydio', 'parrot.*anafi', 'anafi.*ai', 'mavic 3 pro', 'mavic 3 classic', 'mavic 3 cine', 'air 3', 'air 2s', 'mini 4 pro', 'mini 3 pro', 'evo.*max', 'evo.*lite', 'evo.*ii'], mustBeDrone: true },
  { category: 'consumer-drones', namePatterns: ['quadcopter', 'квадрокоптер', 'дрон', 'drone', 'беспилотник', 'mavic', 'mini', 'spark', 'tello', 'syma', 'hubsan', 'eachine', 'jjrc', 'holy stone', 'potensic', 'ryze', 'flip', 'avata', 'dji.*mini', 'dji.*air', 'dji.*avata', 'dji.*neo', 'dji.*mavic', 'phantom', 'cetus', 'бетавр', 'коптер.*готовый', 'дрон.*с.*камерой', 'охранник-?2', 'охранник-?3'], mustBeDrone: true },
  { category: 'toy-drones', namePatterns: ['игрушк.*дрон', 'toy.*drone', 'детский.*дрон', 'indoor.*drone'], mustBeDrone: true },

  // Flight control
  { category: 'flight-controllers', namePatterns: ['полетный контроллер', 'flight controller', 'flight control board', '\\bfc\\b', 'f405', 'f411', 'f722', 'f745', 'h743', 'h7a3', 'betaflight.*fc', 'inav.*fc', 'ardupilot.*fc', 'pixhawk', 'cube ', 'matek.*f', 'speedybee.*f', 'iflight.*f', 'mamba.*f', 'diatone.*mamba', 'контроллер полета', 'плата управления полетом'] },
  { category: 'autopilots', namePatterns: ['автопилот', 'autopilot', 'pixhawk.*set', 'cube orange', 'cube black', 'ardupilot.*autopilot', 'px4.*autopilot'] },
  { category: 'esc', namePatterns: ['\\besc\\b', 'регулятор.*скорост', 'регулятор.*хода', 'speed controller', 'blheli', 'blheli_s', 'blheli_32', 'am32', '4in1.*esc', '4-в-1.*esc', 'hakrc.*esc', 't-motor.*esc', 'iflight.*esc', 'hobbywing.*esc', '\\d+a.*esc', 'esc.*регулятор', 'esc.*12s', 'esc.*6s', 'esc.*4s', 'регулятор.*оборотов', 'контроллер.*мотора', 'motor controller', 'furious.*motor.*\\d+s'] },
  { category: 'power-modules', namePatterns: ['power module', 'модуль питания', '\\bbec\\b', '\\bubec\\b', 'voltage regulator', 'регулятор напряжения', 'power distribution', 'pdb', 'pm02', 'pm06', 'pm07'] },
  { category: 'sbc', namePatterns: ['raspberry pi', 'raspberrypi', 'orange pi', 'jetson', 'rockchip', 'одноплатный компьютер', 'single board computer', '\\bsbc\\b'] },
  { category: 'sensors', namePatterns: ['sensor', 'датчик', '\\bimu\\b', 'барометр', 'barometer', 'магнитометр', 'compass', 'компас', 'акселерометр', 'accelerometer', 'гироскоп', 'gyroscope', 'tof.*sensor', 'range.*sensor', 'distance sensor', 'оптический поток', 'optical flow', 'lidar-lite', 'tf-luna', 'tf02', 'vl53', 'inertial.*measurement', '\\bins\\b', 'токоизмеритель', 'current sensor', 'преобразователь.*тока', 'current.*transducer', 'seneca.*t201', 't201.*seneca'] },
  { category: 'lidar', namePatterns: ['лидар', 'lidar', 'лазерный.*дальномер', 'laser.*range.*finder', '3d.*lidar', '2d.*lidar', 'ydlidar', 'rplidar', 'unitree.*l[123]', 'zenmuse.*l1', 'zenmuse.*l2', 'zenmuse.*l3', 'livox', 'velodyne', 'ouster', 'slamtec', 'ld06', 'ld19', 'stl27l', 'dtof.*lidar', 'realsense.*l5'] },
  { category: 'gps', namePatterns: ['gps.*модуль', 'gps.*module', 'gnss.*module', 'gps-', '\\bgps\\b', 'm8n', 'm8p', 'm9n', 'm10', 'ublox', 'neo-', 'nmea', 'rtk.*gps', 'gps.*rtk', 'compass.*gps', 'навигационный модуль', 'спутниковый приемник', 'gnss.*приемник', 'gnss.*система', 'holybro.*h-?rtk', 'holybro.*here', 'here\\+', 'here v3', 'mosaic-?h', 'unicore.*um98', 'prince.*i90', 'cuav.*rtk'] },

  // Power
  { category: 'motors', namePatterns: ['brushless.*motor', 'бесколлекторный.*двигатель', 'бесколлекторный.*мотор', 'бесщеточный.*мотор', 't-motor.*motor', 'tmotor.*motor', 'mad.*motor', 'iflight.*motor', 'emax.*motor', 'brotherhobby.*motor', 'xnova.*motor', 'scorpion.*motor', 'hacker.*motor', 'dualsky.*motor', 'sunnysky.*motor', 'rcinpower.*motor', 'ipower.*motor', 'gbm\\d+', 'gm\\d+', 'atway.*motor', 'motor.*\\d+kv', '\\d+kv.*motor', 'motor.*tad', 'tad\\d+', 'мотор.*бесколлекторный', 'двигатель.*бесколлекторный', 'турбореактивный.*motor', 'cubemars.*gl', 'cube mars.*gl', 'surpass.*motor', 'qx-?motor.*qf', 'дмр-?\\d', 'эд-?бкм', 'ед-?\\d', 'уппо.*дмр', 'у-?уппо.*эд', 'mad.*\\d{4}', 'motor.*its\\d', 'its\\d+.*motor', 'mf\\d+.*motor', 'motor.*mf\\d', 'gl\\d+.*motor', 'motor.*gl\\d', 'wp\\d+.*motor', 'motor.*wp\\d', '\\d{4}.*motor', 'motor.*\\d{4}.*kv'] },
  { category: 'propellers', namePatterns: ['propeller', 'пропеллер', 'проп', 'лопаст', 'воздушный винт', '2-blade', '3-blade', '2 лопаст', '3 лопаст', 'двухлопаст', 'трехлопаст', 'dalprop', 'hqprop', 'gemfan', 'foxeer.*prop', 't-motor.*p\\d', '\\d{4}.*prop', 'carbon.*prop', 'деревянные.*винт', 'airscrew', 'пропеллеры для', 'лопасти для', 'комплект.*пропеллеров', 'set.*propeller', 'дополнительный.*набор.*проп', 'extra.*set.*prop', 'mf\\d+.*prop', 'ns\\d+.*prop', 'p\\d+×', 'p\\d+x'] },
  { category: 'propellers-2-blade', namePatterns: ['2-blade.*prop', 'двухлопаст.*проп', '2 лопаст.*проп'] },
  { category: 'propellers-3-blade', namePatterns: ['3-blade.*prop', 'трехлопаст.*проп', '3 лопаст.*проп', 'tri-blade.*prop'] },
  { category: 'servos', namePatterns: ['сервопривод', 'сервомашин', 'servo motor', 'digital servo', 'analog servo', 'feetech.*servo', 'k-power.*servo', 'hbl\\d+', 'ds3218', 'mg996r', 'sg90', 'цифровой сервопривод'] },
  { category: 'batteries', namePatterns: ['lipo.*battery', 'li-po.*аккумулятор', 'lihv.*battery', 'li-ion.*battery', 'lithium.*battery', 'литиевый.*аккумулятор', 'smart battery', 'интеллектуальный аккумулятор', 'tb60', 'tb55', 'tb47', 'tb65', 'wb37', '\\d+s.*lipo', 'lipo.*\\d+s', '\\d+mah', '\\d+\\s*mah', 'tattu.*battery', 'grepow.*battery', 'gens.*ace.*battery', 'dinogy.*battery', 'fullymax.*battery', 'atway.*battery', 'честная.*battery', 'b&c.*lipo', 'аккумулятор.*\\d+mah', 'battery.*\\d+mah', 'battery.*dji.*matrice', 'аккумулятор.*dji.*matrice', 'intelligent flight battery', 'акб для', 'battery for', 'gaolag.*battery', 'hglrc.*battery', 'портативная.*зарядная', 'зарядная станция'] },
  { category: 'chargers', namePatterns: ['balance charger', 'балансировочное зарядное', 'battery charger', 'toolkitrc', 'isdt.*charger', 'hota.*charger', 'skyrc.*charger', 'imars', 'd6.*charger', 'd10.*charger', 'm6d.*charger', 'm8s.*charger', 'ac/dc.*charger', 'зарядное.*устройство.*для.*аккумулятор', 'зарядное устройство', 'hexacharger', 'sub250.*cw', 'skyrc.*osh'] },
  { category: 'power-supplies', namePatterns: ['блок питания', 'power supply', 'источник питания', 'адаптер питания', 'ac adapter', 'dc power supply', 'лабораторный блок', 'korad', 'rd6018', '24v.*power supply', '12v.*power supply', '48v.*power supply'] },

  // FPV & Video
  { category: 'fpv-cameras', namePatterns: ['fpv.*camera', 'fpv.*камера', 'камера.*fpv', 'camera.*fpv', 'runcam', 'caddx', 'foxeer.*camera', 'dji.*o3.*air', 'dji.*o4.*air', 'vista.*camera', 'air unit.*camera', 'predator.*camera', 'tarsier.*camera', 'nano.*fpv', 'micro.*fpv.*camera', 'siyi.*a2', 'siyi.*r1m', '1080p.*fpv.*camera', '720p.*fpv.*camera', 'курсовая.*камера', 'камера.*курсовая'] },
  { category: 'fpv-goggles', namePatterns: ['fpv.*очки', 'fpv.*goggles', 'fpv.*шлем', 'goggles.*fpv', 'dji.*goggles', 'fatshark', 'fat shark', 'skyzone.*goggle', 'ev300', 'ev200', 'hd3.*goggle', 'v2.*goggle', 'v3.*goggle', 'integra', 'видеошлем', 'video goggles', 'gl1.*goggle', 'swellpro.*gl1'] },
  { category: 'fpv-goggle-accessories', namePatterns: ['goggle.*accessor', 'очки.*аксессуар', 'goggle.*lens', 'goggle.*antenna', 'goggle.*battery', 'goggle.*strap', 'faceplate.*goggle', 'маска.*для.*очков', 'линза.*для.*очков'] },
  { category: 'vtx', namePatterns: ['\\bvtx\\b', 'video transmitter', 'видеопередатчик', 'передатчик.*видео', '5.8g.*vtx', '2.4g.*vtx', '1.2g.*vtx', '1.3g.*vtx', 'tbs.*unity', 'tbs.*unify', 'akk.*vtx', 'rush.*tank', 'rush.*solo', 'matek.*vtx', 'iflight.*vtx', 'dji.*vista', 'dji.*air unit', 'dji.*o3', 'dji.*o4', '25mw.*vtx', '200mw.*vtx', '400mw.*vtx', '600mw.*vtx', '800mw.*vtx', '1w.*vtx', '2w.*vtx', 'sk7200', 'hm30', 'siyi.*fm30', 'цифровая.*система.*видеопередач', 'video.*transmission.*system', 'цифровая.*передача.*изображен', 'siyi.*air unit', 'bayckrc.*gemini', 'bayckrc.*nano'] },
  { category: 'vrx', namePatterns: ['\\bvrx\\b', 'video receiver', 'видеоприемник', 'приемник.*видео', '5.8g.*receiver.*video', 'diversity.*receiver', 'rx5808', 'rapidfire', 'tbs.*fusion', 'true-d', 'axii.*receiver'] },
  { category: 'antennas', namePatterns: ['антенна', 'antenna', 'patch.*antenna', 'dipole.*antenna', 'omni.*antenna', 'lollipop.*antenna', 'pagoda.*antenna', 'axii', 'triple feed', 'crosshair', '5.8g.*antenna', '2.4g.*antenna', '1.2g.*antenna', '1.3g.*antenna', 'rhcp.*antenna', 'lhcp.*antenna', 'sma.*antenna', 'mmcx.*antenna', 'u.fl.*antenna', 'ipex.*antenna', 'всенаправленная.*антенна', 'направленная.*антенна', 'панельная.*антенна', 'skyzone.*patch', 'siyi.*mk.*antenna', 'siyi.*lollipop', 'mushroom.*antenna', 'skyzone.*mushroom'] },
  { category: 'monitors', namePatterns: ['fpv.*monitor', '5.*monitor.*fpv', '7.*monitor.*fpv', 'diversity.*monitor', 'hdmi.*monitor.*fpv', 'ips.*monitor.*fpv', 'экран.*fpv', 'дисплей.*fpv', 'seetec.*monitor', 'eachine.*monitor', 'sky.*monitor'] },
  { category: 'cameras', namePatterns: ['action camera', 'экшен-камера', 'gopro.*hero', 'hero.*13', 'hero.*12', 'hero.*11', 'hero.*10', 'osmo.*action', 'insta360', 'one x[234]?', 'one r', 'one rs', 'x3.*camera', 'x4.*camera', 'hd camera', '4k camera', '8k camera', 'usb camera', 'webcam', 'elp.*camera', 'global shutter.*camera', 'machine vision.*camera', 'zed.*camera', 'stereo.*camera', 'zed x', 'zed 2', 'h20n', 'h30.*camera', 'zenmuse.*p1', 'zenmuse.*h20n', 'siyi.*zr30', 'viewpro.*camera', 'промышленная.*камера', 'камера.*4k', 'камера.*8mp', 'камера.*12mp', 'вспомогательная.*камера', 'gopro'] },
  { category: 'camera-lenses', namePatterns: ['объектив', 'camera lens', 'fisheye lens', 'wide angle lens', 'pinhole lens', 'm12 lens', 'cs-mount lens', 'c-mount lens', '2.1mm.*lens', '2.5mm.*lens', '3.6mm.*lens', '6mm.*lens', '8mm.*lens', '12mm.*lens', 'линза.*для.*камеры'] },
  { category: 'thermal-cameras', namePatterns: ['тепловизор', 'thermal camera', 'тепловизионная.*камера', 'thermal imaging', 'infrared camera', 'инфракрасная.*камера', 'ir camera', 'flir.*thermal', 'seek.*thermal', 'zenmuse.*xt', '640×512.*thermal', '320×240.*thermal', '384×288.*thermal', 'тепловизионный модуль', 'zt30.*thermal'] },

  // Radio & Control
  { category: 'transmitters', namePatterns: ['пульт.*управления', 'аппаратура.*управления', 'radio controller', 'rc transmitter', 'remote controller', 'передатчик.*управления', 'flysky.*transmitter', 'frsky.*transmitter', 'spektrum.*transmitter', 'futaba.*transmitter', 'radiomaster.*tx', 'jumper.*tx', 'taranis', 'q7.*transmitter', 'x9.*transmitter', 'x-lite', 'tx16s', 'tx12', 'zorro', 'boxer', 'paladin.*pl18', 'skydroid.*h30', 'siyi.*mk15', 'siyi.*mk32', 'dji.*rc ', 'dji.*rc$', 'rc-n3', 'rc pro', 'smart controller', 'elrs.*пульт', 'flysky.*paladin', 'flysky.*el18', 'bayckrc.*transmitter', 'влагозащищенный.*пульт', 'wsrc'] },
  { category: 'receivers', namePatterns: ['приемник.*управления', 'radio receiver', 'rc receiver', 'elrs.*receiver', 'frsky.*receiver', 'flysky.*receiver', 'dsmx.*receiver', 'dsm2.*receiver', 'r-xsr', 'xm+', 'r9.*receiver', 'r12.*receiver', 'ep1.*receiver', 'ep2.*receiver', 'er5a.*receiver', 'superd.*receiver', 'bp6s.*receiver', 'flywoo.*elrs.*receiver', 'tcxo.*elrs.*receiver', 'flywoo.*el24e', 'bayckrc.*pr\\d', 'bayckrc.*receiver'] },
  { category: 'controller-accessories', namePatterns: ['switch.*transmitter', 'gimbal.*transmitter', 'antenna.*transmitter', 'пульт.*аксессуар', 'стик.*пульта', 'держатель.*телефона.*пульт', 'трекер.*головы', 'head tracker', 'strap.*transmitter'] },
  { category: 'networking', namePatterns: ['сетевой.*коммутатор', 'ethernet switch', 'network switch', 'router', 'маршрутизатор', 'd-link.*switch', 'tp-link.*switch', 'mikrotik.*switch', 'ubiquiti.*switch', 'poe.*switch', 'l2.*switch', 'l3.*switch', 'des-', 'dgs-', 'коммутатор.*d-link', 'коммутатор.*tp-link', 'коммутатор'] },
  { category: 'radios', namePatterns: ['радиостанция', 'radio module', 'радиомодуль', 'радиомодем', 'ddlab.*radio', 'airborne radio', 'цифровая.*радиостанция', 'uhf radio', 'vhf radio', 'long range radio', 'data link', 'radio modem', 'wireless link', 'microhard.*radio', '20.*watt.*radio', 'watt.*airborne'] },

  // Airframe & Gimbals
  { category: 'frames', namePatterns: ['frame kit', 'рама.*квадрокоптера', 'каркас.*коптера', 'geprc.*frame', 'iflight.*frame', 'nazgul.*frame', 'tbs.*source.*frame', 'impulserc.*frame', 'armattan.*frame', 'diatone.*frame', 'xl5.*frame', 'xl7.*frame', 'xl10.*frame', '5.*inch.*frame', '7.*inch.*frame', '10.*inch.*frame', '13.*inch.*frame', 'луч.*рамы', 'arm.*frame.*part', 'cl20.*frame', 'cl25.*frame', 'flywoo.*frame', 'walksnail.*frame', 'beastfpv.*frame', 'gk-v4.*frame', 'рама.*квадрокоптера'] },
  { category: 'landing-gear', namePatterns: ['шасси.*для', 'landing gear', 'посадочное.*шасси', 'ноги.*для.*рамы', 'landing skid', 'опора.*шасси'] },
  { category: 'gimbals', namePatterns: ['камерный.*подвес', 'camera gimbal', '3-axis.*gimbal', 'трехосевой.*подвес', '2-axis.*gimbal', 'двухосевой.*подвес', 'gremsy.*gimbal', 'tarot.*gimbal', 'viewpro.*gimbal', 'siyi.*gimbal', 'zhiyun.*gimbal', 'ronin.*gimbal', 'zenmuse.*z15', 'zenmuse.*z30', 'zenmuse.*xt.*gimbal', 'гимбал', 'подвес.*камеры', 'tarot.*peeper', 'трехосевой.*gimbal', 'подвес.*с.*камерой'] },
  { category: 'gimbal-accessories', namePatterns: ['gimbal.*accessor', 'подвес.*аксессуар', 'damper.*gimbal', 'виброразвязка', 'виброподвес', 'gimbal.*mount', 'кронштейн.*подвеса', 'dual.*gimbal.*connector', 'площадка.*подвеса', 'adapter.*gimbal'] },

  // Payloads
  { category: 'payload-release', namePatterns: ['устройство.*сброса.*груза', 'payload release', 'механизм.*сброса', 'drop mechanism', 'thrower.*drone', 'захват.*груза', 'gripper.*drone', 'th4.*release', 'czi.*th', 'airdrop.*device'] },
  { category: 'lights', namePatterns: ['фара.*для.*дрона', 'прожектор.*для.*дрона', 'spotlight.*drone', 'strobe.*drone', 'маяк.*дрона', 'beacon.*drone', 'led.*light.*drone', 'ночная.*подсветка.*дрона', 'zenmuse.*s1', 'светодиодный.*прожектор'] },
  { category: 'speakers', namePatterns: ['громкоговоритель.*для.*дрона', 'speaker.*drone', 'мегафон.*дрона', 'megaphone.*drone', 'audio.*broadcast.*drone', 'zenmuse.*v1'] },
  { category: 'cases-bags', namePatterns: ['кейс.*для.*дрона', 'чехол.*для.*дрона', 'сумка.*для.*дрона', 'hard case.*drone', 'waterproof case.*drone', 'транспортировочный.*кейс', 'pelican.*case', 'nanuk.*case', 'peli.*case', 'рюкзак.*для.*дрона', 'backpack.*drone', 'рюкзак.*ф', 'ф1.*рюкзак'] },
  { category: 'memory-cards', namePatterns: ['microsd.*card', 'micro sd.*card', 'sd card.*\\d+gb', 'карта.*памяти.*\\d+gb', 'memory card.*\\d+gb', 'tf card.*\\d+gb', 'sdxc.*card', '128gb.*sd', '256gb.*sd', '512gb.*sd', '64gb.*sd', 'sandisk.*sd', 'samsung.*evo.*sd', 'lexar.*sd', 'kingston.*sd'] },
  { category: 'tools', namePatterns: ['отвертка.*для', 'screwdriver.*set', 'ключ.*для.*проп', 'wrench.*prop', 'паяльник.*для', 'soldering.*iron', 'кусачки.*для', 'nipper.*for', 'пинцет.*для', 'tweezers.*for', 'hex.*key.*set', 'балансир.*проп', 'prop.*balancer', 'мультиметр.*для', 'multimeter.*for', 'набор.*инструментов.*для'] },
  { category: 'cables-wires', namePatterns: ['кабель.*для.*дрона', 'провод.*для', 'cable.*for.*drone', 'wire.*for.*drone', 'usb.*cable.*dji', 'hdmi.*cable.*for', 'silicon.*wire', 'silicone.*wire', 'extension.*cable.*for', 'коаксиальный.*кабель', 'coaxial.*cable', 'antenna.*cable.*rg', 'rg316', 'rg58', 'шлейф.*для', 'ribbon cable', 'косичка.*для', 'шлейф.*ptz'] },
  { category: 'connectors', namePatterns: ['разъем.*для', 'connector.*for', 'штекер.*для', 'гнездо.*для', 'xt60.*connector', 'xt90.*connector', 'xt30.*connector', 'deans.*connector', 't-plug.*connector', 'ec3.*connector', 'ec5.*connector', 'jst.*connector', 'sh1.0.*connector', 'ph2.0.*connector', 'xh2.54.*connector', 'sma.*connector', 'mmcx.*connector', 'u.fl.*connector', 'ipex.*connector', 'banana plug', 'клемм.*connector', 'terminal block', 'db9.*connector', 'соединитель.*луча'] },
  { category: 'spare-parts', namePatterns: ['запчасти.*для', 'spare parts.*for', 'запасная часть.*для', 'part.*number.*for', 'оригинальная.*запчасть.*для', 'крышка.*для', 'корпус.*для', 'housing.*for', 'shell.*for', 'cover.*for', 'arm.*for.*matrice', 'leg.*for.*matrice', 'blade.*for.*matrice', 'пропеллер.*для.*matrice', 'пропеллер.*для.*mavic', 'соединитель.*луча', 'нога.*для', 'крышка.*для', 'площадка.*для', 'mounting.*plate.*for', 'дополнительный.*набор.*для', 'extra.*set.*for', 'запасная.*камера', 'запасной.*проп', 'док-?станция'] },
  { category: 'repair-kits', namePatterns: ['ремкомплект.*для', 'repair kit.*for', 'набор.*для.*ремонта', 'service kit.*for', 'mk-\\d+', 'kyocera.*mk'] },
  { category: 'electronic-modules', namePatterns: ['электронный.*модуль', 'electronic module', 'плата.*расширения', 'development board', 'отладочная.*плата', 'arduino.*board', 'esp32.*board', 'stm32.*board', 'dc-dc.*converter', 'dc/dc.*converter', 'step-down.*converter', 'step-up.*converter', 'buck.*converter', 'boost.*converter', 'fmc.*board', 'alinh.*fl', 'tof.*module.*vl', 'vl53l1x.*module', 'laser.*module.*дальномер', 'гальваническая развязка', 'inverter.*module', 'релейный.*модуль', 'инвертор', 'реле', 'преобразователь', 'converter', 'усилитель', 'amplifier', 'микрофон', 'клапан', 'насос', 'вентилятор', 'радиатор', 'buzzer', 'зуммер', 'кнопка', 'переключатель', 'плата.*fmc', 'board.*fmc', 'fmc.*interface'] },
  { category: 'chips-ics', namePatterns: ['интегральная.*схема', 'integrated circuit', 'микросхема', 'stm32f', 'atmega', 'процессор.*для', 'mcu.*chip', 'fpga.*chip', 'cpld.*chip', 'flash.*chip', 'ram.*chip', 'транзистор.*\\w+', 'диод.*\\w+', 'резистор.*набор', 'конденсатор.*набор', 'чип.*для', 'чип\s'] },
  { category: 'software', namePatterns: ['программное обеспечение', 'software license', 'лицензия.*на', 'прошивка.*для', 'firmware.*for', 'subscription.*for', 'подписка.*на', 'mission planner', 'qgroundcontrol', 'dji.*terra', 'dji.*pilot', 'pix4d.*license', 'drone deploy.*license'] },
  { category: 'robotics', namePatterns: ['робот.*собака', 'robot dog', 'quadruped.*robot', 'четырехногий.*робот', 'unitree.*go', 'unitree.*b[12]', 'гуманоид.*робот', 'humanoid.*robot', 'робот.*манипулятор', 'robot.*manipulator', 'актуатор.*робот', 'servo.*robot.*joint', 'роботизированная.*рука', 'arm b', 'arm 2', 'захват.*манипулятора', 'манипулятор.*для', 'захват.*для', 'кольцо.*захват', 'ковш.*захват', 'коготь.*захват'] },

  // Underwater accessories
  { category: 'sensors', namePatterns: ['сонар', 'sonar', 'эхолот', 'картплоттер', 'chartplotter', 'humminbird', 'garmin.*echomap', 'garmin.*striker', 'oculus.*m', 'mega 360'] },

  // Fallback
  { category: 'accessories', namePatterns: ['.*'] },
];

function classifyProduct(product) {
  const name = product.name?.en || product.name || '';
  const nameRu = product.name?.ru || '';
  const desc = product.description?.ru || product.description?.en || '';
  const fullText = name + ' ' + nameRu + ' ' + desc.substring(0, 3000);

  for (const rule of classificationRules) {
    if (matchesPatterns(fullText, rule.namePatterns)) {
      if (rule.mustBeDrone && !isDrone(name + ' ' + nameRu, desc)) {
        continue;
      }
      return rule.category;
    }
  }

  if (isDrone(name + ' ' + nameRu, desc)) {
    return 'consumer-drones';
  }
  return 'accessories';
}

// Reclassify
console.log('Reclassifying', products.length, 'products with v4...');
let categoryCounts = {};
let changed = 0;

// Map old category IDs to standard category IDs
const CATEGORY_ID_MAP = {
  'consumer-drones': 'drones-consumer',
  'professional-drones': 'drones-professional',
  'fpv-drones': 'drones-fpv',
  'racing-drones': 'drones-racing',
  'enterprise-drones': 'drones-enterprise',
  'industrial-drones': 'drones-industrial',
  'agricultural-drones': 'drones-agricultural',
  'military-drones': 'drones-military',
  'underwater-drones': 'drones-underwater',
  'toy-drones': 'drones-toys',
  'thermal-drones': 'drones-thermal',
  'propellers-2-blade': 'propellers-2blade',
  'propellers-3-blade': 'propellers-3blade',
};

products.forEach(p => {
  const oldCategory = p.primaryCategory;
  let newCategory = classifyProduct(p);
  // Apply ID mapping
  newCategory = CATEGORY_ID_MAP[newCategory] || newCategory;
  if (oldCategory !== newCategory) {
    p.primaryCategory = newCategory;
    changed++;
  }
  categoryCounts[newCategory] = (categoryCounts[newCategory] || 0) + 1;
});

console.log('Changed classification for', changed, 'products');
console.log('\n=== New category distribution ===');
Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`);
});

fs.writeFileSync(path.join(__dirname, 'enriched/products_enriched.json'), JSON.stringify(products), 'utf8');
console.log('\nSaved.');

// Verification
console.log('\n=== Key verification ===');
const checks = [
  { id: '4712', expected: 'drones-enterprise', name: 'Matrice 300 RTK' },
];
checks.forEach(c => {
  const p = products.find(x => x.id === c.id);
  if (p) console.log(`${c.name}: ${p.primaryCategory} (expected: ${c.expected}) ${p.primaryCategory === c.expected ? '✓' : '✗'}`);
});

// Show drone categories
console.log('\n=== Drone categories ===');
const droneCats = ['drones-consumer', 'drones-fpv', 'drones-racing', 'drones-professional', 'drones-enterprise', 'drones-industrial', 'drones-agricultural', 'drones-thermal', 'drones-military', 'drones-underwater', 'drones-toys'];
let totalDrones = 0;
droneCats.forEach(cat => {
  const items = products.filter(p => p.primaryCategory === cat);
  totalDrones += items.length;
  console.log(`  ${cat}: ${items.length}`);
  if (items.length > 0 && items.length < 20) {
    items.forEach(p => console.log('    -', p.name?.en?.substring(0, 60)));
  }
});
console.log(`  TOTAL DRONES: ${totalDrones}`);
console.log(`  TOTAL ACCESSORIES/PARTS: ${products.length - totalDrones}`);
