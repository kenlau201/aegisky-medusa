import { languages, defaultLanguage, LanguageCode, translateRussianToEnglish, translateRussianHtml } from './config'

// Import locale files
import en from './locales/en'
import ru from './locales/ru'
import zh from './locales/zh'
import ja from './locales/ja'
import de from './locales/de'
import pl from './locales/pl'
import ar from './locales/ar'
import ur from './locales/ur'
import id from './locales/id'
import kk from './locales/kk'
import da from './locales/da'
import sr from './locales/sr'
import fr from './locales/fr'
import es from './locales/es'

// All translations
const translations: Record<LanguageCode, any> = {
  en,
  ru,
  zh,
  ja,
  de,
  pl,
  ar,
  ur,
  id,
  kk,
  da,
  sr,
  fr,
  es,
}

export { languages, defaultLanguage }
export type { LanguageCode }

// Get translation by key path (e.g. "nav.home")
export function t(lang: LanguageCode, key: string, params?: Record<string, string | number>): string {
  const locale = translations[lang] || translations[defaultLanguage]
  const keys = key.split('.')
  let value: any = locale

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      // Fallback to English
      let fallback: any = translations[defaultLanguage]
      for (const fk of keys) {
        if (fallback && typeof fallback === 'object' && fk in fallback) {
          fallback = fallback[fk]
        } else {
          return key
        }
      }
      value = fallback
      break
    }
  }

  if (typeof value !== 'string') return key

  // Replace parameters
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
    })
  }

  return value
}

// ============================================================
// English → Chinese professional dictionary (drone/B2B industry)
// ============================================================
const enZhDictionary: Record<string, string> = {
  // Drone types
  'Quadcopter': '四轴飞行器',
  'Multicopter': '多旋翼飞行器',
  'Drone': '无人机',
  'UAV': '无人机',
  'Fixed-wing': '固定翼',
  'VTOL': '垂直起降',
  'FPV Drone': 'FPV无人机',
  'FPV Goggles': 'FPV眼镜',
  'Training Drone': '训练无人机',
  'Thermal Drone': '热成像无人机',
  'Waterproof Drone': '防水无人机',
  'Underwater Drone': '水下无人机',
  'Racing Drone': '竞速无人机',
  'Industrial Drone': '工业无人机',
  'Agricultural Drone': '农业无人机',
  'Military Drone': '军用无人机',
  'Enterprise': '企业版',
  'Professional': '专业版',

  // DJI Models
  'Matrice': '经纬',
  'Mavic': '御',
  'Phantom': '精灵',
  'Inspire': '悟',
  'Mini': 'Mini',
  'Air': 'Air',
  'Avata': 'Avata',
  'FPV': 'FPV',

  // Components
  'Flight Controller': '飞行控制器',
  'Autopilot': '自动驾驶仪',
  'ESC': '电调',
  'Motor': '电机',
  'Brushless': '无刷',
  'Propeller': '螺旋桨',
  'Propellers': '螺旋桨',
  'Blade': '桨叶',
  'Blades': '桨叶',
  'Frame': '机架',
  'Frame Kit': '机架套件',
  'Landing Gear': '起落架',
  'Arm': '机臂',
  'Servo': '舵机',
  'Gimbal': '云台',
  'Camera': '相机',
  'Video Camera': '摄像机',
  'Thermal Camera': '热成像相机',
  'Action Camera': '运动相机',
  'Lens': '镜头',
  'Sensor': '传感器',
  'LiDAR': '激光雷达',
  'GPS Module': 'GPS模块',
  'GPS': 'GPS',
  'Barometer': '气压计',
  'Gyroscope': '陀螺仪',
  'Accelerometer': '加速度计',
  'Magnetometer': '磁力计',
  'Transmitter': '发射器',
  'Receiver': '接收器',
  'Radio Controller': '遥控器',
  'Antenna': '天线',
  'Antennas': '天线',
  'Telemetry': '遥测',
  'Video Transmitter': '图传发射器',
  'Video Receiver': '图传接收器',
  'Patch Antenna': '平板天线',

  // Battery/Power
  'Battery': '电池',
  'Battery Pack': '电池组',
  'LiPo': '锂聚合物',
  'Li-ion': '锂离子',
  'Charger': '充电器',
  'Power Supply': '电源',
  'Portable Power Station': '便携式电站',
  'Solar Panel': '太阳能板',
  'Inverter Generator': '变频发电机',
  'Power Station': '电站',
  'Capacity': '容量',
  'Voltage': '电压',
  'Current': '电流',
  'Power': '功率',
  'Connector': '接头',
  'Plug': '插头',

  // Camera/Video
  'Resolution': '分辨率',
  'Frame Rate': '帧率',
  'Field of View': '视场角',
  'FOV': '视场角',
  'Zoom': '变焦',
  'Focus': '对焦',
  'Stabilization': '防抖',
  'Stabilizer': '稳定器',
  'Monitor': '监视器',
  'Display': '显示屏',
  'Screen': '屏幕',
  'Video': '视频',
  'Recording': '录制',
  'Memory Card': '存储卡',
  'microSD': 'microSD卡',

  // Materials
  'Carbon Fiber': '碳纤维',
  'Aluminum': '铝合金',
  'Plastic': '塑料',
  '3D Printed': '3D打印',

  // Specs
  'Weight': '重量',
  'Net Weight': '净重',
  'Size': '尺寸',
  'Dimensions': '尺寸',
  'Wheelbase': '轴距',
  'Maximum Speed': '最大速度',
  'Maximum Thrust': '最大推力',
  'Maximum Load': '最大负载',
  'Flight Time': '飞行时间',
  'Range': '航程',
  'Frequency Band': '频段',
  'Operating Temperature': '工作温度',
  'IP Rating': '防护等级',
  'Dust and Waterproof': '防尘防水',
  'Color Temperature': '色温',
  'Brightness': '亮度',
  'Luminous Flux': '光通量',
  'Aspect Ratio': '宽高比',
  'Accuracy': '精度',
  'Aperture': '光圈',
  'Magnification': '放大倍率',
  'Mounting': '安装方式',
  'Mounting Hole': '安装孔',
  'Bearing': '轴承',
  'Bearings': '轴承',
  'Stator': '定子',
  'Stator Diameter': '定子直径',
  'Stator Length': '定子长度',
  'KV': 'KV值',
  'Pitch': '螺距',
  'RPM': '转速',

  // Categories
  'Accessories': '配件',
  'Robots': '机器人',
  'Counter-UAS': '反无人机系统',
  'Frames': '机架',
  'Autopilots': '自动驾驶仪',
  'LiDAR Sensors': '激光雷达传感器',
  'Transmitters': '发射器',
  'Receivers': '接收器',
  'Motors': '电机',
  'Batteries': '电池',
  'Chargers': '充电器',
  'Cameras': '相机',
  'Gimbals': '云台',
  'Flight Controllers': '飞控',
  'ESCs': '电调',
  'Servos': '舵机',
  'Power Systems': '电源系统',
  'Cables': '线缆',
  'Tools': '工具',
  'For Enterprises': '企业级',
  'Other Manufacturers': '其他品牌',

  // Product description terms
  'Powerful': '强大的',
  'Designed for': '专为',
  'Designed': '设计',
  'High-quality': '高品质',
  'Durable': '耐用的',
  'Lightweight': '轻量化',
  'Compact': '紧凑的',
  'Compatible': '兼容的',
  'Original': '原装',
  'New': '全新',
  'Black': '黑色',
  'White': '白色',
  'Red': '红色',
  'Blue': '蓝色',
  'Green': '绿色',
  'Yellow': '黄色',
  'Gray': '灰色',
  'Included': '包含',
  'Optional': '可选',
  'Standard': '标准',
  'Extended': '扩展',
  'package': '套装',
  'Package': '套装',
  'Features': '特性',
  'Functions': '功能',
  'Specifications': '规格参数',
  'Technical Specifications': '技术规格',
  'Description': '描述',
  'Package Includes': '包装包含',
  'Warranty': '保修',

  // Actions
  'Add to Cart': '加入购物车',
  'Buy Now': '立即购买',
  'Request Quote': '询价',
  'In Stock': '有货',
  'Out of Stock': '缺货',
  'Price on Request': '价格面议',
  'Bulk Pricing': '批量定价',
  'SKU': 'SKU',
  'Categories': '分类',
  'Brand': '品牌',
  'Reviews': '评价',
  'Quantity': '数量',
  'Shipping': '配送',
  'Worldwide Shipping': '全球配送',
  'Verified Supplier': '认证供应商',
  'Bulk Discounts': '批量折扣',
  'No Description': '暂无描述',

  // Common words
  'and': '和',
  'with': '带',
  'for': '适用于',
  'without': '不带',
  'from': '来自',
  'set': '套装',
  'pair': '对',
  'piece': '个',
  'pcs': '件',
  'mm': '毫米',
  'cm': '厘米',
  'm': '米',
  'km': '公里',
  'g': '克',
  'kg': '千克',
  'V': 'V',
  'A': 'A',
  'W': 'W',
  'mAh': 'mAh',
  'Wh': 'Wh',
  'Hz': 'Hz',
  'GHz': 'GHz',
  '°C': '°C',

  // === Attribute names (specs) English → Chinese ===
  'Auto takeoff and landing': '自动起飞和降落',
  'Auto power off': '自动关机',
  'Antenna connector': '天线接口',
  'Package options': '套餐选项',
  'Version': '版本',
  'Takeoff weight': '起飞重量',
  'First Person View (FPV)': '第一人称视角(FPV)',
  'Video transmitter': '图传发射器',
  'Internal resistance': '内阻',
  'Internal memory': '内置存储',
  'Charging time': '充电时间',
  'GPS acquisition time': 'GPS定位时间',
  'Operating time': '工作时间',
  'Built-in functions': '内置功能',
  'Eye relief': '出瞳距离',
  'Output power': '输出功率',
  'Output voltage': '输出电压',
  'Main board': '主板',
  'Main chip': '主芯片',
  'Main controller': '主控制器',
  'Graphics processor': '图形处理器',
  'Detection range': '探测距离',
  'Flight range': '飞行距离',
  'Motor (1 pc)': '电机(1个)',
  'Diameter': '直径',
  'Shaft diameter': '轴径',
  'Motor diameter': '电机直径',
  'Measurement range': '测量范围',
  'Interpupillary distance range': '瞳距范围',
  'Operating temperature range': '工作温度范围',
  'Operating frequency range': '工作频率范围',
  'Charging temperature range': '充电温度范围',
  'Wavelength': '波长',
  'Motor length': '电机长度',
  'Additional functions': '附加功能',
  'Additional flight functions': '附加飞行功能',
  'Battery capacity': '电池容量',
  'Interface': '接口',
  'Cable': '线缆',
  'Recording quality': '录制质量',
  'Protection class': '防护等级',
  'Batteries included': '附赠电池',
  'Number of channels': '通道数',
  'Compass': '指南针',
  'Configuration': '配置',
  'Transmit gain': '发射增益',
  'Receive gain': '接收增益',
  'Camera mount': '相机安装位',
  'Mobile device mount on RC': '遥控器手机支架',
  'Torque': '扭矩',
  'Max signal transmission range': '最大信号传输距离',
  'Maximum vertical speed': '最大垂直速度',
  'Maximum flight altitude': '最大飞行高度',
  'Maximum depth': '最大深度',
  'Maximum horizontal speed': '最大水平速度',
  'Maximum power': '最大功率',
  'Maximum payload': '最大负载',
  'Maximum brightness': '最大亮度',
  'Maximum satellites': '最大卫星数',
  'Maximum flight distance': '最大飞行距离',
  'Maximum takeoff weight': '最大起飞重量',
  'Maximum viewing angle (degrees)': '最大视角(度)',
  'Material': '材质',
  'Body material': '机身材质',
  'Copper wire': '铜线',
  'Camera bay': '相机舱',
  'Microcontroller': '微控制器',
  'Minimum contrast': '最低对比度',
  'Charging power': '充电功率',
  'Transmitter power (EIRP)': '发射功率(EIRP)',
  'Camera included': '含相机',
  'Wired': '有线',
  'Battery voltage': '电池电压',
  'KV (RPM per volt)': 'KV值(转/伏)',
  'Volume': '体积',
  'Memory capacity': '存储容量',
  'RAM': '内存',
  'Operating system': '操作系统',
  'Optical zoom': '光学变焦',
  'Axial ratio': '轴比',
  'Core technology': '核心技术',
  'Alternating current': '交流电',
  'Peak power': '峰值功率',
  'Peak current': '峰值电流',
  'Pixels': '像素',
  'Motor power supply': '电机供电',
  'Material density': '材料密度',
  'Memory card support': '支持存储卡',
  'Smartphone/tablet support': '支持手机/平板',
  'Connection': '连接',
  'Field of view': '视场角',
  'Field of view (FOV)': '视场角(FOV)',
  'Payload': '负载',
  'Waypoint flight': '航点飞行',
  'Flight controller': '飞控',
  'Flight controller ESC': '飞控电调',
  'Ports': '端口',
  'Direct current': '直流电',
  'Manufacturer': '制造商',
  'Processor': '处理器',
  'Flight controller firmware': '飞控固件',
  'ESC firmware': '电调固件',
  'Remote controller included': '含遥控器',
  'Input operating power': '输入工作功率',
  'Operating temperature': '工作温度',
  'Operating frequency': '工作频率',
  'Operating current': '工作电流',
  'Operating radius': '工作半径',
  'Body size': '机身尺寸',
  'Object size': '物体尺寸',
  'Pixel size': '像素尺寸',
  'Propeller size': '螺旋桨尺寸',
  'Frame size': '机架尺寸',
  'Video resolution': '视频分辨率',
  'Recording resolution': '录制分辨率',
  'Still image resolution': '静态图像分辨率',
  'Horizontal resolution': '水平分辨率',
  'Discharge rate': '放电倍率',
  'Power connector': '电源接头',
  'Distance between top and bottom plates': '上下板间距',
  'Adjustable tilt angle': '可调倾角',
  'Shooting mode': '拍摄模式',
  'Temperature display modes': '温度显示模式',
  'Viewing modes': '查看模式',
  'Photo modes': '拍照模式',
  'Recommended battery': '推荐电池',
  'Rotor': '转子',
  'Lens system': '镜头系统',
  'Video transmission system': '图传系统',
  'Rotation speed': '转速',
  'Write speed': '写入速度',
  'Tracking speed': '追踪速度',
  'Positioning speed': '定位速度',
  'Read speed': '读取速度',
  'Compatible operating systems': '兼容操作系统',
  'Aspect ratio': '宽高比',
  'Resistance': '电阻',
  'Satellite receiver': '卫星接收器',
  'Battery life': '电池寿命',
  'Protection rating': '防护等级',
  'Country of manufacture': '生产国家',
  'HD video recording': '高清视频录制',
  'THERMAL CAMERA': '热成像相机',
  'Type': '类型',
  'Battery type': '电池类型',
  'Idle current': '空载电流',
  'Top and bottom plate thickness': '上下板厚度',
  'Positioning accuracy': '定位精度',
  'Viewing angle': '视角',
  'Altitude hold': '定高',
  'Smartphone control': '手机控制',
  'Gain': '增益',
  'Filtering': '滤波',
  'Focusing': '对焦',
  'Focal length': '焦距',
  'Video format': '视频格式',
  'Still image format': '静态图像格式',
  'Recording format': '录制格式',
  'Color': '颜色',
  'Color (body)': '颜色(机身)',
  'Digital zoom': '数字变焦',
  'Refresh rate': '刷新率',
  'Data update rate': '数据更新率',
  'Navigation update rate': '导航更新率',
  'Chip': '芯片',
  'Pixel pitch': '像素间距',
  'RC display': '遥控器屏幕',
  'Programming language': '编程语言',

  // === Product description terms ===
  'order': '订购',
  'buy': '购买',
  'price': '价格',
  'low price': '低价',
  'best price': '最优价格',
  'online store': '网上商店',
  'store': '商店',
  'delivery': '配送',
  'warranty': '保修',
  'model': '型号',
  'new arrival': '新品',
  'new': '新',
  'popular': '热门',
  'quality': '质量',
  'high quality': '高品质',
  'highest quality': '最高品质',
  'series': '系列',
  'combo': '套装',
  'included': '包含',
  'kit': '套件',
  'Fly More Combo': '畅飞套装',
  'Fly More': '畅飞',
  'three cameras': '三摄',
  'triple camera system': '三摄系统',
  'image processing': '图像处理',
  'images': '图像',
  'image': '图像',
  'video': '视频',
  'video transmission': '图传',
  'video signal': '视频信号',
  'transmission range': '传输距离',
  'video transmission range': '图传距离',
  'kilometers': '公里',
  'conquered the market': '占领市场',
  'drone market': '无人机市场',
  'fantastic capabilities': '出色性能',
  'capabilities': '性能',
  'will pleasantly impress': '将带来惊喜',
  'will impress': '将令人印象深刻',
  'with its functionality': '功能丰富',
  'functionality': '功能性',
  'functions': '功能',
  'first of all': '首先',
  'obstacle avoidance system': '避障系统',
  'obstacle avoidance': '避障',
  'obstacle detection': '障碍物检测',
  'obstacles': '障碍物',
  'means': '意味着',
  'fly': '飞行',
  'flight': '飞行',
  'flight time': '飞行时间',
  'flight time up to': '飞行时间长达',
  'minutes': '分钟',
  'hours': '小时',
  'seconds': '秒',
  'a pleasure': '一种享受',
  'order now': '立即订购',
  'right now': '立即',
  'Impressive capabilities': '出色性能',
  'compact body': '紧凑机身',
  'body': '机身',
  'key specifications': '关键参数',
  "let's review": '让我们看看',
  'create': '创作',
  'create fantastic footage': '创作精彩画面',
  'footage': '画面',
  'frames': '帧',
  'from the air': '从空中',
  'air': '空中',
  'at the same time': '同时',
  'transmit image': '传输图像',
  'incredible quality': '惊人画质',
  'thanks to which': '因此',
  'great popularity': '广受欢迎',
  'popularity': '人气',
  'is popular': '受欢迎',
  'film industry': '电影行业',
  'cinema': '电影',
  'is': '是',
  'impressive': '令人印象深刻',
  'next advantage': '另一大优势',
  'advantage': '优势',
  'advantages': '优势',
  'presence of': '配备',
  'includes': '包括',
  '8 sensors': '8个传感器',
  'different sides': '各个方向',
  'sides': '方向',
  'AI technology': 'AI技术',
  'AI': 'AI',
  'thanks to this': '因此',
  'avoid': '避免',
  'unwanted collisions': '意外碰撞',
  'collisions': '碰撞',
  'impacts': '撞击',
  'ensure safety': '确保安全',
  'safety': '安全',
  'your device': '您的设备',
  'device': '设备',
  'Extended flight time': '超长续航',
  'extended time': '延长时间',
  'features': '特性',
  'high-capacity battery': '大容量电池',
  'high capacity': '大容量',
  'due to this': '因此',
  'without battery replacement': '无需更换电池',
  'battery': '电池',
  'replacement': '更换',
  'this time is enough': '此时间足够',
  'enough': '足够',
  'to complete': '完成',
  'all assigned tasks': '所有任务',
  'tasks': '任务',
  'Technical specifications': '技术规格',
  'technical specifications': '技术规格',
  'gimbal': '云台',
  'different focal lengths': '不同焦距',
  'focal length': '焦距',
  'two of which': '其中两个',
  'are telephoto lenses': '为长焦镜头',
  'telephoto lens': '长焦镜头',
  'telephoto lenses': '长焦镜头',
  'Codec support': '编码支持',
  'support': '支持',
  'codec': '编码',
  'which simplifies working with': '简化了后期处理',
  'simplifies working with': '简化工作流程',
  'Updated system': '升级系统',
  'updated': '升级',
  'Transmission system': '传输系统',
  'up to 15 km': '最远15公里',
  'up to 12 km': '最远12公里',
  'resolution': '分辨率',
  'at': '在',
  'up to': '最高',
  'under': '以下',
  'above': '以上',
  'in': '在',
  'on': '在',
  'but': '但',
  'or': '或',
  'not': '不',
  'no': '无',
  'yes': '是',
  'all': '所有',
  'total': '总计',
  'also': '也',
  'only': '仅',
  'very': '非常',
  'more': '更多',
  'less': '更少',
  'about': '约',
  'approximately': '大约',
  'maximum': '最大',
  'minimum': '最小',
  ' Pro': ' Pro',
  ' Enterprise': ' 企业版',
  'quadcopter': '四轴飞行器',
  'quadcopters': '四轴飞行器',
  'drone': '无人机',
  'drones': '无人机',
  'multicopter': '多旋翼',
  'multicopters': '多旋翼',
  'fixed-wing': '固定翼',
  'thermal imaging': '热成像',
  'thermal': '热成像',
  'waterproof': '防水',
  'underwater': '水下',
  'training': '训练',
  'racing': '竞速',
  'professional': '专业',
  'industrial': '工业',
  'agricultural': '农业',
  'military': '军用',
  'toy': '玩具',
  'FPV goggles': 'FPV眼镜',
  'FPV system': 'FPV系统',
  'video receiver': '图传接收器',
  'transmitter': '发射器',
  'patch antenna': '平板天线',
  'cloverleaf antenna': '三叶天线',
  'autopilot': '自动驾驶仪',
  'speed controller': '速度控制器',
  'controller': '控制器',
  'board': '板',
  'module': '模块',
  'magnetometer': '磁力计',
  'telemetry': '遥测',
  'radio modem': '无线数传',
  'brushless': '无刷',
  'brushed': '有刷',
  'servo': '舵机',
  'blade': '桨叶',
  'blades': '桨叶',
  '3-blade': '三叶',
  '2-blade': '两叶',
  '3 blades': '三叶',
  '2 blades': '两叶',
  'battery pack': '电池组',
  'lithium-polymer': '锂聚合物',
  'lithium-ion': '锂离子',
  'charger': '充电器',
  'balancer': '平衡充',
  'power supply': '电源',
  'power source': '电源',
  'current': '电流',
  'plug': '插头',
  'video camera': '摄像机',
  'action camera': '运动相机',
  'thermal camera': '热成像相机',
  'frame rate': '帧率',
  'zoom': '变焦',
  'focus': '对焦',
  'stabilizer': '稳定器',
  'stabilization': '防抖',
  'monitor': '监视器',
  'screen': '屏幕',
  'recording': '录制',
  'memory card': '存储卡',
  'landing gear': '起落架',
  'legs': '脚架',
  'arm': '机臂',
  'arms': '机臂',
  'mount': '安装座',
  'bracket': '支架',
  'adapter': '转接器',
  'carbon fiber': '碳纤维',
  'aluminum': '铝合金',
  'plastic': '塑料',
  '3D printed': '3D打印',
  'radio controller': '遥控器',
  'radio system': '遥控系统',
  'radio control': '遥控',
  'joystick': '摇杆',
  'stick': '摇杆',
  'switch': '开关',
  'button': '按钮',
  'tripod': '三脚架',
  'counter-drone': '反无人机',
  'jammer': '干扰器',
  'detector': '探测器',
  'gun': '枪',
  'anti-drone': '反无人机',
  'EW': '电子战',
  'electronic warfare': '电子战',
  'mass': '质量',
  'length': '长度',
  'width': '宽度',
  'height': '高度',
  'thickness': '厚度',
  'service ceiling': '升限',
  'speed': '速度',
  'max speed': '最大速度',
  'wind resistance': '抗风等级',
  'payload capacity': '载重能力',
  'IC chip': '芯片',
  'transistor': '晶体管',
  'diode': '二极管',
  'resistor': '电阻',
  'capacitor': '电容',
  'inductor': '电感',
  'wire': '导线',
  'original': '原装',
  'universal': '通用',
  'compatible': '兼容',
  'durable': '耐用',
  'lightweight': '轻量',
  'compact': '紧凑',
  'portable': '便携',
  'high-quality': '高品质',
  'premium': '高端',
  'excellent quality': '卓越品质',
  'best choice': '最佳选择',
  'ideal for': '理想选择',
  'suitable for': '适用于',
  'compatible with': '兼容',
  'compatibility with': '兼容性',
  'wide range': '广泛',
  'large selection': '丰富选择',
  'affordable price': '实惠价格',
  'quality guarantee': '品质保证',
  'official dealer': '官方经销商',
  'original product': '原装产品',
  'original products': '原装产品',
  'free shipping': '免运费',
  'fast delivery': '快速配送',
  'in stock': '有货',
  'on request': '询价',
  'wholesale and retail': '批发零售',
  'wholesale price': '批发价',
  'retail price': '零售价',
  'order online': '在线订购',
  'buy in one click': '一键购买',
  'add to cart': '加入购物车',
  'contact us': '联系我们',
  'get consultation': '获取咨询',
  'specialists will help': '专家协助',
  'professional consultation': '专业咨询',
  'engineering support': '工程支持',
  'technical support': '技术支持',
  'warranty service': '保修服务',
  'post-warranty service': '保外服务',
  'service center': '服务中心',
  'repair and maintenance': '维修保养',
  'key features': '主要特性',
  'package contents': '包装清单',
  'delivery set': '交付套装',
  'user manual': '用户手册',
  'user guide': '用户指南',
  'easy installation': '安装简便',
  'easy to use': '使用简便',
  'easy to install': '易于安装',
  'no setup required': '无需设置',
  'ready to use': '开箱即用',
  'plug and play': '即插即用',
  'works out of the box': '开箱即用',
  'high performance': '高性能',
  'high power': '大功率',
  'high precision': '高精度',
  'high reliability': '高可靠性',
  'stable operation': '稳定运行',
  'reliable operation': '可靠运行',
  'long service life': '长寿命',
  'durable housing': '耐用外壳',
  'compact size': '紧凑尺寸',
  'light weight': '轻量化',
  'low power consumption': '低功耗',
  'energy efficient': '节能',
  'wide operating temperature range': '宽工作温度范围',
  'works in all conditions': '全环境工作',
  'all-weather': '全天候',
  'dustproof': '防尘',
  'shockproof': '防震',
  'vibration resistant': '抗振',
  'flight altitude': '飞行高度',
  'maximum altitude': '最大高度',
  'empty weight': '空重',
  'operating range': '工作范围',
  'control range': '控制距离',
  'video quality': '视频质量',
  'real-time video': '实时视频',
  'digital video transmission': '数字图传',
  'analog video transmission': '模拟图传',
  'low latency': '低延迟',
  'high definition': '高清',
  '4K video': '4K视频',
  'Full HD': '全高清',
  'HD quality': '高清画质',
  'image stabilization': '图像防抖',
  '3-axis stabilization': '三轴防抖',
  'mechanical gimbal': '机械云台',
  'electronic stabilizer': '电子防抖',
  'return to home': '一键返航',
  'RTH': '返航',
  'GPS navigation': 'GPS导航',
  'satellite navigation': '卫星导航',
  'position hold': '定点悬停',
  'auto takeoff': '自动起飞',
  'auto landing': '自动降落',
  'follow me': '智能跟随',
  'follow me mode': '跟随模式',
  'point of interest orbit': '兴趣点环绕',
  'waypoint flight': '航点飞行',
  'autonomous flight': '自主飞行',
  'manual control': '手动控制',
  'acro mode': '特技模式',
  'stable mode': '稳定模式',
  'angle mode': '角度模式',
  'number of cells': '电芯数',
  'nominal voltage': '标称电压',
  'charge voltage': '充电电压',
  'discharge voltage': '放电电压',
  'discharge rate': '放电倍率',
  'C rating': 'C倍率',
  'continuous discharge current': '持续放电电流',
  'burst discharge current': '峰值放电电流',
  'charge current': '充电电流',
  'fast charging': '快充',
  'balance charging': '平衡充',
  'battery storage': '电池存储',
  'cycle life': '循环寿命',
  'maximum RPM': '最大转速',
  'maximum current': '最大电流',
  'For Enterprise': '企业级',
  'Pair': '对',
  'Set': '套',
  'Piece': '个',

  // Common English words for description translation
  'by': '由',
  'to': '到',
  'are': '是',
  'was': '曾是',
  'were': '曾是',
  'will be': '将是',
  'be': '是',
  'has': '有',
  'have': '有',
  'had': '曾有',
  'can': '可以',
  'could': '可以',
  'may': '可能',
  'might': '可能',
  'must': '必须',
  'should': '应该',
  'would': '会',
  'need': '需要',
  'needs': '需要',
  'do': '做',
  'does': '做',
  'did': '做了',
  'make': '制作',
  'makes': '制作',
  'made': '制作',
  'creates': '创建',
  'created': '创建',
  'use': '使用',
  'uses': '使用',
  'used': '使用',
  'work': '工作',
  'works': '工作',
  'worked': '工作',
  'supports': '支持',
  'supported': '支持',
  'provide': '提供',
  'provides': '提供',
  'provided': '提供',
  'allow': '允许',
  'allows': '允许',
  'allowed': '允许',
  'give': '给',
  'gives': '给',
  'gave': '给了',
  'get': '获得',
  'gets': '获得',
  'got': '获得',
  'include': '包括',
  'contain': '包含',
  'contains': '包含',
  'contained': '包含',
  'consist': '组成',
  'consists': '组成',
  'differ': '不同',
  'differs': '不同',
  'correspond': '对应',
  'corresponds': '对应',
  'fit': '适合',
  'fits': '适合',
  'flies': '飞行',
  'flew': '飞过',
  'flown': '飞行',
  'shoot': '拍摄',
  'shoots': '拍摄',
  'shot': '拍摄',
  'record': '记录',
  'records': '记录',
  'recorded': '记录',
  'transmit': '传输',
  'transmits': '传输',
  'transmitted': '传输',
  'receive': '接收',
  'receives': '接收',
  'received': '接收',
  'charge': '充电',
  'charges': '充电',
  'charged': '充电',
  'see': '看到',
  'sees': '看到',
  'saw': '看到',
  'look': '看',
  'looks': '看',
  'hear': '听',
  'hears': '听',
  'speak': '说',
  'speaks': '说',
  'say': '说',
  'says': '说',
  'said': '说',
  'tell': '告诉',
  'tells': '告诉',
  'told': '告诉',
  'read': '读',
  'reads': '读',
  'write': '写',
  'writes': '写',
  'wrote': '写',
  'know': '知道',
  'knows': '知道',
  'knew': '知道',
  'understand': '理解',
  'understands': '理解',
  'think': '想',
  'thinks': '想',
  'thought': '想',
  'find': '找到',
  'finds': '找到',
  'found': '找到',
  'located': '位于',
  'happen': '发生',
  'happens': '发生',
  'happened': '发生',
  'appear': '出现',
  'appears': '出现',
  'appeared': '出现',
  'disappear': '消失',
  'disappears': '消失',
  'begin': '开始',
  'begins': '开始',
  'began': '开始',
  'end': '结束',
  'ends': '结束',
  'ended': '结束',
  'continue': '继续',
  'continues': '继续',
  'continued': '继续',
  'improve': '改善',
  'improves': '改善',
  'improved': '改善',
  'increase': '增加',
  'increases': '增加',
  'increased': '增加',
  'decrease': '减少',
  'decreases': '减少',
  'decreased': '减少',
  'reduce': '降低',
  'reduces': '降低',
  'reduced': '降低',
  'protect': '保护',
  'protects': '保护',
  'protected': '保护',
  'prevent': '防止',
  'prevents': '防止',
  'prevented': '防止',
  'avoids': '避免',
  'avoided': '避免',
  'detect': '检测',
  'detects': '检测',
  'detected': '检测',
  'recognize': '识别',
  'recognizes': '识别',
  'recognized': '识别',
  'track': '追踪',
  'tracks': '追踪',
  'tracked': '追踪',
  'follow': '跟随',
  'follows': '跟随',
  'followed': '跟随',
  'control': '控制',
  'controls': '控制',
  'controlled': '控制',
  'regulate': '调节',
  'regulates': '调节',
  'regulated': '调节',
  'configure': '配置',
  'configures': '配置',
  'configured': '配置',
  'install': '安装',
  'installs': '安装',
  'installed': '安装',
  'connect': '连接',
  'connects': '连接',
  'connected': '连接',
  'enable': '启用',
  'enables': '启用',
  'enabled': '启用',
  'disable': '禁用',
  'disables': '禁用',
  'disabled': '禁用',
  'open': '打开',
  'opens': '打开',
  'opened': '打开',
  'close': '关闭',
  'closes': '关闭',
  'closed': '关闭',
  'available': '可用',
  'unavailable': '不可用',
  'possible': '可能',
  'impossible': '不可能',
  'needed': '需要',
  'important': '重要',
  'useful': '有用',
  'convenient': '方便',
  'simple': '简单',
  'complex': '复杂',
  'easy': '容易',
  'difficult': '困难',
  'fast': '快速',
  'slow': '缓慢',
  'reliable': '可靠',
  'safe': '安全',
  'effective': '有效',
  'old': '旧',
  'good': '好',
  'bad': '坏',
  'great': '出色',
  'excellent': '优秀',
  'perfect': '完美',
  'wonderful': '精彩',
  'amazing': '惊人',
  'fantastic': '极好',
  'incredible': '难以置信',
  'powerful': '强大',
  'strong': '强',
  'weak': '弱',
  'high': '高',
  'low': '低',
  'large': '大',
  'small': '小',
  'big': '大',
  'little': '小',
  'long': '长',
  'short': '短',
  'wide': '宽',
  'narrow': '窄',
  'thick': '厚',
  'thin': '薄',
  'heavy': '重',
  'light': '轻',
  'hard': '硬',
  'soft': '软',
  'bright': '亮',
  'dark': '暗',
  'clear': '清晰',
  'clean': '干净',
  'dirty': '脏',
  'hot': '热',
  'cold': '冷',
  'warm': '暖',
  'cool': '凉',
  'dry': '干',
  'wet': '湿',
  'full': '满',
  'empty': '空',
  'complete': '完整',
  'whole': '整个',
  'entire': '整个',
  'partial': '部分',
  'main': '主要',
  'primary': '主要',
  'secondary': '次要',
  'key': '关键',
  'basic': '基础',
  'advanced': '高级',
  'standard': '标准',
  'deluxe': '豪华',
  'ultimate': '终极',
  'consumer': '消费级',
  'enterprise': '企业级',
  'commercial': '商业',
  'civilian': '民用',
  'first': '第一',
  'second': '第二',
  'third': '第三',
  'last': '最后',
  'next': '下一个',
  'previous': '上一个',
  'same': '相同',
  'different': '不同',
  'similar': '相似',
  'other': '其他',
  'another': '另一个',
  'such': '这样',
  'this': '这',
  'that': '那',
  'these': '这些',
  'those': '那些',
  'which': '哪个',
  'what': '什么',
  'who': '谁',
  'whom': '谁',
  'whose': '谁的',
  'where': '哪里',
  'when': '何时',
  'why': '为什么',
  'how': '如何',
  'here': '这里',
  'there': '那里',
  'now': '现在',
  'then': '然后',
  'today': '今天',
  'yesterday': '昨天',
  'tomorrow': '明天',
  'always': '总是',
  'never': '从不',
  'sometimes': '有时',
  'often': '经常',
  'rarely': '很少',
  'usually': '通常',
  'generally': '一般',
  'especially': '特别',
  'particularly': '尤其',
  'for example': '例如',
  'thus': '因此',
  'therefore': '因此',
  'so': '所以',
  'however': '然而',
  'although': '虽然',
  'though': '虽然',
  'because': '因为',
  'since': '因为',
  'if': '如果',
  'unless': '除非',
  'while': '当',
  'as': '作为',
  'after': '之后',
  'before': '之前',
  'until': '直到',
  'during': '期间',
  'through': '通过',
  'between': '之间',
  'among': '之中',
  'around': '周围',
  'near': '附近',
  'far': '远',
  'together': '一起',
  'separately': '单独',
  'alone': '单独',
  'independently': '独立',
  'automatically': '自动',
  'manually': '手动',
  'electronically': '电子',
  'mechanically': '机械',
  'digitally': '数字',
  'physically': '物理',
  'virtually': '虚拟',
  'actually': '实际上',
  'really': '真的',
  'literally': '字面上',
  'essentially': '本质上',
  'basically': '基本上',
  'overall': '总体',
  'besides': '此外',
  'moreover': '而且',
  'furthermore': '此外',
  'otherwise': '否则',
  'instead': '代替',
  'rather': '而是',
  'quite': '相当',
  'pretty': '相当',
  'too': '太',
  'many': '许多',
  'much': '很多',
  'few': '少',
  'several': '几个',
  'some': '一些',
  'any': '任何',
  'each': '每个',
  'every': '每个',
  'both': '两者都',
  'either': '任一',
  'neither': '两者都不',
  'none': '无',
  'one': '一',
  'two': '二',
  'three': '三',
  'four': '四',
  'five': '五',
  'six': '六',
  'seven': '七',
  'eight': '八',
  'nine': '九',
  'ten': '十',
  'hundred': '百',
  'thousand': '千',
  'million': '百万',
  'billion': '十亿',
  'once': '一次',
  'twice': '两次',
  'times': '次',
  'percent': '百分比',
  'half': '半',
  'quarter': '四分之一',
  'double': '双倍',
  'triple': '三倍',
  'unit': '台',
  'item': '项',
  'thing': '东西',
  'stuff': '东西',
  'object': '物体',
  'equipment': '设备',
  'tool': '工具',
  'machine': '机器',
  'mechanism': '机制',
  'system': '系统',
  'component': '组件',
  'part': '部分',
  'element': '元素',
  'feature': '特性',
  'function': '功能',
  'option': '选项',
  'setting': '设置',
  'parameter': '参数',
  'mode': '模式',
  'level': '级别',
  'type': '类型',
  'kind': '种类',
  'form': '形式',
  'shape': '形状',
  'size': '尺寸',
  'color': '颜色',
  'material': '材料',
  'design': '设计',
  'version': '版本',
  'brand': '品牌',
  'manufacturer': '制造商',
  'product': '产品',
  'goods': '商品',
  'cost': '成本',
  'value': '价值',
  'quantity': '数量',
  'stock': '库存',
  'shipping': '运输',
  'payment': '支付',
  'service': '服务',
  'help': '帮助',
  'information': '信息',
  'data': '数据',
  'details': '详情',
  'description': '描述',
  'specification': '规格',
  'specifications': '规格',
  'instruction': '说明',
  'manual': '手册',
  'guide': '指南',
  'documentation': '文档',
  'certificate': '证书',
  'certification': '认证',
  'requirement': '要求',
  'condition': '条件',
  'state': '状态',
  'status': '状态',
  'result': '结果',
  'effect': '效果',
  'performance': '性能',
  'accuracy': '精度',
  'precision': '精度',
  'reliability': '可靠性',
  'stability': '稳定性',
  'durability': '耐用性',
  'efficiency': '效率',
  'capacity': '容量',
  'range': '范围',
  'distance': '距离',
  'depth': '深度',
  'diameter': '直径',
  'radius': '半径',
  'weight': '重量',
  'volume': '体积',
  'area': '面积',
  'temperature': '温度',
  'pressure': '压力',
  'voltage': '电压',
  'power': '功率',
  'energy': '能量',
  'frequency': '频率',
  'signal': '信号',
  'noise': '噪音',
  'cable': '线缆',
  'connector': '接头',
  'socket': '插座',
  'port': '端口',
  'display': '显示屏',
  'lens': '镜头',
  'sensor': '传感器',
  'camera': '相机',
  'motor': '电机',
  'propeller': '螺旋桨',
  'frame': '机架',
  'receiver': '接收器',
  'antenna': '天线',
  'compass': '指南针',
  'barometer': '气压计',
  'gyroscope': '陀螺仪',
  'accelerometer': '加速度计',
  'storage': '存储',
  'memory': '内存',
  'card': '卡',
  'file': '文件',
  'format': '格式',
  'bitrate': '码率',
  'compression': '压缩',
  'playback': '播放',
  'streaming': '流媒体',
  'transmission': '传输',
  'reception': '接收',
  'interference': '干扰',
  'latency': '延迟',
  'bandwidth': '带宽',
  'channel': '通道',
  'protocol': '协议',
  'connection': '连接',
  'network': '网络',
  'Wi-Fi': 'Wi-Fi',
  'Bluetooth': '蓝牙',
  'USB': 'USB',
  'HDMI': 'HDMI',
  'Type-C': 'Type-C',
  'technology': '技术',
  'technique': '技术',
  'method': '方法',
  'process': '过程',
  'procedure': '程序',
  'operation': '操作',
  'action': '动作',
  'movement': '运动',
  'takeoff': '起飞',
  'landing': '降落',
  'hover': '悬停',
  'altitude': '高度',
  'attitude': '姿态',
  'position': '位置',
  'navigation': '导航',
  'waypoint': '航点',
  'route': '路线',
  'path': '路径',
  'direction': '方向',
  'orientation': '方向',
  'angle': '角度',
  'tilt': '倾斜',
  'pan': '平移',
  'roll': '横滚',
  'pitch': '俯仰',
  'yaw': '偏航',
  'throttle': '油门',
  'steering': '转向',
  'braking': '制动',
  'acceleration': '加速',
  'deceleration': '减速',
  'obstacle': '障碍物',
  'collision': '碰撞',
  'avoidance': '避让',
  'detection': '检测',
  'tracking': '追踪',
  'recognition': '识别',
  'identification': '识别',
  'measurement': '测量',
  'calculation': '计算',
  'calibration': '校准',
  'configuration': '配置',
  'initialization': '初始化',
  'activation': '激活',
  'update': '更新',
  'upgrade': '升级',
  'firmware': '固件',
  'software': '软件',
  'hardware': '硬件',
  'application': '应用',
  'app': '应用',
  'program': '程序',
  'algorithm': '算法',
  'artificial intelligence': '人工智能',
  'machine learning': '机器学习',
  'computer vision': '计算机视觉',
  'signal processing': '信号处理',
  'data processing': '数据处理',
  'cloud': '云',
  'server': '服务器',
  'client': '客户端',
  'platform': '平台',
  'interface': '接口',
  'integration': '集成',
  'compatibility': '兼容性',
  'interoperability': '互操作性',
  'security': '安全',
  'protection': '保护',
  'encryption': '加密',
  'authentication': '认证',
  'authorization': '授权',
  'access': '访问',
  'permission': '权限',
  'user': '用户',
  'customer': '客户',
  'buyer': '买家',
  'seller': '卖家',
  'supplier': '供应商',
  'distributor': '经销商',
  'dealer': '经销商',
  'retailer': '零售商',
  'wholesaler': '批发商',
  'partner': '合作伙伴',
  'company': '公司',
  'organization': '组织',
  'business': '商业',
  'industry': '行业',
  'market': '市场',
  'shop': '店铺',
  'website': '网站',
  'online': '在线',
  'offline': '离线',
  'digital': '数字',
  'analog': '模拟',
  'smart': '智能',
  'intelligent': '智能',
  'autonomous': '自主',
  'automatic': '自动',
  'remote': '远程',
  'wireless': '无线',
  'wired': '有线',
  'mobile': '移动',
  'stationary': '固定',
  'fixed': '固定',
  'adjustable': '可调',
  'flexible': '灵活',
  'versatile': '多功能',
  'genuine': '正品',
  'authentic': '正宗',
  'certified': '认证',
  'approved': '认可',
  'recommended': '推荐',
  'bestseller': '畅销',
  'top': '顶级',
  'best': '最佳',
  'leading': '领先',
  'luxury': '豪华',
  'economy': '经济',
  'budget': '预算',
  'affordable': '实惠',
  'cheap': '便宜',
  'expensive': '昂贵',
  'worth': '值得',
  'discount': '折扣',
  'sale': '促销',
  'offer': '优惠',
  'deal': '交易',
  'promotion': '促销',
  'special': '特别',
  'latest': '最新',
  'enhanced': '增强',
  'upgraded': '升级',
  'modern': '现代',
  'classic': '经典',
  'traditional': '传统',
  'innovative': '创新',
  'revolutionary': '革命性',
  'cutting-edge': '尖端',
  'state-of-the-art': '最先进',
  'high-performance': '高性能',
  'heavy-duty': '重型',
  'professional-grade': '专业级',
  'industrial-grade': '工业级',
  'military-grade': '军用级',
  'commercial-grade': '商业级',
  'consumer-grade': '消费级',
  'entry-level': '入门级',
  'mid-range': '中端',
  'high-end': '高端',
  'flagship': '旗舰',
  'miniature': '微型',
  'micro': '微型',
  'macro': '宏观',
  'large-scale': '大规模',
  'small-scale': '小规模',
  'full-size': '全尺寸',
  'full-scale': '全尺寸',
  'life-size': '实物大小',
  'real-time': '实时',
  'live': '直播',
  'instant': '即时',
  'immediate': '立即',
  'rapid': '快速',
  'quick': '快速',
  'gradual': '渐进',
  'continuous': '连续',
  'constant': '恒定',
  'steady': '稳定',
  'stable': '稳定',
  'consistent': '一致',
  'dependable': '可靠',
  'robust': '坚固',
  'rugged': '耐用',
  'tough': '坚固',
  'long-lasting': '持久',
  'long-life': '长寿命',
  'weatherproof': '防风雨',
  'vibration-resistant': '抗振',
  'temperature-resistant': '耐温',
  'corrosion-resistant': '耐腐蚀',
  'rustproof': '防锈',
  'fireproof': '防火',
  'explosion-proof': '防爆',
  'environmentally-friendly': '环保',
  'eco-friendly': '环保',
  'energy-efficient': '节能',
  'low-power': '低功耗',
  'high-efficiency': '高效率',
  'high-capacity': '高容量',
  'high-speed': '高速',
  'high-precision': '高精度',
  'high-resolution': '高分辨率',
  'high-definition': '高清',
  'ultra-high-definition': '超高清',
  '4K': '4K',
  '8K': '8K',
  'HD': '高清',
  'SD': '标清',
  'MP': 'MP',
  'GB': 'GB',
  'MB': 'MB',
  'TB': 'TB',
  'kHz': 'kHz',
  'MHz': 'MHz',
  'fps': 'fps',
  'm/s': 'm/s',
  'km/h': 'km/h',
  'mph': 'mph',
  'knots': '节',
  'ft': '英尺',
  'lb': '磅',
  'oz': '盎司',
  '°F': '°F',
  'L': '升',
  'ml': '毫升',
  'Pa': 'Pa',
  'kPa': 'kPa',
  'psi': 'psi',
  'dB': 'dB',
  'lm': 'lm',
  'lux': 'lux',
  'nit': 'nit',

  // === Common English words (from Russian→English translation) ===
  // Pronouns
  'I': '我', 'you': '您', 'he': '他', 'she': '她', 'it': '它', 'we': '我们', 'they': '他们',
  'me': '我', 'him': '他', 'her': '她', 'us': '我们', 'them': '他们',
  'my': '我的', 'your': '您的', 'his': '他的', 'its': '其', 'our': '我们的', 'their': '他们的',
  'mine': '我的', 'yours': '您的', 'hers': '她的', 'ours': '我们的', 'theirs': '他们的',
  'this': '此', 'that': '该', 'these': '这些', 'those': '那些',
  'who': '谁', 'whom': '谁', 'whose': '谁的', 'which': '哪个', 'what': '什么',
  'where': '哪里', 'when': '何时', 'why': '为何', 'how': '如何',
  'myself': '我自己', 'yourself': '您自己', 'himself': '他自己', 'herself': '她自己',
  'itself': '其本身', 'ourselves': '我们自己', 'themselves': '他们自己',
  // Articles (will be removed by function word processing, but add for safety)
  'the': '', 'a': '', 'an': '',
  // Be verbs
  'be': '是', 'is': '是', 'are': '是', 'am': '是', 'was': '曾是', 'were': '曾是',
  'been': '是', 'being': '是',
  // Have
  'have': '有', 'has': '有', 'had': '曾有', 'having': '有',
  // Do
  'do': '做', 'does': '做', 'did': '曾做', 'done': '做',
  // Modals
  'will': '将', 'would': '将', 'shall': '将', 'should': '应',
  'can': '可', 'could': '可', 'may': '可能', 'might': '可能',
  'must': '必须', 'need': '需要', 'needs': '需要', 'dare': '敢',
  // Prepositions
  'in': '在', 'on': '在', 'at': '在', 'by': '由', 'for': '用于',
  'with': '带', 'without': '无', 'from': '从', 'to': '到', 'of': '的',
  'into': '到', 'onto': '到', 'upon': '在', 'about': '关于', 'above': '上方',
  'below': '下方', 'under': '下', 'over': '上', 'between': '之间', 'among': '之中',
  'through': '通过', 'across': '穿过', 'along': '沿着', 'against': '反对',
  'before': '之前', 'after': '之后', 'during': '期间', 'since': '自从',
  'until': '直到', 'while': '当', 'as': '作为', 'like': '像',
  // Conjunctions
  'and': '和', 'or': '或', 'but': '但', 'so': '所以', 'yet': '然而',
  'if': '如果', 'then': '那么', 'because': '因为', 'although': '尽管',
  'though': '尽管', 'unless': '除非', 'since': '既然', 'while': '而',
  'whereas': '而', 'whether': '是否', 'either': '任一', 'neither': '两者都不',
  'both': '两者都', 'not': '不', 'no': '无', 'nor': '也不',
  // Adverbs
  'very': '非常', 'too': '太', 'also': '也', 'just': '仅', 'only': '仅',
  'even': '甚至', 'still': '仍', 'yet': '还', 'already': '已',
  'always': '始终', 'never': '从不', 'often': '通常', 'sometimes': '有时',
  'usually': '通常', 'rarely': '很少', 'seldom': '很少', 'ever': '曾经',
  'now': '现在', 'then': '然后', 'here': '此处', 'there': '此处',
  'today': '今天', 'yesterday': '昨天', 'tomorrow': '明天',
  'soon': '很快', 'recently': '最近', 'lately': '最近',
  'again': '再次', 'once': '一次', 'twice': '两次',
  'together': '一起', 'apart': '分开', 'alone': '单独',
  'perhaps': '也许', 'maybe': '也许', 'probably': '可能',
  'certainly': '当然', 'definitely': '肯定', 'indeed': '确实',
  'of course': '当然', 'surely': '肯定',
  'really': '真正', 'actually': '实际上', 'in fact': '事实上',
  'especially': '尤其', 'particularly': '特别', 'mainly': '主要',
  'mostly': '主要', 'generally': '通常', 'usually': '通常',
  'however': '然而', 'moreover': '此外', 'furthermore': '此外',
  'therefore': '因此', 'thus': '因此', 'hence': '因此',
  'otherwise': '否则', 'instead': '代替', 'rather': '相当',
  'quite': '相当', 'rather': '宁愿', 'almost': '几乎', 'nearly': '几乎',
  'exactly': '正是', 'precisely': '精确', 'just': '正好',
  'simply': '简单', 'merely': '仅仅', 'hardly': '几乎不',
  'barely': '勉强', 'scarcely': '几乎不',
  'completely': '完全', 'totally': '完全', 'absolutely': '绝对',
  'fully': '完全', 'entirely': '完全', 'wholly': '完全',
  'partly': '部分', 'partially': '部分',
  'highly': '高度', 'deeply': '深度', 'greatly': '大大',
  'widely': '广泛', 'narrowly': '狭窄',
  'well': '好', 'badly': '差', 'better': '更好', 'worse': '更差',
  'best': '最好', 'worst': '最差',
  'more': '更', 'most': '最', 'less': '较少', 'least': '最少',
  'much': '很多', 'many': '很多', 'few': '很少', 'little': '很少',
  'several': '几个', 'some': '一些', 'any': '任何', 'all': '所有',
  'each': '每个', 'every': '每个', 'both': '两者都',
  'none': '无', 'nobody': '无人', 'nothing': '无物', 'nowhere': '无处',
  'someone': '某人', 'somebody': '某人', 'something': '某物', 'somewhere': '某处',
  'anyone': '任何人', 'anybody': '任何人', 'anything': '任何物', 'anywhere': '任何处',
  'everyone': '每人', 'everybody': '每人', 'everything': '万物', 'everywhere': '到处',
  // Common verbs
  'get': '获得', 'gets': '获得', 'got': '获得', 'gotten': '获得',
  'make': '使', 'makes': '使', 'made': '使',
  'let': '让', 'lets': '让',
  'help': '帮助', 'helps': '帮助', 'helped': '帮助',
  'keep': '保持', 'keeps': '保持', 'kept': '保持',
  'set': '设置', 'sets': '设置',
  'put': '放', 'puts': '放',
  'bring': '带来', 'brings': '带来', 'brought': '带来',
  'take': '取', 'takes': '取', 'took': '取', 'taken': '取',
  'come': '来', 'comes': '来', 'came': '来',
  'go': '去', 'goes': '去', 'went': '去', 'gone': '去',
  'see': '见', 'sees': '见', 'saw': '见', 'seen': '见',
  'know': '知道', 'knows': '知道', 'knew': '知道', 'known': '知道',
  'think': '认为', 'thinks': '认为', 'thought': '认为',
  'look': '看', 'looks': '看', 'looked': '看',
  'want': '想要', 'wants': '想要', 'wanted': '想要',
  'give': '给', 'gives': '给', 'gave': '给', 'given': '给',
  'use': '使用', 'uses': '使用', 'used': '使用',
  'find': '找到', 'finds': '找到', 'found': '找到',
  'tell': '告诉', 'tells': '告诉', 'told': '告诉',
  'work': '工作', 'works': '工作', 'worked': '工作',
  'seem': '似乎', 'seems': '似乎', 'seemed': '似乎',
  'feel': '感觉', 'feels': '感觉', 'felt': '感觉',
  'try': '尝试', 'tries': '尝试', 'tried': '尝试',
  'leave': '离开', 'leaves': '离开', 'left': '离开',
  'call': '称为', 'calls': '称为', 'called': '称为',
  'become': '成为', 'becomes': '成为', 'became': '成为',
  'remain': '保持', 'remains': '保持', 'remained': '保持',
  'stay': '停留', 'stays': '停留', 'stayed': '停留',
  'turn': '转', 'turns': '转', 'turned': '转',
  'grow': '增长', 'grows': '增长', 'grew': '增长', 'grown': '增长',
  'appear': '出现', 'appears': '出现', 'appeared': '出现',
  'happen': '发生', 'happens': '发生', 'happened': '发生',
  'occur': '发生', 'occurs': '发生', 'occurred': '发生',
  'exist': '存在', 'exists': '存在', 'existed': '存在',
  'change': '改变', 'changes': '改变', 'changed': '改变',
  'begin': '开始', 'begins': '开始', 'began': '开始', 'begun': '开始',
  'start': '开始', 'starts': '开始', 'started': '开始',
  'end': '结束', 'ends': '结束', 'ended': '结束',
  'finish': '完成', 'finishes': '完成', 'finished': '完成',
  'stop': '停止', 'stops': '停止', 'stopped': '停止',
  'continue': '继续', 'continues': '继续', 'continued': '继续',
  'create': '创建', 'creates': '创建', 'created': '创建',
  'build': '构建', 'builds': '构建', 'built': '构建',
  'form': '形成', 'forms': '形成', 'formed': '形成',
  'cause': '导致', 'causes': '导致', 'caused': '导致',
  'allow': '允许', 'allows': '允许', 'allowed': '允许',
  'enable': '使能够', 'enables': '使能够', 'enabled': '使能够',
  'require': '需要', 'requires': '需要', 'required': '需要',
  'provide': '提供', 'provides': '提供', 'provided': '提供',
  'offer': '提供', 'offers': '提供', 'offered': '提供',
  'support': '支持', 'supports': '支持', 'supported': '支持',
  'include': '包括', 'includes': '包括', 'included': '包括',
  'contain': '包含', 'contains': '包含', 'contained': '包含',
  'consist': '组成', 'consists': '组成', 'consisted': '组成',
  'involve': '涉及', 'involves': '涉及', 'involved': '涉及',
  'ensure': '确保', 'ensures': '确保', 'ensured': '确保',
  'guarantee': '保证', 'guarantees': '保证', 'guaranteed': '保证',
  'promise': '承诺', 'promises': '承诺', 'promised': '承诺',
  'deliver': '交付', 'delivers': '交付', 'delivered': '交付',
  'ship': '运送', 'ships': '运送', 'shipped': '运送',
  'send': '发送', 'sends': '发送', 'sent': '发送',
  'receive': '接收', 'receives': '接收', 'received': '接收',
  'accept': '接受', 'accepts': '接受', 'accepted': '接受',
  'order': '订购', 'orders': '订购', 'ordered': '订购',
  'buy': '购买', 'buys': '购买', 'bought': '购买',
  'purchase': '购买', 'purchases': '购买', 'purchased': '购买',
  'sell': '销售', 'sells': '销售', 'sold': '销售',
  'pay': '支付', 'pays': '支付', 'paid': '支付',
  'charge': '收费', 'charges': '收费', 'charged': '收费',
  'cost': '花费', 'costs': '花费',
  'spend': '花费', 'spends': '花费', 'spent': '花费',
  'save': '节省', 'saves': '节省', 'saved': '节省',
  'add': '添加', 'adds': '添加', 'added': '添加',
  'remove': '移除', 'removes': '移除', 'removed': '移除',
  'delete': '删除', 'deletes': '删除', 'deleted': '删除',
  'update': '更新', 'updates': '更新', 'updated': '更新',
  'install': '安装', 'installs': '安装', 'installed': '安装',
  'connect': '连接', 'connects': '连接', 'connected': '连接',
  'disconnect': '断开', 'disconnects': '断开', 'disconnected': '断开',
  'activate': '激活', 'activates': '激活', 'activated': '激活',
  'check': '检查', 'checks': '检查', 'checked': '检查',
  'test': '测试', 'tests': '测试', 'tested': '测试',
  'show': '显示', 'shows': '显示', 'showed': '显示', 'shown': '显示',
  'display': '显示', 'displays': '显示', 'displayed': '显示',
  'indicate': '指示', 'indicates': '指示', 'indicated': '指示',
  'represent': '代表', 'represents': '代表', 'represented': '代表',
  'mean': '意思是', 'means': '意思是', 'meant': '意思是',
  'denote': '表示', 'denotes': '表示', 'denoted': '表示',
  'describe': '描述', 'describes': '描述', 'described': '描述',
  'explain': '解释', 'explains': '解释', 'explained': '解释',
  'define': '定义', 'defines': '定义', 'defined': '定义',
  'specify': '指定', 'specifies': '指定', 'specified': '指定',
  'note': '注意', 'notes': '注意', 'noted': '注意',
  'mention': '提及', 'mentions': '提及', 'mentioned': '提及',
  'state': '声明', 'states': '声明', 'stated': '声明',
  'claim': '声称', 'claims': '声称', 'claimed': '声称',
  'suggest': '建议', 'suggests': '建议', 'suggested': '建议',
  'recommend': '推荐', 'recommends': '推荐', 'recommended': '推荐',
  'consider': '考虑', 'considers': '考虑', 'considered': '考虑',
  'regard': '认为', 'regards': '认为', 'regarded': '认为',
  'believe': '相信', 'believes': '相信', 'believed': '相信',
  'suppose': '假设', 'supposes': '假设', 'supposed': '假设',
  'expect': '预期', 'expects': '预期', 'expected': '预期',
  'hope': '希望', 'hopes': '希望', 'hoped': '希望',
  'wish': '希望', 'wishes': '希望', 'wished': '希望',
  'need': '需要', 'needs': '需要', 'needed': '需要',
  'require': '需要', 'requires': '需要', 'required': '需要',
  'want': '想要', 'wants': '想要', 'wanted': '想要',
  'desire': '渴望', 'desires': '渴望', 'desired': '渴望',
  'prefer': '偏好', 'prefers': '偏好', 'preferred': '偏好',
  'like': '喜欢', 'likes': '喜欢', 'liked': '喜欢',
  'love': '喜爱', 'loves': '喜爱', 'loved': '喜爱',
  'enjoy': '享受', 'enjoys': '享受', 'enjoyed': '享受',
  'appreciate': '欣赏', 'appreciates': '欣赏', 'appreciated': '欣赏',
  'value': '重视', 'values': '重视', 'valued': '重视',
  // Adjectives
  'good': '好', 'bad': '坏', 'new': '新', 'old': '旧',
  'big': '大', 'small': '小', 'large': '大', 'little': '小',
  'long': '长', 'short': '短', 'wide': '宽', 'narrow': '窄',
  'thick': '厚', 'thin': '薄', 'heavy': '重', 'light': '轻',
  'high': '高', 'low': '低', 'tall': '高', 'deep': '深',
  'fast': '快', 'slow': '慢', 'quick': '快', 'rapid': '迅速',
  'early': '早', 'late': '晚', 'young': '年轻', 'old': '老',
  'hot': '热', 'cold': '冷', 'warm': '暖', 'cool': '凉',
  'hard': '硬', 'soft': '软', 'strong': '强', 'weak': '弱',
  'easy': '容易', 'difficult': '困难', 'hard': '困难', 'simple': '简单',
  'complex': '复杂', 'complicated': '复杂',
  'clear': '清晰', 'obvious': '明显', 'evident': '明显', 'apparent': '明显',
  'important': '重要', 'significant': '重要', 'critical': '关键', 'crucial': '关键',
  'necessary': '必要', 'essential': '必要', 'required': '必需', 'needed': '需要',
  'possible': '可能', 'impossible': '不可能', 'likely': '可能', 'unlikely': '不太可能',
  'available': '可用', 'unavailable': '不可用', 'accessible': '可访问',
  'capable': '能够', 'able': '能够', 'unable': '无法',
  'ready': '准备好', 'prepared': '准备', 'set': '设置',
  'free': '免费', 'busy': '忙', 'active': '活跃', 'inactive': '不活跃',
  'open': '打开', 'closed': '关闭', 'full': '满', 'empty': '空',
  'complete': '完整', 'incomplete': '不完整', 'whole': '整个', 'entire': '整个',
  'total': '总', 'partial': '部分',
  'main': '主要', 'primary': '主要', 'secondary': '次要', 'key': '关键',
  'central': '中心', 'core': '核心', 'basic': '基础', 'fundamental': '基本',
  'additional': '额外', 'extra': '额外', 'further': '进一步', 'other': '其他',
  'different': '不同', 'same': '相同', 'similar': '相似', 'various': '各种',
  'specific': '特定', 'particular': '特定', 'general': '一般', 'common': '常见',
  'special': '特殊', 'unique': '独特', 'rare': '稀有', 'common': '普通',
  'standard': '标准', 'normal': '正常', 'regular': '常规', 'typical': '典型',
  'average': '平均', 'ordinary': '普通',
  'professional': '专业', 'amateur': '业余',
  'official': '官方', 'unofficial': '非官方', 'original': '原装', 'genuine': '正品',
  'new': '新', 'latest': '最新', 'recent': '最近', 'current': '当前',
  'previous': '之前', 'prior': '先前', 'former': '前者', 'latter': '后者',
  'first': '第一', 'last': '最后', 'next': '下一个', 'previous': '上一个',
  'following': '以下', 'above': '上述', 'below': '以下',
  'top': '顶部', 'bottom': '底部', 'upper': '上部', 'lower': '下部',
  'left': '左', 'right': '右', 'middle': '中', 'center': '中心',
  'front': '前', 'back': '后', 'rear': '后', 'side': '侧',
  'inner': '内', 'outer': '外', 'internal': '内部', 'external': '外部',
  'inside': '内部', 'outside': '外部', 'indoor': '室内', 'outdoor': '室外',
  'positive': '正', 'negative': '负', 'neutral': '中性',
  'safe': '安全', 'unsafe': '不安全', 'dangerous': '危险', 'secure': '安全',
  'effective': '有效', 'efficient': '高效', 'powerful': '强大',
  'advanced': '先进', 'modern': '现代', 'state-of-the-art': '最先进',
  'improved': '改进', 'enhanced': '增强', 'upgraded': '升级',
  'updated': '更新', 'new': '新', 'innovative': '创新',
  'reliable': '可靠', 'durable': '耐用', 'stable': '稳定', 'robust': '坚固',
  'flexible': '灵活', 'versatile': '多功能', 'adaptable': '适应性强',
  'compact': '紧凑', 'portable': '便携', 'lightweight': '轻便',
  'foldable': '可折叠', 'collapsible': '可折叠',
  'waterproof': '防水', 'dustproof': '防尘', 'shockproof': '防震',
  'compatible': '兼容', 'incompatible': '不兼容',
  'suitable': '适合', 'appropriate': '适当', 'ideal': '理想', 'perfect': '完美',
  'excellent': '优秀', 'outstanding': '杰出', 'superior': '优越', 'premium': '优质',
  'great': '伟大', 'wonderful': '精彩', 'fantastic': '极好', 'amazing': '惊人',
  'incredible': '难以置信', 'impressive': '令人印象深刻', 'remarkable': '非凡',
  'exceptional': '卓越', 'extraordinary': '非凡', 'phenomenal': '惊人',
  'good': '好', 'nice': '好', 'fine': '好', 'decent': '不错',
  'bad': '坏', 'poor': '差', 'terrible': '糟糕', 'awful': '可怕',
  'true': '真', 'false': '假', 'correct': '正确', 'incorrect': '不正确',
  'right': '正确', 'wrong': '错误', 'accurate': '准确', 'inaccurate': '不准确',
  // Nouns commonly seen
  'thing': '事物', 'things': '事物', 'something': '某物', 'anything': '任何物', 'nothing': '无物',
  'person': '人', 'people': '人们', 'man': '男人', 'woman': '女人', 'child': '孩子',
  'way': '方式', 'ways': '方式', 'method': '方法', 'methods': '方法',
  'time': '时间', 'times': '次', 'day': '天', 'days': '天',
  'year': '年', 'years': '年', 'month': '月', 'week': '周',
  'hour': '小时', 'hours': '小时', 'minute': '分钟', 'minutes': '分钟',
  'second': '秒', 'seconds': '秒',
  'place': '地方', 'places': '地方', 'area': '区域', 'areas': '区域',
  'part': '部分', 'parts': '部分', 'piece': '件', 'pieces': '件',
  'item': '项目', 'items': '项目', 'unit': '单位', 'units': '单位',
  'number': '数量', 'numbers': '数量', 'amount': '金额', 'quantity': '数量',
  'level': '级别', 'levels': '级别', 'stage': '阶段', 'stages': '阶段',
  'step': '步骤', 'steps': '步骤', 'phase': '阶段', 'phases': '阶段',
  'process': '过程', 'processes': '过程', 'procedure': '程序', 'procedures': '程序',
  'system': '系统', 'systems': '系统', 'device': '设备', 'devices': '设备',
  'equipment': '设备', 'tool': '工具', 'tools': '工具',
  'product': '产品', 'products': '产品', 'model': '型号', 'models': '型号',
  'brand': '品牌', 'brands': '品牌', 'category': '分类', 'categories': '分类',
  'price': '价格', 'prices': '价格', 'cost': '成本', 'costs': '成本',
  'order': '订单', 'orders': '订单', 'payment': '支付', 'payments': '支付',
  'delivery': '配送', 'shipping': '运送', 'shipment': '发货',
  'stock': '库存', 'availability': '可用性', 'presence': '存在',
  'warranty': '保修', 'guarantee': '保证', 'service': '服务', 'services': '服务',
  'support': '支持', 'help': '帮助', 'assistance': '协助',
  'feature': '特性', 'features': '特性', 'function': '功能', 'functions': '功能',
  'option': '选项', 'options': '选项', 'setting': '设置', 'settings': '设置',
  'mode': '模式', 'modes': '模式', 'type': '类型', 'types': '类型',
  'kind': '种类', 'kinds': '种类', 'sort': '种类', 'sorts': '种类',
  'version': '版本', 'versions': '版本', 'edition': '版本', 'releases': '发布',
  'quality': '质量', 'performance': '性能', 'specification': '规格', 'specifications': '规格',
  'spec': '规格', 'specs': '规格', 'parameter': '参数', 'parameters': '参数',
  'characteristic': '特征', 'characteristics': '特征', 'property': '属性', 'properties': '属性',
  'attribute': '属性', 'attributes': '属性',
  'advantage': '优势', 'advantages': '优势', 'benefit': '好处', 'benefits': '好处',
  'disadvantage': '劣势', 'disadvantages': '劣势', 'drawback': '缺点', 'drawbacks': '缺点',
  'issue': '问题', 'issues': '问题', 'problem': '问题', 'problems': '问题',
  'solution': '解决方案', 'solutions': '解决方案', 'result': '结果', 'results': '结果',
  'effect': '效果', 'effects': '效果', 'impact': '影响', 'impacts': '影响',
  'reason': '原因', 'reasons': '原因', 'cause': '原因', 'causes': '原因',
  'factor': '因素', 'factors': '因素', 'aspect': '方面', 'aspects': '方面',
  'point': '点', 'points': '点', 'element': '元素', 'elements': '元素',
  'component': '组件', 'components': '组件', 'module': '模块', 'modules': '模块',
  'technology': '技术', 'technologies': '技术', 'technique': '技术', 'techniques': '技术',
  'application': '应用', 'applications': '应用', 'use': '使用', 'usage': '用法',
  'purpose': '目的', 'purposes': '目的', 'goal': '目标', 'goals': '目标',
  'task': '任务', 'tasks': '任务', 'mission': '任务', 'missions': '任务',
  'project': '项目', 'projects': '项目', 'plan': '计划', 'plans': '计划',
  'review': '评论', 'reviews': '评论', 'rating': '评分', 'ratings': '评分',
  'description': '描述', 'information': '信息', 'info': '信息', 'details': '详情',
  'image': '图像', 'images': '图像', 'picture': '图片', 'pictures': '图片',
  'photo': '照片', 'photos': '照片', 'video': '视频', 'videos': '视频',
  'battery': '电池', 'batteries': '电池', 'charger': '充电器', 'charge': '充电',
  'camera': '相机', 'cameras': '相机', 'lens': '镜头', 'lenses': '镜头',
  'sensor': '传感器', 'sensors': '传感器', 'motor': '电机', 'motors': '电机',
  'propeller': '螺旋桨', 'propellers': '螺旋桨', 'controller': '控制器', 'controllers': '控制器',
  'antenna': '天线', 'antennas': '天线', 'gimbal': '云台',
  'range': '范围', 'distance': '距离', 'speed': '速度', 'height': '高度',
  'weight': '重量', 'size': '尺寸', 'dimension': '尺寸', 'dimensions': '尺寸',
  'length': '长度', 'width': '宽度', 'depth': '深度', 'thickness': '厚度',
  'capacity': '容量', 'voltage': '电压', 'current': '电流', 'power': '功率',
  'frequency': '频率', 'band': '频段', 'channel': '通道', 'channels': '通道',
  'signal': '信号', 'signals': '信号', 'transmission': '传输',
  'resolution': '分辨率', 'pixel': '像素', 'pixels': '像素',
  'frame': '帧', 'frames': '帧', 'fps': 'fps',
  'format': '格式', 'codec': '编解码器', 'bitrate': '码率',
  'storage': '存储', 'memory': '内存', 'card': '卡', 'slot': '插槽',
  'port': '端口', 'ports': '端口', 'cable': '线缆', 'connector': '连接器',
  'flight': '飞行', 'flying': '飞行', 'drone': '无人机', 'drones': '无人机',
  'quadcopter': '四轴飞行器', 'quadcopters': '四轴飞行器',
  'obstacle': '障碍物', 'obstacles': '障碍物', 'avoidance': '避障',
  'collision': '碰撞', 'collisions': '碰撞', 'impact': '冲击', 'impacts': '冲击',
  'detection': '检测', 'recognition': '识别', 'tracking': '跟踪',
  'return': '返回', 'home': ' home', 'landing': '降落', 'takeoff': '起飞',
  'hover': '悬停', 'follow': '跟随', 'waypoint': '航点', 'orbit': '环绕',
  'panorama': '全景', 'timelapse': '延时', 'hyperlapse': '移动延时',
  'active track': '智能跟随', 'APAS': 'APAS', 'RTH': '返航',
  'cinematic': '电影', 'sport': '运动', 'normal': '正常', 'beginner': '新手',
  'package': '套装', 'combo': '套装', 'kit': '套件', 'set': '套',
  'fly more': '畅飞', 'standard': '标准', 'premium': '高级', 'basic': '基础',
  // Words from the specific description
  'order': '订购', 'quadcopter': '四轴飞行器', 'low': '低', 'price': '价格',
  'conquered': '征服', 'market': '市场', 'drone': '无人机', 'expanse': '广阔',
  'opportunities': '机会', 'pleasantly': '令人愉快', 'impress': '印象深刻',
  'functionality': '功能性', 'attribute': '归因于', 'first': '首先',
  'three-camera': '三相机', 'system': '系统', 'create': '创作', 'amazing': '精彩',
  'footage': '画面', 'sky': '天空', 'transmit': '传输', 'incredible': '惊人',
  'image': '图像', 'quality': '画质', 'enjoys': '享有', 'great': '极大',
  'popularity': '人气', 'film': '电影', 'industry': '行业',
  'distance': '距离', 'video': '视频', 'signal': '信号', 'transmission': '传输',
  'is': '是', 'impressive': '令人印象深刻', 'km': '公里',
  'following': '以下', 'advantage': '优势', 'presence': '配备',
  'obstacle': '障碍', 'avoidance': '规避', 'includes': '包括', '8': '8',
  'sensors': '传感器', 'different': '不同', 'sides': '侧面', 'AI': 'AI',
  'technology': '技术', 'thanks': '凭借', 'this': '这', 'can': '可以',
  'avoid': '避免', 'unwanted': '不必要', 'collisions': '碰撞', 'impacts': '撞击',
  'ensure': '确保', 'safety': '安全', 'your': '您的', 'device': '设备',
  'increased': '增加', 'flight': '飞行', 'time': '时间', 'large': '大',
  'capacity': '容量', 'battery': '电池', 'allows': '让', 'fly': '飞行',
  'up': '达', 'to': '到', '55': '55', 'minutes': '分钟', 'without': '无需',
  'replacement': '更换', 'enough': '足够', 'complete': '完成', 'all': '所有',
  'set': '设定', 'tasks': '任务',
  'technical': '技术', 'specifications': '规格', 'three': '三', 'camera': '相机',
  'gimbal': '云台', 'different': '不同', 'focal': '焦距', 'distances': '距离',
  'two': '两', 'which': '其中', 'telephoto': '长焦', 'lenses': '镜头',
  'support': '支持', 'encoding': '编码', 'AppleProRes': 'Apple ProRes',
  'simplifies': '简化', 'editing': '编辑', 'FinalCutPro': 'Final Cut Pro',
  'upgraded': '升级', 'obstacle': '障碍', 'sensing': '感知', 'APAS': 'APAS',
  'video': '视频', 'transmission': '图传', 'system': '系统', 'O3': 'O3',
  '最远': '最远', '15': '15', 'km': '公里', 'V': 'V', 'resolution': '分辨率',
  '1080p': '1080p', '60fps': '60fps',
  'battery': '电池', 'type': '类型', 'LiPo': '锂聚合物', '4S': '4S',
  'capacity': '容量', '5000': '5000', 'mAh': 'mAh', 'voltage': '电压',
  '15.4': '15.4', 'charging': '充电', 'temperature': '温度', '5': '5',
  '40': '40', 'storage': '存储', 'card': '卡', 'support': '支持', 'up': '最高',
  '934.8': '934.8', 'GB': 'GB', 'max': '最大', 'horizontal': '水平',
  'speed': '速度', '21': '21', 'm/s': 'm/s', 'max': '最大', 'altitude': '高度',
  '6000': '6000', 'm': '米', 'max': '最大', 'vertical': '垂直', '8': '8',
  'operating': '工作', 'temperature': '温度', '-10': '-10', 'FOV': '视角',
  '83': '83', 'degrees': '度', 'operating': '工作', 'time': '时间',
  'package': '套装', 'options': '选项', 'Cine': 'Cine', 'Premium': '高级',
  'Combo': '套装', 'Fly': '畅飞', 'More': '更多', 'DJI': 'DJI', 'RC': 'RC',
  'Pro': 'Pro', 'no': '无', 'remote': '遥控器', 'standard': '标准',
  'weight': '重量', 'dimensions': '尺寸', 'matrix': '矩阵', 'size': '尺寸',
  '4/3': '4/3', 'CMOS': 'CMOS',
  // Additional verb forms
  'let us': '让我们', 'let': '让',
  'us': '我们',
  'order now': '立即订购', 'order': '订购',
  'buy now': '立即购买',
  'shop now': '立即选购',
  'learn more': '了解更多',
  'see more': '查看更多',
  'read more': '阅读更多',
  'view details': '查看详情',
  'in stock': '有货', 'out of stock': '缺货',
  'worldwide': '全球', 'delivery': '配送',
  'certified': '认证', 'supplier': '供应商',
  'bulk': '批量', 'discount': '折扣',
  'related': '相关', 'products': '产品',
  'description': '描述', 'specifications': '规格',
  'shipping': '配送', 'payment': '支付',

  // Additional missing words
  'pleasure': '乐趣', 'online': '在线', 'store': '商店', 'due': '由于',
  'housing': '机身', 'oneself': '自身', 'AI': 'AI',
  'compact': '紧凑', 'herself': '她自己', 'himself': '他自己',
  'themselves': '他们自己', 'itself': '本身',
  'she': '它', 'her': '它的',
  'due to': '由于', 'thanks to': '多亏', 'first of all': '首先',
  'technical specifications': '技术规格', 'flight time': '飞行时间',
  'obstacle avoidance': '避障', 'return to home': '一键返航',
  'online store': '网店', 'three-camera': '三摄',
  'video transmission': '图传', 'image quality': '画质',
  'effective pixels': '有效像素', 'field of view': '视场角',
  'focal length': '焦距', 'telephoto lens': '长焦镜头',
  'Hasselblad': '哈苏', 'Cine': 'Cine', 'Premium': '高级',
  'Fly More Combo': '畅飞套装', 'Standard': '标准版',
  'max': '最大', 'min': '最小', 'up to': '高达',
}

// English → Chinese phrase replacements (ordered by length desc)
const enZhPhrases: Array<[string, string]> = [
  ['DJI Mavic 3 Pro Fly More Combo', 'DJI 御 3 Pro 畅飞套装'],
  ['DJI Mavic 3 Pro', 'DJI 御 3 Pro'],
  ['DJI Mavic 3', 'DJI 御 3'],
  ['DJI Mavic', 'DJI 御'],
  ['DJI Matrice', 'DJI 经纬'],
  ['DJI Phantom', 'DJI 精灵'],
  ['DJI Inspire', 'DJI 悟'],
  ['DJI Mini', 'DJI Mini'],
  ['DJI Air', 'DJI Air'],
  ['DJI Avata', 'DJI Avata'],
  ['Fly More Combo', '畅飞套装'],
  ['DJI RC', 'DJI RC'],
  ['DJI RC Pro', 'DJI RC Pro'],
  ['DJI RC-N1', 'DJI RC-N1'],
  ['Mavic 3 Pro', '御 3 Pro'],
  ['Mavic 3', '御 3'],
  ['Mavic', '御'],
  ['Matrice', '经纬'],
  ['Phantom', '精灵'],
  ['Inspire', '悟'],
  ['flight time up to', '飞行时间长达'],
  ['up to 55 minutes', '长达55分钟'],
  ['up to 15 km', '最远15公里'],
  ['up to 12 km', '最远12公里'],
  ['triple camera system', '三摄系统'],
  ['three cameras', '三摄'],
  ['obstacle avoidance', '避障'],
  ['obstacle avoidance system', '避障系统'],
  ['APAS 5.0', 'APAS 5.0'],
  ['O3 video transmission', 'O3图传'],
  ['O3+ transmission', 'O3+图传'],
  ['O3 transmission', 'O3图传'],
  ['video transmission', '图传'],
  ['video transmitter', '图传发射器'],
  ['flight controller', '飞控'],
  ['brushless motor', '无刷电机'],
  ['brushless motors', '无刷电机'],
  ['for quadcopters', '四轴飞行器用'],
  ['for drones', '无人机用'],
  ['for FPV', 'FPV用'],
  ['with thermal camera', '带热成像相机'],
  ['with camera', '带相机'],
  ['with GPS', '带GPS'],
  ['long range', '长距离'],
  ['long-range', '长距离'],
  ['high performance', '高性能'],
  ['high quality', '高品质'],
  ['high-capacity battery', '大容量电池'],
  ['radio controller', '遥控器'],
  ['power distribution', '电源分配'],
  ['battery charger', '充电器'],
  ['propeller set', '螺旋桨套装'],
  ['set of', '套装'],
  ['pack of', '包装'],
  ['Apple ProRes', 'Apple ProRes'],
  ['Final Cut Pro X', 'Final Cut Pro X'],
  ['Hasselblad camera', '哈苏相机'],
  ['Hasselblad', '哈苏'],
  ['optical zoom', '光学变焦'],
  ['digital zoom', '数字变焦'],
  ['focal length', '焦距'],
  ['field of view', '视场角'],
  ['battery capacity', '电池容量'],
  ['battery type', '电池类型'],
  ['battery voltage', '电池电压'],
  ['charging time', '充电时间'],
  ['operating temperature', '工作温度'],
  ['maximum speed', '最大速度'],
  ['horizontal speed', '水平速度'],
  ['vertical speed', '垂直速度'],
  ['flight altitude', '飞行高度'],
  ['takeoff weight', '起飞重量'],
  ['max takeoff weight', '最大起飞重量'],
  ['maximum payload', '最大负载'],
  ['operating frequency', '工作频率'],
  ['memory card', '存储卡'],
  ['microSD card', 'microSD卡'],
  ['carbon fiber', '碳纤维'],
  ['landing gear', '起落架'],
  ['power supply', '电源'],
  ['return to home', '一键返航'],
  ['GPS module', 'GPS模块'],
  ['barometer', '气压计'],
  ['gyroscope', '陀螺仪'],
  ['accelerometer', '加速度计'],
  ['LiPo battery', '锂聚合物电池'],
  ['Li-ion battery', '锂离子电池'],
  ['Type-C', 'Type-C'],
  ['HDMI', 'HDMI'],
  ['USB', 'USB'],
  ['Bluetooth', '蓝牙'],
  ['Wi-Fi', 'Wi-Fi'],
]

function translateEnToZh(text: string): string {
  if (!text) return text
  let result = text

  // 1. Exact dictionary lookup
  const trimmed = result.trim()
  if (enZhDictionary[trimmed]) return enZhDictionary[trimmed]

  // 2. Phrase replacements (longest first)
  const sortedPhrases = [...enZhPhrases].sort((a, b) => b[0].length - a[0].length)
  for (const [en, zh] of sortedPhrases) {
    const regex = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    result = result.replace(regex, zh)
  }

  // 3. Word-by-word translation for remaining English words
  // Sort dictionary keys by length desc to match multi-word entries first
  const sortedWords = Object.entries(enZhDictionary)
    .filter(([k]) => k.length > 1 && /^[a-zA-Z\s-]+$/.test(k))
    .sort((a, b) => b[0].length - a[0].length)

  for (const [en, zh] of sortedWords) {
    const regex = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    result = result.replace(regex, zh)
  }

  // 4. Remove English articles (no equivalent in Chinese) and translate common function words
  result = result
    .replace(/\bthe\b/gi, '')
    .replace(/\ba\b/gi, '')
    .replace(/\ban\b/gi, '')
    .replace(/\byou\b/gi, '您')
    .replace(/\byour\b/gi, '您的')
    .replace(/\byours\b/gi, '您的')
    .replace(/\bhe\b/gi, '其')
    .replace(/\bshe\b/gi, '其')
    .replace(/\bit\b/gi, '其')
    .replace(/\bits\b/gi, '其')
    .replace(/\bthey\b/gi, '其')
    .replace(/\bthem\b/gi, '其')
    .replace(/\btheir\b/gi, '其')
    .replace(/\btheirs\b/gi, '其')
    .replace(/\bwe\b/gi, '我们')
    .replace(/\bour\b/gi, '我们的')
    .replace(/\bus\b/gi, '我们')
    .replace(/\bmy\b/gi, '我的')
    .replace(/\bme\b/gi, '我')
    .replace(/\bhim\b/gi, '其')
    .replace(/\bher\b/gi, '其')
    .replace(/\bhis\b/gi, '其')
    .replace(/\bhers\b/gi, '其')
    .replace(/\bI\b/g, '我')
    .replace(/\bthis\b/gi, '此')
    .replace(/\bthat\b/gi, '该')
    .replace(/\bthese\b/gi, '这些')
    .replace(/\bthose\b/gi, '那些')
    .replace(/\bwhich\b/gi, '其')
    .replace(/\bwho\b/gi, '其')
    .replace(/\bwhom\b/gi, '其')
    .replace(/\bwhose\b/gi, '其')
    .replace(/\bwhere\b/gi, '其中')
    .replace(/\bwhen\b/gi, '当')
    .replace(/\bof\b/gi, '的')
    .replace(/\bfrom\b/gi, '从')
    .replace(/\bwith\b/gi, '带')
    .replace(/\bwithout\b/gi, '无')
    .replace(/\bfor\b/gi, '用于')
    .replace(/\bto\b/gi, '到')
    .replace(/\bat\b/gi, '在')
    .replace(/\bin\b/gi, '在')
    .replace(/\bon\b/gi, '在')
    .replace(/\bby\b/gi, '由')
    .replace(/\bas\b/gi, '作为')
    .replace(/\bthan\b/gi, '比')
    .replace(/\bthen\b/gi, '然后')
    .replace(/\bso\b/gi, '因此')
    .replace(/\bif\b/gi, '如果')
    .replace(/\bbecause\b/gi, '因为')
    .replace(/\bwhile\b/gi, '当')
    .replace(/\bthrough\b/gi, '通过')
    .replace(/\bduring\b/gi, '期间')
    .replace(/\bbefore\b/gi, '前')
    .replace(/\bafter\b/gi, '后')
    .replace(/\babove\b/gi, '上')
    .replace(/\bbelow\b/gi, '下')
    .replace(/\bbetween\b/gi, '之间')
    .replace(/\bamong\b/gi, '之中')
    .replace(/\babout\b/gi, '约')
    .replace(/\bover\b/gi, '超过')
    .replace(/\bunder\b/gi, '以下')
    .replace(/\bwithin\b/gi, '内')
    .replace(/\bwill\b/gi, '将')
    .replace(/\bwould\b/gi, '将')
    .replace(/\bcan\b/gi, '可')
    .replace(/\bcould\b/gi, '可')
    .replace(/\bmay\b/gi, '可能')
    .replace(/\bmight\b/gi, '可能')
    .replace(/\bshould\b/gi, '应')
    .replace(/\bmust\b/gi, '必须')
    .replace(/\bhave\b/gi, '有')
    .replace(/\bhas\b/gi, '有')
    .replace(/\bhad\b/gi, '曾有')
    .replace(/\bbe\b/gi, '是')
    .replace(/\bbeen\b/gi, '是')
    .replace(/\bbeing\b/gi, '是')
    .replace(/\bdo\b/gi, '做')
    .replace(/\bdoes\b/gi, '做')
    .replace(/\bdid\b/gi, '做了')
    .replace(/\bare\b/gi, '是')
    .replace(/\bam\b/gi, '是')
    .replace(/\bwas\b/gi, '曾是')
    .replace(/\bwere\b/gi, '曾是')
    .replace(/\bnot\b/gi, '不')
    .replace(/\bno\b/gi, '无')
    .replace(/\byes\b/gi, '是')
    .replace(/\band\b/gi, '和')
    .replace(/\bor\b/gi, '或')
    .replace(/\bbut\b/gi, '但')
    .replace(/\bhowever\b/gi, '然而')
    .replace(/\btherefore\b/gi, '因此')
    .replace(/\balso\b/gi, '也')
    .replace(/\bonly\b/gi, '仅')
    .replace(/\bjust\b/gi, '仅')
    .replace(/\bvery\b/gi, '非常')
    .replace(/\btoo\b/gi, '太')
    .replace(/\bmore\b/gi, '更')
    .replace(/\bmost\b/gi, '最')
    .replace(/\bless\b/gi, '较少')
    .replace(/\bleast\b/gi, '最少')
    .replace(/\bmuch\b/gi, '多')
    .replace(/\bmany\b/gi, '多')
    .replace(/\bfew\b/gi, '少')
    .replace(/\ball\b/gi, '所有')
    .replace(/\beach\b/gi, '每个')
    .replace(/\bevery\b/gi, '每个')
    .replace(/\bsome\b/gi, '一些')
    .replace(/\bany\b/gi, '任何')
    .replace(/\bboth\b/gi, '两者都')
    .replace(/\beither\b/gi, '任一')
    .replace(/\bneither\b/gi, '两者都不')
    .replace(/\bnone\b/gi, '无')
    .replace(/\bother\b/gi, '其他')
    .replace(/\banother\b/gi, '另一')
    .replace(/\bsame\b/gi, '相同')
    .replace(/\bdifferent\b/gi, '不同')
    .replace(/\bsuch\b/gi, '此类')
    .replace(/\bhere\b/gi, '此处')
    .replace(/\bthere\b/gi, '此处')
    .replace(/\bnow\b/gi, '现在')
    .replace(/\bthen\b/gi, '然后')
    .replace(/\balways\b/gi, '始终')
    .replace(/\bnever\b/gi, '从不')
    .replace(/\boften\b/gi, '通常')
    .replace(/\bsometimes\b/gi, '有时')
    .replace(/\busually\b/gi, '通常')
    .replace(/\balready\b/gi, '已')
    .replace(/\bstill\b/gi, '仍')
    .replace(/\byet\b/gi, '尚未')
    .replace(/\bever\b/gi, '曾经')
    .replace(/\bagain\b/gi, '再次')
    .replace(/\bonce\b/gi, '一次')
    .replace(/\btwice\b/gi, '两次')
    .replace(/\bup\b/gi, '上')
    .replace(/\bdown\b/gi, '下')
    .replace(/\bout\b/gi, '出')
    .replace(/\boff\b/gi, '关')
    .replace(/\bon\b/gi, '开')
    .replace(/\bover\b/gi, '过')
    .replace(/\baway\b/gi, '离开')
    .replace(/\bback\b/gi, '回')
    .replace(/\bforward\b/gi, '前')
    .replace(/\bstraight\b/gi, '直')
    .replace(/\bwell\b/gi, '好')
    .replace(/\bbetter\b/gi, '更好')
    .replace(/\bbest\b/gi, '最佳')
    .replace(/\bworse\b/gi, '更差')
    .replace(/\bworst\b/gi, '最差')
    .replace(/\beven\b/gi, '甚至')
    .replace(/\bquite\b/gi, '相当')
    .replace(/\brather\b/gi, '相当')
    .replace(/\balmost\b/gi, '几乎')
    .replace(/\bnearly\b/gi, '几乎')
    .replace(/\babout\b/gi, '约')
    .replace(/\baround\b/gi, '约')
    .replace(/\bapproximately\b/gi, '约')
    .replace(/\bexactly\b/gi, '精确')
    .replace(/\bprecisely\b/gi, '精确')
    .replace(/\breally\b/gi, '真的')
    .replace(/\bactually\b/gi, '实际上')
    .replace(/\bbasically\b/gi, '基本上')
    .replace(/\bessentially\b/gi, '本质上')
    .replace(/\bgenerally\b/gi, '一般')
    .replace(/\busually\b/gi, '通常')
    .replace(/\bespecially\b/gi, '特别')
    .replace(/\bparticularly\b/gi, '尤其')
    .replace(/\bincluding\b/gi, '包括')
    .replace(/\bexcept\b/gi, '除了')
    .replace(/\bdespite\b/gi, '尽管')
    .replace(/\balthough\b/gi, '虽然')
    .replace(/\bthough\b/gi, '虽然')
    .replace(/\bsince\b/gi, '因为')
    .replace(/\buntil\b/gi, '直到')
    .replace(/\bunless\b/gi, '除非')
    .replace(/\bwhether\b/gi, '是否')
    .replace(/\beither\b/gi, '要么')
    .replace(/\bneither\b/gi, '既不')
    .replace(/\bnor\b/gi, '也不')
    .replace(/\bboth\b/gi, '既')
    .replace(/\bonly\b/gi, '只')
    .replace(/\bjust\b/gi, '就')
    .replace(/\bsimply\b/gi, '只需')
    .replace(/\bmerely\b/gi, '仅仅')
    .replace(/\bhow\b/gi, '如何')
    .replace(/\bwhat\b/gi, '什么')
    .replace(/\bwhy\b/gi, '为何')
    .replace(/\bwhen\b/gi, '何时')
    .replace(/\bwhere\b/gi, '何处')
    .replace(/\bwhich\b/gi, '哪个')
    .replace(/\bwho\b/gi, '谁')
    .replace(/\bwhom\b/gi, '谁')
    .replace(/\bwhose\b/gi, '谁的')
    .replace(/\bcan\b/gi, '能')
    .replace(/\bcannot\b/gi, '不能')
    .replace(/\bwill\b/gi, '会')
    .replace(/\bwon't\b/gi, '不会')
    .replace(/\bshall\b/gi, '将')
    .replace(/\bshould\b/gi, '应该')
    .replace(/\bought\b/gi, '应该')
    .replace(/\bneed\b/gi, '需要')
    .replace(/\bdare\b/gi, '敢')
    .replace(/\bused\b/gi, '过去')
    .replace(/\bget\b/gi, '获得')
    .replace(/\bgets\b/gi, '获得')
    .replace(/\bgot\b/gi, '获得')
    .replace(/\bgotten\b/gi, '获得')
    .replace(/\bmake\b/gi, '使')
    .replace(/\bmakes\b/gi, '使')
    .replace(/\bmade\b/gi, '使')
    .replace(/\blet\b/gi, '让')
    .replace(/\blets\b/gi, '让')
    .replace(/\bhelp\b/gi, '帮助')
    .replace(/\bhelps\b/gi, '帮助')
    .replace(/\bhelped\b/gi, '帮助')
    .replace(/\bkeep\b/gi, '保持')
    .replace(/\bkeeps\b/gi, '保持')
    .replace(/\bkept\b/gi, '保持')
    .replace(/\bput\b/gi, '放')
    .replace(/\bsets\b/gi, '设置')
    .replace(/\bset\b/gi, '设置')
    .replace(/\bbring\b/gi, '带来')
    .replace(/\bbrings\b/gi, '带来')
    .replace(/\bbrought\b/gi, '带来')
    .replace(/\btake\b/gi, '取')
    .replace(/\btakes\b/gi, '取')
    .replace(/\btook\b/gi, '取')
    .replace(/\btaken\b/gi, '取')
    .replace(/\bcome\b/gi, '来')
    .replace(/\bcomes\b/gi, '来')
    .replace(/\bcame\b/gi, '来')
    .replace(/\bgo\b/gi, '去')
    .replace(/\bgoes\b/gi, '去')
    .replace(/\bwent\b/gi, '去')
    .replace(/\bgone\b/gi, '去')
    .replace(/\bsee\b/gi, '见')
    .replace(/\bsees\b/gi, '见')
    .replace(/\bsaw\b/gi, '见')
    .replace(/\bseen\b/gi, '见')
    .replace(/\bknow\b/gi, '知道')
    .replace(/\bknows\b/gi, '知道')
    .replace(/\bknew\b/gi, '知道')
    .replace(/\bknown\b/gi, '已知')
    .replace(/\bthink\b/gi, '认为')
    .replace(/\bthinks\b/gi, '认为')
    .replace(/\bthought\b/gi, '认为')
    .replace(/\blook\b/gi, '看')
    .replace(/\blooks\b/gi, '看')
    .replace(/\bwant\b/gi, '想要')
    .replace(/\bwants\b/gi, '想要')
    .replace(/\bgive\b/gi, '给')
    .replace(/\bgives\b/gi, '给')
    .replace(/\bgave\b/gi, '给')
    .replace(/\bgiven\b/gi, '给')
    .replace(/\buse\b/gi, '使用')
    .replace(/\buses\b/gi, '使用')
    .replace(/\bused\b/gi, '使用')
    .replace(/\bfind\b/gi, '找到')
    .replace(/\bfinds\b/gi, '找到')
    .replace(/\bfound\b/gi, '找到')
    .replace(/\btell\b/gi, '告诉')
    .replace(/\btells\b/gi, '告诉')
    .replace(/\btold\b/gi, '告诉')
    .replace(/\bask\b/gi, '问')
    .replace(/\basks\b/gi, '问')
    .replace(/\bwork\b/gi, '工作')
    .replace(/\bworks\b/gi, '工作')
    .replace(/\bworked\b/gi, '工作')
    .replace(/\bseem\b/gi, '似乎')
    .replace(/\bseems\b/gi, '似乎')
    .replace(/\bseemed\b/gi, '似乎')
    .replace(/\bfeel\b/gi, '感觉')
    .replace(/\bfeels\b/gi, '感觉')
    .replace(/\bfelt\b/gi, '感觉')
    .replace(/\btry\b/gi, '尝试')
    .replace(/\btries\b/gi, '尝试')
    .replace(/\btried\b/gi, '尝试')
    .replace(/\bleave\b/gi, '离开')
    .replace(/\bleaves\b/gi, '离开')
    .replace(/\bleft\b/gi, '离开')
    .replace(/\bcall\b/gi, '呼叫')
    .replace(/\bcalls\b/gi, '呼叫')
    .replace(/\bcalled\b/gi, '称为')
    .replace(/\binto\b/gi, '到')
    .replace(/\bonto\b/gi, '到')
    .replace(/\bupon\b/gi, '在')
    .replace(/\bper\b/gi, '每')
    .replace(/\bvia\b/gi, '通过')
    .replace(/\bversus\b/gi, '对比')
    .replace(/\bvs\b/gi, '对比')
    .replace(/\betc\b/gi, '等')
    .replace(/\beg\b/gi, '例如')
    .replace(/\bie\b/gi, '即')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/^\s+|\s+$/g, '')
    .replace(/\s+/g, ' ')

  return result
}

// ============================================================
// English → Japanese / German / Polish core dictionaries
// (Key drone/B2B terms; untranslated terms remain in English, which is common in international B2B)
// ============================================================
const enJaDictionary: Record<string, string> = {
  'Quadcopter': 'クワッドコプター',
  'Drone': 'ドローン',
  'UAV': '無人機',
  'Battery': 'バッテリー',
  'Charger': '充電器',
  'Propeller': 'プロペラ',
  'Motor': 'モーター',
  'Camera': 'カメラ',
  'Gimbal': 'ジンバル',
  'Controller': 'コントローラー',
  'Antenna': 'アンテナ',
  'Frame': 'フレーム',
  'ESC': 'ESC',
  'GPS': 'GPS',
  'Module': 'モジュール',
  'Cable': 'ケーブル',
  'Sensor': 'センサー',
  'Landing gear': 'ランディングギア',
  'Power station': 'ポータブル電源',
  'For enterprises': '企業向け',
  'Industrial': '産業用',
  'In Stock': '在庫あり',
  'Add to Cart': 'カートに追加',
  'Request Quote': '見積依頼',
  'Description': '説明',
  'Specifications': '仕様',
  'Categories': 'カテゴリー',
}

const enDeDictionary: Record<string, string> = {
  'Quadcopter': 'Quadrokopter',
  'Drone': 'Drohne',
  'UAV': 'UAV',
  'Battery': 'Akku',
  'Charger': 'Ladegerät',
  'Propeller': 'Propeller',
  'Motor': 'Motor',
  'Camera': 'Kamera',
  'Gimbal': 'Gimbal',
  'Controller': 'Controller',
  'Antenna': 'Antenne',
  'Frame': 'Rahmen',
  'ESC': 'ESC',
  'GPS': 'GPS',
  'Module': 'Modul',
  'Cable': 'Kabel',
  'Sensor': 'Sensor',
  'Landing gear': 'Fahrwerk',
  'Power station': 'Tragbare Powerstation',
  'For enterprises': 'Für Unternehmen',
  'Industrial': 'Industriell',
  'In Stock': 'Auf Lager',
  'Add to Cart': 'In den Warenkorb',
  'Request Quote': 'Angebot anfordern',
  'Description': 'Beschreibung',
  'Specifications': 'Spezifikationen',
  'Categories': 'Kategorien',
}

const enPlDictionary: Record<string, string> = {
  'Quadcopter': 'Kwadrokopter',
  'Drone': 'Dron',
  'UAV': 'UAV',
  'Battery': 'Akumulator',
  'Charger': 'Ładowarka',
  'Propeller': 'Śmigło',
  'Motor': 'Silnik',
  'Camera': 'Kamera',
  'Gimbal': 'Gimbal',
  'Controller': 'Kontroler',
  'Antenna': 'Antena',
  'Frame': 'Rama',
  'ESC': 'ESC',
  'GPS': 'GPS',
  'Module': 'Moduł',
  'Cable': 'Kabel',
  'Sensor': 'Czujnik',
  'Landing gear': 'Podwozie',
  'Power station': 'Stacja zasilania',
  'For enterprises': 'Dla przedsiębiorstw',
  'Industrial': 'Przemysłowy',
  'In Stock': 'W magazynie',
  'Add to Cart': 'Dodaj do koszyka',
  'Request Quote': 'Zapytaj o wycenę',
  'Description': 'Opis',
  'Specifications': 'Specyfikacje',
  'Categories': 'Kategorie',
}

function translateEnToLang(text: string, lang: LanguageCode): string {
  if (!text) return text
  let dict: Record<string, string> = {}
  if (lang === 'ja') dict = enJaDictionary
  else if (lang === 'de') dict = enDeDictionary
  else if (lang === 'pl') dict = enPlDictionary
  else return text

  let result = text
  const trimmed = result.trim()
  if (dict[trimmed]) return dict[trimmed]

  // Word-by-word for known terms
  const sortedWords = Object.entries(dict)
    .filter(([k]) => k.length > 1)
    .sort((a, b) => b[0].length - a[0].length)

  for (const [en, translated] of sortedWords) {
    const regex = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    result = result.replace(regex, translated)
  }

  return result
}

// ============================================================
// Main translation function
// ============================================================
export function translateText(text: string, lang: LanguageCode): string {
  if (text === null || text === undefined) return ''
  if (typeof text !== 'string') return String(text)
  if (!text) return text
  if (lang === 'ru') return text

  // Step 1: Russian → English
  const english = translateRussianToEnglish(text)

  // Step 2: English → target language
  if (lang === 'zh') {
    return translateEnToZh(english)
  }
  if (lang === 'ja' || lang === 'de' || lang === 'pl') {
    return translateEnToLang(english, lang)
  }
  // For French, Spanish, Indonesian, Danish, Serbian, Kazakh, Urdu, Arabic - return English for product content
  // UI strings are fully translated, product technical terms stay in English (common in B2B)
  return english
}

// Translate product description HTML (preserves tags)
export function translateDescription(html: string, lang: LanguageCode): string {
  if (!html) return html
  if (lang === 'ru') return html

  // If content has no HTML tags, treat as plain text
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(html)
  if (!hasHtmlTags) {
    return translateText(html, lang)
  }

  // Step 1: Russian → English HTML
  const englishHtml = translateRussianHtml(html)

  // Step 2: For languages with dictionary support, translate text nodes
  if (lang === 'zh' || lang === 'ja' || lang === 'de' || lang === 'pl') {
    let result = englishHtml
    // Translate text between > and <
    result = result.replace(/>([^<]+)</g, (match, text) => {
      const trimmed = text.trim()
      if (!trimmed) return match
      if (!/[a-zA-Z]/.test(trimmed)) return match
      if (/^[\d\s\W.,;:!?()\[\]{}'"\/\\-]+$/.test(trimmed)) return match
      const translated = lang === 'zh' ? translateEnToZh(trimmed) : translateEnToLang(trimmed, lang)
      return '>' + text.replace(trimmed, translated) + '<'
    })
    // Translate alt/title attributes
    result = result.replace(/(alt|title)="([^"]*[a-zA-Z][^"]*)"/g, (match, attr, text) => {
      const translated = lang === 'zh' ? translateEnToZh(text) : translateEnToLang(text, lang)
      return `${attr}="${translated}"`
    })

    // Final safety net: translate any remaining English words in text nodes
    if (lang === 'zh') {
      result = result.replace(/>([^<]*[a-zA-Z][^<]*)</g, (match, text) => {
        // Skip if it looks like it contains HTML tags or is just a URL
        if (/<[^>]+>/.test(text) || /^https?:\/\//.test(text.trim())) return match
        const translated = translateEnToZh(text)
        return '>' + translated + '<'
      })
    }

    return result
  }

  return englishHtml
}

// Get language from URL or cookie
export function getLanguageFromPath(pathname: string): LanguageCode {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0] as LanguageCode
  if (firstSegment && languages.some(l => l.code === firstSegment)) {
    return firstSegment
  }
  return defaultLanguage
}

// Get path without language prefix
export function getPathWithoutLang(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  if (segments[0] && languages.some(l => l.code === segments[0])) {
    return '/' + segments.slice(1).join('/')
  }
  return pathname
}
