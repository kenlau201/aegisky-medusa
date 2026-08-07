const fs = require('fs');
const path = require('path');

// 52个标准分类
const STANDARD_CATEGORIES = {
  'quadcopters': '四旋翼机',
  'training-drones': '训练用无人机',
  'thermal-imaging-drones': '热成像无人机',
  'waterproof-drones': '防水无人机',
  'fpv-drones': 'FPV无人机',
  'russian-drones': '俄罗斯联邦无人机',
  'multirotors': '多旋翼机',
  'aerial-drones': '航空型无人机',
  'vtol-drones': '垂直起降无人机',
  'fixed-wing-drones': '固定翼无人机',
  'accessories': '配件',
  'robots': '机器人',
  'portable-power-stations': '便携式发电站',
  'solar-panels': '太阳能电池板',
  'underwater-drones': '水下无人机',
  'vehicles': '车辆',
  'drone-kits': '无人机组装套件',
  'counter-drones': '反无人机',
  'frames': '框架',
  'autopilots': '自动驾驶仪',
  'lidar': '激光雷达',
  'launch-pads': '发射台',
  'receivers': '接收器',
  'remote-radiometry': '远程辐射测量系统',
  'control-panels': '控制面板',
  'antennas': '天线',
  'motors': '电机',
  'servos': '舵机',
  'blades-propellers': '螺旋桨',
  'cameras-video': '摄像机',
  'machine-vision-cameras': '机器视觉摄像机',
  'spectrum-analyzers': '频谱分析仪',
  'fpv-integration': 'FPV积分',
  'esc-controllers': 'ESC电调',
  'lanterns': '灯光',
  'batteries': '电池',
  'charging-equipment': '充电设备',
  'rifle-scopes': '步枪瞄准镜',
  'thermal-scopes': '热成像瞄准镜',
  'tools': '工具',
  'microcomputers': '微型计算机',
  'chips': '芯片',
  'monitors': '监视器',
  'radio-stations': '广播电台',
  'gimbals': '云台',
  'thermal-cameras': '热成像相机',
  'carbon-materials': '碳材料',
  'rings': '环形',
  'network-equipment': '网络设备',
  'kyocera-repair-kits': '京瓷维修套件',
  'hosts': '主机',
  'other': '其他'
};

// 俄文关键词映射规则（按优先级排序）
const MAPPING_RULES = [
  { keywords: ['квадрокоптер'], category: 'quadcopters' },
  { keywords: ['обучающ', 'трениров'], category: 'training-drones' },
  { keywords: ['тепловизор', 'тепловизион'], category: 'thermal-imaging-drones' },
  { keywords: ['водонепроницаем', 'водный'], category: 'waterproof-drones' },
  { keywords: ['fpv'], category: 'fpv-drones' },
  { keywords: ['дрон рф', 'производств рф', 'российск', 'военн'], category: 'russian-drones' },
  { keywords: ['мультиротор'], category: 'multirotors' },
  { keywords: ['авиацион', 'самолет', 'беспилотник самолет'], category: 'aerial-drones' },
  { keywords: ['vtol', 'вертикальн взлет'], category: 'vtol-drones' },
  { keywords: ['фиксированн крыл'], category: 'fixed-wing-drones' },
  { keywords: ['робот'], category: 'robots' },
  { keywords: ['электростанц', 'портативн станц'], category: 'portable-power-stations' },
  { keywords: ['солнечн панел'], category: 'solar-panels' },
  { keywords: ['подводн'], category: 'underwater-drones' },
  { keywords: ['автомобил', 'транспорт', 'машинк'], category: 'vehicles' },
  { keywords: ['набор для сбор', 'кит', 'kit'], category: 'drone-kits' },
  { keywords: ['противодрон', 'антидрон'], category: 'counter-drones' },
  { keywords: ['рам', 'корпус'], category: 'frames' },
  { keywords: ['автопилот', 'полетн контроллер', 'pixhawk', 'matek'], category: 'autopilots' },
  { keywords: ['лидар', 'lidar'], category: 'lidar' },
  { keywords: ['стартов площадк', 'launch'], category: 'launch-pads' },
  { keywords: ['приемник'], category: 'receivers' },
  { keywords: ['радиометр'], category: 'remote-radiometry' },
  { keywords: ['пульт управлен', 'консоль', 'приставк'], category: 'control-panels' },
  { keywords: ['антенн', 'передатчик'], category: 'antennas' },
  { keywords: ['мотор', 'двигател'], category: 'motors' },
  { keywords: ['сервопривод', 'серво'], category: 'servos' },
  { keywords: ['пропеллер', 'лопаст'], category: 'blades-propellers' },
  { keywords: ['машин зрени'], category: 'machine-vision-cameras' },
  { keywords: ['камер', 'видео'], category: 'cameras-video' },
  { keywords: ['анализатор спектр'], category: 'spectrum-analyzers' },
  { keywords: ['fpv интеграц', 'fpv комплектующ'], category: 'fpv-integration' },
  { keywords: ['esc', 'регулятор скорост'], category: 'esc-controllers' },
  { keywords: ['фонар', 'мультифонар', 'свет'], category: 'lanterns' },
  { keywords: ['аккумулятор', 'батаре', 'акб', 'lihv', 'lipo'], category: 'batteries' },
  { keywords: ['зарядн устройств', 'зарядк'], category: 'charging-equipment' },
  { keywords: ['прицел стрелков'], category: 'rifle-scopes' },
  { keywords: ['теплов прицел'], category: 'thermal-scopes' },
  { keywords: ['инструмент'], category: 'tools' },
  { keywords: ['raspberry pi', 'orange pi', 'микрокомпьютер', 'радха', 'radxa'], category: 'microcomputers' },
  { keywords: ['чип', 'микросхем'], category: 'chips' },
  { keywords: ['монитор', 'экран'], category: 'monitors' },
  { keywords: ['радиостанц', 'baofeng', 'рация', 'аргут'], category: 'radio-stations' },
  { keywords: ['подвес', 'стабилизатор', 'gimbal'], category: 'gimbals' },
  { keywords: ['теплов камер'], category: 'thermal-cameras' },
  { keywords: ['карбон', 'углерод'], category: 'carbon-materials' },
  { keywords: ['кольц'], category: 'rings' },
  { keywords: ['сетев оборудован', 'роутер', 'wi-fi', 'wifi'], category: 'network-equipment' },
  { keywords: ['ремкомплект kyocera', 'kyocera'], category: 'kyocera-repair-kits' },
  { keywords: ['хост', 'mainframe'], category: 'hosts' },
  { keywords: ['аксессуар', 'сумк', 'кейс', 'запчаст'], category: 'accessories' },
];

// 读取源分类
const sourceCategories = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../data/source-categories.json'), 'utf8'
));

const result = {};
const unmapped = [];
let mappedCount = 0;

sourceCategories.forEach(cat => {
  const name = cat.name.toLowerCase();
  let matched = 'other';
  
  for (const rule of MAPPING_RULES) {
    if (rule.keywords.some(kw => name.includes(kw))) {
      matched = rule.category;
      break;
    }
  }
  
  result[cat.id] = matched;
  if (matched !== 'other') {
    mappedCount += cat.count;
  } else {
    unmapped.push(cat);
  }
});

// 统计
const stats = {};
sourceCategories.forEach(cat => {
  const std = result[cat.id];
  if (!stats[std]) stats[std] = 0;
  stats[std] += cat.count;
});

console.log('=== 分类映射统计 ===');
console.log('源分类总数:', sourceCategories.length);
console.log('已映射商品数:', mappedCount);
console.log('其他分类商品数:', 6384 - mappedCount);
console.log('');
console.log('各分类商品数:');
Object.entries(stats).sort((a,b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(STANDARD_CATEGORIES[cat].padEnd(20), count);
});

console.log('\n未映射的分类（前50个）:');
unmapped.slice(0, 50).forEach(c => console.log(c.id + ': ' + c.name + ' count=' + c.count));

// 保存映射表
fs.writeFileSync(
  path.join(__dirname, '../data/category-map.json'),
  JSON.stringify(result, null, 2)
);
console.log('\n映射表已保存到 category-map.json');
