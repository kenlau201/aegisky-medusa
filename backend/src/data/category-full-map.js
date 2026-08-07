/**
 * 完整分类映射表 - 基于俄文关键词
 * 覆盖1033个原始分类，目标：其他分类仅保留源网站прочее下的5个商品
 */
module.exports = {
  // 品牌主营产品映射（品牌名 -> 分类slug）
  brandCategoryMap: {
    // 电机品牌
    't-motor': 'motors', 't motor': 'motors', 'brotherhobby': 'motors', 'sunnysky': 'motors',
    'mad': 'motors', 'flashhobby': 'motors', 'emax': 'motors', 'happymodel': 'motors',
    'flycolor': 'motors', 'racerstar': 'motors', 'dys': 'motors', 'ldarc': 'motors',
    'xnova': 'motors', 'scorpion': 'motors', 'hackermotor': 'motors', 'dualsky': 'motors',
    'maxon': 'motors', 'faulhaber': 'motors',
    
    // ESC电调品牌
    'hobbywing': 'esc-controllers', 'fatjay': 'esc-controllers', 'castle': 'esc-controllers',
    'yep': 'esc-controllers', 'flycolor': 'esc-controllers', 'racerstar': 'esc-controllers',
    'blheli': 'esc-controllers', 't-motor esc': 'esc-controllers',
    
    // 电池品牌
    'gnb': 'batteries', 'tattu': 'batteries', 'cnhl': 'batteries', 'gens ace': 'batteries',
    'turnigy': 'batteries', 'zippy': 'batteries', 'rhino': 'batteries', 'nanotech': 'batteries',
    'lumenier': 'batteries', 'dinogy': 'batteries', 'multistar': 'batteries', 'fullymax': 'batteries',
    
    // 充电设备品牌
    'skyrc': 'charging-equipment', 'isdt': 'charging-equipment', 'toolkitrc': 'charging-equipment',
    'htrc': 'charging-equipment', 'ultrapower': 'charging-equipment', 'imax': 'charging-equipment',
    'b6': 'charging-equipment', 'icharger': 'charging-equipment', 'revolectrix': 'charging-equipment',
    'mylipo': 'charging-equipment', 'ev-peak': 'charging-equipment',
    
    // 舵机品牌
    'kst': 'servos', 'jx': 'servos', 'savox': 'servos', 'feetech': 'servos', 'hitec': 'servos',
    'futaba': 'servos', 'spektrum': 'servos', 'bluebird': 'servos', 'powerhd': 'servos',
    'mks': 'servos', 'align': 'servos', 'jr': 'servos', 'graupner': 'servos',
    
    // 接收机/遥控器品牌
    'frsky': 'receivers', 'flysky': 'receivers', 'radiomaster': 'receivers', 'jumper': 'receivers',
    'spektrum': 'receivers', 'futaba': 'receivers', 'graupner': 'receivers', 'jr': 'receivers',
    'hitec': 'receivers', 'walkera': 'receivers', 'wfly': 'receivers', ' radiolink': 'receivers',
    'dsmx': 'receivers', 'dsm2': 'receivers', 'tbs': 'receivers', 'team blacksheep': 'receivers',
    
    // FPV无人机品牌
    'geprc': 'fpv-drones', 'iflight': 'fpv-drones', 'betafpv': 'fpv-drones', 'hglrc': 'fpv-drones',
    'rushfpv': 'fpv-drones', 'emax': 'fpv-drones', 'diatone': 'fpv-drones', 'armattan': 'fpv-drones',
    'impulserc': 'fpv-drones', 'lumenier': 'fpv-drones', 'tbs': 'fpv-drones', 'dji fpv': 'fpv-drones',
    'walkera': 'fpv-drones', 'eachine': 'fpv-drones', 'eachine': 'fpv-drones', 'toothpick': 'fpv-drones',
    'tinywhoop': 'fpv-drones', 'cinelog': 'fpv-drones', 'nazgul': 'fpv-drones', 'chimera': 'fpv-drones',
    
    // 四旋翼/无人机品牌
    'dji': 'quadcopters', 'syma': 'quadcopters', 'mjx': 'quadcopters', 'hubsan': 'quadcopters',
    'parrot': 'quadcopters', 'yuneec': 'quadcopters', 'autel': 'quadcopters', '3dr': 'quadcopters',
    'cheerson': 'quadcopters', 'jjrc': 'quadcopters', 'eachine': 'quadcopters', 'holy stone': 'quadcopters',
    'potensic': 'quadcopters', 'ryze': 'quadcopters', 'tellofpv': 'quadcopters', 'mavic': 'quadcopters',
    'phantom': 'quadcopters', 'inspire': 'quadcopters', 'matrice': 'quadcopters', 'spark': 'quadcopters',
    'air': 'quadcopters', 'mini': 'quadcopters', 'fimi': 'quadcopters', 'xiaomi': 'quadcopters',
    
    // 摄像机/图传品牌
    'caddx': 'cameras-video', 'akk': 'cameras-video', 'runcam': 'cameras-video', 'foxeer': 'cameras-video',
    'gopro': 'cameras-video', 'dji camera': 'cameras-video', 'insta360': 'cameras-video',
    'sjcam': 'cameras-video', 'xiaoyi': 'cameras-video', 'yi': 'cameras-video', 'mobius': 'cameras-video',
    'tbs': 'cameras-video', 'fatshark': 'cameras-video', 'skyzone': 'cameras-video', 'eachine': 'cameras-video',
    
    // 灯光/手电筒品牌
    'armytek': 'lanterns', 'nitecore': 'lanterns', 'fenix': 'lanterns', 'olight': 'lanterns',
    'thrunite': 'lanterns', ' convoy': 'lanterns', 'sofirn': 'lanterns', 'wuben': 'lanterns',
    'lumintop': 'lanterns', 'fireflies': 'lanterns', 'emisar': 'lanterns', 'noctigon': 'lanterns',
    
    // 微型计算机
    'raspberry pi': 'microcomputers', 'raspberrypi': 'microcomputers', 'orange pi': 'microcomputers',
    'orangepi': 'microcomputers', 'radxa': 'microcomputers', 'rock pi': 'microcomputers',
    'khadas': 'microcomputers', 'odroid': 'microcomputers', 'beaglebone': 'microcomputers',
    'arduino': 'microcomputers', 'esp32': 'microcomputers', 'stm32': 'microcomputers',
    
    // 便携式发电站
    'ecoflow': 'portable-power-stations', 'bluetti': 'portable-power-stations', 'jackery': 'portable-power-stations',
    'anker': 'portable-power-stations', 'goal zero': 'portable-power-stations', 'maxoak': 'portable-power-stations',
    'suaoki': 'portable-power-stations', 'rockpals': 'portable-power-stations',
    
    // 水下无人机
    'fifish': 'underwater-drones', 'qysea': 'underwater-drones', 'chasing': 'underwater-drones',
    'gladius': 'underwater-drones', 'powerray': 'underwater-drones', 'bluefin': 'underwater-drones',
    'deep trekker': 'underwater-drones', 'outland': 'underwater-drones',
    
    // 飞控/自动驾驶仪
    'holybro': 'autopilots', 'mateksys': 'autopilots', 'matek': 'autopilots', 'pixhawk': 'autopilots',
    'px4': 'autopilots', 'ardupilot': 'autopilots', 'cube': 'autopilots', 'hex': 'autopilots',
    'proficnc': 'autopilots', 'mRo': 'autopilots', 'omnibus': 'autopilots', 'betaflight': 'autopilots',
    'inav': 'autopilots', 'kiss': 'autopilots', 'naze32': 'autopilots', 'f3': 'autopilots', 'f4': 'autopilots',
    'f7': 'autopilots', 'h7': 'autopilots', 'geprc autopilot': 'autopilots',
    
    // 广播电台
    'baofeng': 'radio-stations', 'аргут': 'radio-stations', 'lira': 'radio-stations', 'kenwood': 'radio-stations',
    'motorola': 'radio-stations', 'icom': 'radio-stations', 'yaesu': 'radio-stations', 'vertex': 'radio-stations',
    'hytera': 'radio-stations', 'tait': 'radio-stations', 'midland': 'radio-stations', 'cobra': 'radio-stations',
    'uniden': 'radio-stations', 'whistler': 'radio-stations', 'retevis': 'radio-stations', 'radioddity': 'radio-stations',
    
    // 机架
    'geprc frame': 'frames', 'iflight frame': 'frames', 'armattan': 'frames', 'impulserc': 'frames',
    'lumenier': 'frames', 'diatone': 'frames', 'betafpv': 'frames', 'hglrc': 'frames', 'emax': 'frames',
    'qav': 'frames', 'zmr': 'frames', 'martian': 'frames', 'source one': 'frames', 'tbs source one': 'frames',
  },

  // 俄文关键词映射（关键词 -> 分类slug）
  keywordMap: {
    // 螺旋桨
    'пропеллер': 'blades-propellers', 'пропел': 'blades-propellers', 'лопаст': 'blades-propellers',
    'винт': 'blades-propellers', 'проп': 'blades-propellers', 'propeller': 'blades-propellers',
    'blade': 'blades-propellers', 'prop': 'blades-propellers',
    
    // 摄像机/视频
    'камер': 'cameras-video', 'видео': 'cameras-video', 'видеопередатчик': 'cameras-video',
    'видеоприемник': 'cameras-video', 'камера': 'cameras-video', 'объектив': 'cameras-video',
    'фото': 'cameras-video', 'caddx': 'cameras-video', 'runcam': 'cameras-video', 'foxeer': 'cameras-video',
    'gopro': 'cameras-video', 'insta360': 'cameras-video', 'fpv камера': 'cameras-video',
    'камера fpv': 'cameras-video', 'hd камера': 'cameras-video', 'экшн-камера': 'cameras-video',
    'action camera': 'cameras-video', 'transmitter': 'cameras-video', 'vtx': 'cameras-video',
    'vrx': 'cameras-video', 'антенна для видео': 'cameras-video',
    
    // 电机
    'мотор': 'motors', 'двигател': 'motors', 'электродвигател': 'motors', 'motor': 'motors',
    'brushless': 'motors', 'бесщеточ': 'motors', 'коллекторн': 'motors', 'моторчик': 'motors',
    't-motor': 'motors', 'brotherhobby': 'motors', 'sunnysky': 'motors', 'mad': 'motors',
    'flashhobby': 'motors', 'emax мотор': 'motors',
    
    // ESC电调
    'esc': 'esc-controllers', 'регулятор скорост': 'esc-controllers', 'регулятор хода': 'esc-controllers',
    'регуль': 'esc-controllers', 'контроллер скорост': 'esc-controllers', 'speed controller': 'esc-controllers',
    'blheli': 'esc-controllers', 'hobbywing': 'esc-controllers', 'fatjay': 'esc-controllers',
    
    // 电池
    'аккумулятор': 'batteries', 'батаре': 'batteries', 'li-po': 'batteries', 'lipo': 'batteries',
    'li-ion': 'batteries', 'liion': 'batteries', 'life': 'batteries', 'литий': 'batteries',
    'акб': 'batteries', 'аккум': 'batteries', 'батарейк': 'batteries', 'battery': 'batteries',
    '1s': 'batteries', '2s': 'batteries', '3s': 'batteries', '4s': 'batteries', '5s': 'batteries',
    '6s': 'batteries', 'gnb': 'batteries', 'tattu': 'batteries', 'cnhl': 'batteries',
    
    // 充电设备
    'зарядн': 'charging-equipment', 'зарядка': 'charging-equipment', 'зарядное': 'charging-equipment',
    'зарядное устройство': 'charging-equipment', 'балансир': 'charging-equipment', 'charger': 'charging-equipment',
    'балансировочн': 'charging-equipment', 'skyrc': 'charging-equipment', 'isdt': 'charging-equipment',
    'toolkitrc': 'charging-equipment', 'htrc': 'charging-equipment', 'imax': 'charging-equipment',
    'b6': 'charging-equipment', 'блок питания': 'charging-equipment', 'power supply': 'charging-equipment',
    
    // 舵机
    'сервопривод': 'servos', 'серв': 'servos', 'серва': 'servos', 'servo': 'servos',
    'kst': 'servos', 'jx': 'servos', 'savox': 'servos', 'feetech': 'servos', 'hitec серво': 'servos',
    
    // 接收机/遥控器
    'приемник': 'receivers', 'приёмник': 'receivers', 'rx': 'receivers', 'receiver': 'receivers',
    'frsky': 'receivers', 'flysky': 'receivers', 'radiomaster': 'receivers', 'dsmx': 'receivers',
    'dsm2': 'receivers', 'телеметрия': 'receivers',
    
    // 控制面板/遥控器
    'пульт': 'control-panels', 'управлен': 'control-panels', 'контроллер полета': 'control-panels',
    'пульт управлен': 'control-panels', 'аппаратура': 'control-panels', 'transmitter': 'control-panels',
    'tx': 'control-panels', 'radio': 'control-panels', 'радиоуправлен': 'control-panels',
    'radiomaster пульт': 'control-panels', 'jumper': 'control-panels',
    
    // 天线
    'антенн': 'antennas', 'antenna': 'antennas', 'антенка': 'antennas',
    
    // 飞控/自动驾驶仪
    'автопилот': 'autopilots', 'полетн контроллер': 'autopilots', 'полетник': 'autopilots',
    'контроллер полета': 'autopilots', 'flight controller': 'autopilots', 'fc': 'autopilots',
    'pixhawk': 'autopilots', 'px4': 'autopilots', 'ardupilot': 'autopilots', 'cube': 'autopilots',
    'matek': 'autopilots', 'holybro': 'autopilots', 'inav': 'autopilots', 'betaflight': 'autopilots',
    'f3': 'autopilots', 'f4': 'autopilots', 'f7': 'autopilots', 'h7': 'autopilots', 'kiss': 'autopilots',
    'naze32': 'autopilots', 'omnibus': 'autopilots',
    
    // 机架
    'рам': 'frames', 'каркас': 'frames', 'рама': 'frames', 'frame': 'frames', 'шасси': 'frames',
    'корпус': 'frames', 'крепление рамы': 'frames', 'qav': 'frames', 'zmr': 'frames', 'martian': 'frames',
    
    // 显示器
    'монитор': 'monitors', 'дисплей': 'monitors', 'экран': 'monitors', 'monitor': 'monitors',
    'дисплей': 'monitors', 'fpv монитор': 'monitors', 'hdtv': 'monitors', 'hdmi монитор': 'monitors',
    
    // 广播电台
    'радиостанц': 'radio-stations', 'рация': 'radio-stations', 'walkie-talkie': 'radio-stations',
    'двухсторонн': 'radio-stations', 'baofeng': 'radio-stations', 'аргут': 'radio-stations',
    'kenwood': 'radio-stations', 'motorola': 'radio-stations', 'yaesu': 'radio-stations',
    'icom': 'radio-stations', 'hytera': 'radio-stations', 'retevis': 'radio-stations',
    'радиостанция': 'radio-stations',
    
    // 芯片/电子元件
    'чип': 'chips', 'микросхем': 'chips', 'резистор': 'chips', 'конденсатор': 'chips',
    'транзистор': 'chips', 'диод': 'chips', 'микроконтроллер': 'chips', 'mcu': 'chips',
    'stm32': 'chips', 'esp32': 'chips', 'arduino': 'chips', 'raspberry pi': 'chips',
    'плата': 'chips', 'печатная плата': 'chips', 'pcb': 'chips', 'smd': 'chips',
    'электронный компонент': 'chips', 'чипсет': 'chips', 'процессор': 'chips',
    
    // 微型计算机
    'микрокомпьютер': 'microcomputers', 'raspberry': 'microcomputers', 'orange pi': 'microcomputers',
    'radxa': 'microcomputers', 'rock pi': 'microcomputers', 'khadas': 'microcomputers',
    'odroid': 'microcomputers', 'beaglebone': 'microcomputers', 'одноплатн': 'microcomputers',
    'single board': 'microcomputers', 'sbc': 'microcomputers',
    
    // 配件
    'аксессуар': 'accessories', 'запчаст': 'accessories', 'дополнительн': 'accessories',
    'модул': 'accessories', 'запчасть': 'accessories', 'комплектующ': 'accessories',
    'крепеж': 'accessories', 'винтик': 'accessories', 'болт': 'accessories', 'гайка': 'accessories',
    'шуруп': 'accessories', 'хомут': 'accessories', 'стяжка': 'accessories', 'липучка': 'accessories',
    'адаптер': 'accessories', 'переходник': 'accessories', 'разъем': 'accessories', 'штекер': 'accessories',
    'гнездо': 'accessories', 'вилка': 'accessories', 'кабель': 'accessories', 'провод': 'accessories',
    'шнур': 'accessories', 'удлинитель': 'accessories', 'разветвитель': 'accessories',
    'защита': 'accessories', 'чехол': 'accessories', 'кейс': 'accessories', 'сумка': 'accessories',
    'ремень': 'accessories', 'подвес': 'accessories', 'держатель': 'accessories', 'кронштейн': 'accessories',
    'стойка': 'accessories', 'ножка': 'accessories', 'колпачок': 'accessories', 'заглушка': 'accessories',
    'наклейка': 'accessories', 'стикер': 'accessories', 'инструмент': 'accessories',
    'ключ': 'accessories', 'отвертка': 'accessories', 'пассатижи': 'accessories', 'кусачки': 'accessories',
    'паяльник': 'accessories', 'флюс': 'accessories', 'припой': 'accessories', 'термоусадка': 'accessories',
    'изолента': 'accessories', 'скотч': 'accessories', 'zip-tie': 'accessories', 'other': 'accessories',
    'другие производители': 'accessories', 'copterparts': 'accessories', 'электричеств': 'accessories',
    'электроник': 'accessories', 'электрон': 'accessories', 'питание': 'accessories',
    'преобразователь': 'accessories', 'стабилизатор': 'accessories', 'инвертор': 'accessories',
    'реле': 'accessories', 'предохранитель': 'accessories', 'выключатель': 'accessories',
    'кнопка': 'accessories', 'переключатель': 'accessories', 'тумблер': 'accessories',
    'светодиод': 'accessories', 'led': 'accessories', 'индикатор': 'accessories',
    
    // 水下无人机
    'подводн': 'underwater-drones', 'fifish': 'underwater-drones', 'qysea': 'underwater-drones',
    'chasing': 'underwater-drones', 'gladius': 'underwater-drones', 'rov': 'underwater-drones',
    'подводный дрон': 'underwater-drones', 'подводный аппарат': 'underwater-drones',
    
    // 俄罗斯无人机
    'рф': 'russian-drones', 'российск': 'russian-drones', 'военн': 'russian-drones',
    'производств': 'russian-drones', 'дроны рф': 'russian-drones', 'русский': 'russian-drones',
    'отечествен': 'russian-drones', 'спецоперац': 'russian-drones', 'сво': 'russian-drones',
    
    // 四旋翼
    'квадрокоптер': 'quadcopters', 'квадрик': 'quadcopters', 'quadcopter': 'quadcopters',
    'дрон с камерой': 'quadcopters', 'для предприятий': 'quadcopters', 'промышлен': 'quadcopters',
    'профессиональн': 'quadcopters', 'dji': 'quadcopters', 'mavic': 'quadcopters',
    'phantom': 'quadcopters', 'inspire': 'quadcopters', 'matrice': 'quadcopters', 'syma': 'quadcopters',
    'mjx': 'quadcopters', 'hubsan': 'quadcopters', 'parrot': 'quadcopters', 'yuneec': 'quadcopters',
    'autel': 'quadcopters', 'fimi': 'quadcopters', 'xiaomi': 'quadcopters', 'potensic': 'quadcopters',
    'ryze': 'quadcopters', 'tellо': 'quadcopters', 'дрон': 'quadcopters', 'коптер': 'quadcopters',
    'беспилотник': 'quadcopters', 'uav': 'quadcopters', 'drone': 'quadcopters',
    
    // 热成像
    'тепловиз': 'thermal-imaging-drones', 'тепловизион': 'thermal-imaging-drones',
    'дрон с тепловизором': 'thermal-imaging-drones', 'thermal': 'thermal-imaging-drones',
    'flir': 'thermal-imaging-drones', 'тепловизионная камера': 'thermal-cameras',
    
    // 训练无人机
    'обучающ': 'training-drones', 'тренировоч': 'training-drones', 'учебн': 'training-drones',
    'для начинающ': 'training-drones', 'обучение': 'training-drones', 'тренажер': 'training-drones',
    'симулятор': 'training-drones',
    
    // 京瓷维修套件
    'kyocera': 'kyocera-repair-kits', 'ремкомплект': 'kyocera-repair-kits',
    'ремкомплект kyocera': 'kyocera-repair-kits',
    
    // 频谱分析仪
    'анализатор спектра': 'spectrum-analyzers', 'спектроанализатор': 'spectrum-analyzers',
    'spectrum analyzer': 'spectrum-analyzers', 'анализатор частот': 'spectrum-analyzers',
    
    // 反无人机
    'противодрон': 'counter-drones', 'антидрон': 'counter-drones', 'глушилка': 'counter-drones',
    'подавитель': 'counter-drones', 'counter-drone': 'counter-drones', 'anti-drone': 'counter-drones',
    'против беспилотник': 'counter-drones', 'ружье': 'counter-drones',
    
    // 便携式发电站
    'электростанц': 'portable-power-stations', 'портативная электростанция': 'portable-power-stations',
    'power station': 'portable-power-stations', 'ecoflow': 'portable-power-stations',
    'bluetti': 'portable-power-stations', 'jackery': 'portable-power-stations',
    'генератор': 'portable-power-stations', 'солнечная': 'solar-panels', 'солнечн': 'solar-panels',
    'solar panel': 'solar-panels', 'панель солнечн': 'solar-panels',
    
    // 云台
    'подвес': 'gimbals', 'стабилизатор': 'gimbals', 'gimbal': 'gimbals', 'стаб': 'gimbals',
    'подвес камеры': 'gimbals', '3-осевой': 'gimbals', '3-axis': 'gimbals',
    
    // 灯光
    'фонар': 'lanterns', 'фонарь': 'lanterns', 'фонарик': 'lanterns', 'светильник': 'lanterns',
    'лампа': 'lanterns', 'лампочка': 'lanterns', 'led фонарь': 'lanterns', 'armytek': 'lanterns',
    'nitecore': 'lanterns', 'fenix': 'lanterns', 'olight': 'lanterns', 'multifonar': 'lanterns',
    'мультифонар': 'lanterns', 'свет': 'lanterns', 'подсветка': 'lanterns', 'прожектор': 'lanterns',
    
    // FPV眼镜
    'fpv очки': 'fpv-goggles', 'fpv шлем': 'fpv-goggles', 'fatshark': 'fpv-goggles',
    'skyzone': 'fpv-goggles', 'orqa': 'fpv-goggles', 'видеошлем': 'fpv-goggles',
    'видеоочки': 'fpv-goggles', 'goggle': 'fpv-goggles', 'очки': 'fpv-goggles',
    'шлем': 'fpv-goggles',
    
    // 玩具/游戏
    'игрушк': 'other', 'игров': 'hosts', 'консоль': 'hosts', 'приставка': 'hosts',
    'game': 'hosts', 'playstation': 'hosts', 'xbox': 'hosts', 'nintendo': 'hosts',
    
    // 网络设备
    'сетев': 'network-equipment', 'роутер': 'network-equipment', 'маршрутизатор': 'network-equipment',
    'коммутатор': 'network-equipment', 'switch': 'network-equipment', 'router': 'network-equipment',
    'wifi': 'network-equipment', 'wi-fi': 'network-equipment', 'bluetooth': 'network-equipment',
    'модем': 'network-equipment', 'точка доступа': 'network-equipment', 'access point': 'network-equipment',
    'сетевая карта': 'network-equipment', 'ethernet': 'network-equipment',
    
    // 工具
    'инструмент': 'tools', 'tool': 'tools', 'отвертка': 'tools', 'ключ': 'tools',
    'пассатижи': 'tools', 'кусачки': 'tools', 'пинцет': 'tools', 'нож': 'tools',
    'ножницы': 'tools', 'молоток': 'tools', 'напильник': 'tools', 'надфиль': 'tools',
    'тиски': 'tools', 'струбцина': 'tools', 'измерительн': 'tools', 'мультиметр': 'tools',
    'тестер': 'tools', 'штангенциркуль': 'tools', 'микрометр': 'tools', 'уровень': 'tools',
    
    // 碳材料
    'углеродн': 'carbon-materials', 'карбон': 'carbon-materials', 'carbon': 'carbon-materials',
    'углепластик': 'carbon-materials', 'карбонов': 'carbon-materials',
    
    // 排线/软排线
    'шлейф': 'flat-cables', 'flat cable': 'flat-cables', 'ribbon cable': 'flat-cables',
    'fpc': 'flat-cables', 'ffc': 'flat-cables', 'гибкий кабель': 'flat-cables',
    
    // 主机
    'хост': 'hosts', 'host': 'hosts', 'сервер': 'hosts', 'server': 'hosts',
    'компьютер': 'hosts', 'пк': 'hosts', 'pc': 'hosts', 'ноутбук': 'hosts',
    
    // 瞄准镜
    'прицел': 'rifle-scopes', 'оптический прицел': 'rifle-scopes', 'коллиматор': 'rifle-scopes',
    'red dot': 'rifle-scopes', 'голографический': 'rifle-scopes', 'оптика': 'rifle-scopes',
    'тепловизионный прицел': 'thermal-scopes', 'thermal scope': 'thermal-scopes',
    
    // 机器人
    'робот': 'robots', 'robot': 'robots', 'робототехник': 'robots', 'гуманоид': 'robots',
    
    // 车辆
    'автомобил': 'vehicles', 'машин': 'vehicles', 'car': 'vehicles', 'танк': 'vehicles',
    'грузовик': 'vehicles', 'вездеход': 'vehicles', 'внедорожник': 'vehicles',
    
    // 无人机套件
    'набор': 'drone-kits', 'кит': 'drone-kits', 'kit': 'drone-kits', 'комплект для сборки': 'drone-kits',
    'сборочный набор': 'drone-kits', 'diy': 'drone-kits', 'собери сам': 'drone-kits',
    
    // 固定翼/VTOL/多旋翼
    'самолет': 'fixed-wing-drones', 'fixed wing': 'fixed-wing-drones', 'планер': 'fixed-wing-drones',
    'крыло': 'fixed-wing-drones', 'vtol': 'vtol-drones', 'вертикальный взлет': 'vtol-drones',
    'мультиротор': 'multirotors', 'multirotor': 'multirotors', 'гексакоптер': 'multirotors',
    'октокоптер': 'multirotors', 'трикоптер': 'multirotors', 'аэродрон': 'aerial-drones',
    'авиационн': 'aerial-drones', 'аэро': 'aerial-drones',
    
    // 激光雷达
    'лидар': 'lidar', 'lidar': 'lidar', 'лазерный дальномер': 'lidar', 'лазерное сканирование': 'lidar',
    
    // 发射台
    'пусковой': 'launch-pads', 'стартовый': 'launch-pads', 'launch pad': 'launch-pads',
    'катапульта': 'launch-pads', 'взлетная площадка': 'launch-pads',
    
    // 辐射测量
    'радиометр': 'remote-radiometry', 'дозиметр': 'remote-radiometry', 'радиацион': 'remote-radiometry',
    'гейгер': 'remote-radiometry', 'счетчик гейгера': 'remote-radiometry',
    
    // 防水无人机
    'водонепроницаем': 'waterproof-drones', 'водный дрон': 'waterproof-drones',
    'плавающ': 'waterproof-drones', 'waterproof': 'waterproof-drones', 'амфибия': 'waterproof-drones',
    
    // 热成像相机
    'тепловая камера': 'thermal-cameras', 'тепловизионная камера': 'thermal-cameras',
    'thermal camera': 'thermal-cameras', 'flir камера': 'thermal-cameras',
    
    // 机器视觉
    'машинное зрение': 'machine-vision-cameras', 'machine vision': 'machine-vision-cameras',
    'компьютерное зрение': 'machine-vision-cameras', 'распознавание образов': 'machine-vision-cameras',
  }
}
