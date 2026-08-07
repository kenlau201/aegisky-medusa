/**
 * Application Areas rich content for 9 use cases
 * Each area has: id, slug, icon, color, translations (en/ru/zh)
 */
export interface ApplicationArea {
  id: number;
  slug: string;
  icon: string;
  color: string;
  gradient: string;
  name: { en: string; ru: string; zh: string };
  tagline: { en: string; ru: string; zh: string };
  description: { en: string; ru: string; zh: string };
  configurations: { en: string[]; ru: string[]; zh: string[] };
  useCases: { en: string[]; ru: string[]; zh: string[] };
  value: { en: string[]; ru: string[]; zh: string[] };
}

export const applicationAreas: ApplicationArea[] = [
  {
    id: 1407,
    slug: 'military_purpose',
    icon: '🛡️',
    color: 'bg-red-50 text-red-600 border-red-200',
    gradient: 'from-red-900 via-slate-900 to-red-950',
    name: { en: 'Military & Defense', ru: 'Военного назначения', zh: '军事国防' },
    tagline: {
      en: 'Tactical UAV systems for reconnaissance, surveillance and combat operations',
      ru: 'Тактические БПЛА для разведки, наблюдения и боевых задач',
      zh: '用于侦察、监视和作战任务的战术无人机系统'
    },
    description: {
      en: 'Military-grade drone systems engineered for the most demanding operational environments. Our defense-grade UAVs deliver real-time intelligence, surveillance, target acquisition, and reconnaissance (ISTAR) capabilities with encrypted communications, thermal imaging, and extended flight endurance. From fixed-wing long-range platforms to FPV strike drones, every system is built for reliability under electronic warfare conditions and extreme temperatures.',
      ru: 'БПЛА военного класса, разработанные для самых требовательных условий эксплуатации. Наши дроны оборонного назначения обеспечивают разведку, наблюдение, целеуказание и рекогносцировку в реальном времени с шифрованной связью, тепловизионными камерами и увеличенной продолжительностью полёта. От самолётных платформ дальнего действия до FPV-ударных дронов — каждая система создана для надёжной работы в условиях РЭБ и экстремальных температур.',
      zh: '军用级无人机系统，专为最严苛的作战环境而设计。我们的国防级无人机提供实时情报、监视、目标获取和侦察（ISTAR）能力，配备加密通信、热成像和超长续航。从远程固定翼平台到FPV攻击无人机，每一套系统都能在电子战环境和极端温度下可靠运行。'
    },
    configurations: {
      en: [
        'Fixed-wing long-range reconnaissance UAVs (50-200 km range)',
        'Thermal imaging & dual EO/IR camera gimbals',
        'Encrypted digital data links (AES-256)',
        'FPV strike drones with payload release',
        'Ground control stations with mission planning',
        'Anti-jamming GPS & inertial navigation',
        'Night vision & IR beacon systems'
      ],
      ru: [
        'Самолётные БПЛА дальней разведки (50-200 км)',
        'Тепловизионные и двойные EO/IR подвесы',
        'Шифрованные цифровые каналы (AES-256)',
        'FPV-дроны ударные со сбросом нагрузки',
        'Наземные пункты управления с планированием',
        'Антиджамминг GPS и инерциальная навигация',
        'Системы ночного видения и ИК-маяки'
      ],
      zh: [
        '固定翼远程侦察无人机（50-200公里航程）',
        '热成像和双光电/红外云台相机',
        '加密数字数据链（AES-256）',
        'FPV攻击无人机（带投掷装置）',
        '带任务规划的地面控制站',
        '抗干扰GPS和惯性导航',
        '夜视和红外信标系统'
      ]
    },
    useCases: {
      en: [
        'Battlefield reconnaissance & situational awareness',
        'Artillery fire correction & target designation',
        'Border patrol & perimeter security',
        'Convoy protection & route reconnaissance',
        'Search and destroy FPV operations',
        'Electronic warfare & signals intelligence'
      ],
      ru: [
        'Разведка поля боя и осведомлённость',
        'Корректировка артиллерийского огня',
        'Охрана границ и периметра',
        'Защита конвоев и разведка маршрутов',
        'FPV-операции "найти и уничтожить"',
        'Радиоэлектронная борьба и РЭР'
      ],
      zh: [
        '战场侦察和态势感知',
        '炮兵射击校正和目标指示',
        '边境巡逻和周界安全',
        '车队保护和路线侦察',
        'FPV搜索和打击行动',
        '电子战和信号情报'
      ]
    },
    value: {
      en: [
        'Combat-proven platforms with 95%+ mission readiness',
        'Rapid deployment — airborne in under 3 minutes',
        'All-weather, day/night operational capability',
        'Interoperable with NATO-standard C4ISR systems',
        'Cost-effective force multiplication without pilot risk'
      ],
      ru: [
        'Проверенные в бою платформы, готовность 95%+',
        'Быстрое развёртывание — взлёт за 3 минуты',
        'Всепогодность, день/ночь',
        'Совместимость с системами C4ISR НАТО',
        'Эффективное усиление без риска для пилота'
      ],
      zh: [
        '经过实战验证的平台，任务准备率95%以上',
        '快速部署——3分钟内升空',
        '全天候、昼夜作战能力',
        '与北约C4ISR标准系统互操作',
        '高性价比的力量倍增器，无飞行员风险'
      ]
    }
  },
  {
    id: 1403,
    slug: 'industrial_work',
    icon: '🏭',
    color: 'bg-orange-50 text-orange-600 border-orange-200',
    gradient: 'from-orange-900 via-slate-900 to-amber-950',
    name: { en: 'Industrial Inspection', ru: 'Промышленные работы', zh: '工业巡检' },
    tagline: {
      en: 'Aerial inspection solutions for energy, construction and infrastructure',
      ru: 'Воздушная инспекция для энергетики, строительства и инфраструктуры',
      zh: '面向能源、建筑和基础设施的空中巡检解决方案'
    },
    description: {
      en: 'Industrial drone systems for infrastructure inspection, monitoring, and maintenance. From power line and pipeline patrol to construction site progress tracking and tower inspection, our UAVs deliver high-resolution imagery, thermal data, and LiDAR point clouds that reduce inspection costs by up to 80% while improving worker safety by eliminating the need for dangerous climbs and close approaches.',
      ru: 'Промышленные БПЛА для инспекции, мониторинга и обслуживания инфраструктуры. От патрулирования ЛЭП и трубопроводов до контроля хода строительства и инспекции вышек — наши дроны обеспечивают изображение высокого разрешения, тепловые данные и лидарные облака точек, снижая затраты на инспекцию до 80% и повышая безопасность, исключая опасные подъёмы и сближения.',
      zh: '工业无人机系统用于基础设施巡检、监控和维护。从电力线和管道巡护到施工进度跟踪和塔架检查，我们的无人机提供高分辨率影像、热数据和激光雷达点云，可将巡检成本降低高达80%，同时消除危险攀爬和近距离接近，提升工人安全。'
    },
    configurations: {
      en: [
        'Matrice 300/350 RTK class enterprise platforms',
        '45MP photogrammetry & 640×512 thermal cameras',
        'LiDAR sensors for 3D point cloud mapping',
        '15-55 minute flight time per battery',
        'RTK centimeter-level positioning',
        'IP55 weather resistance for harsh environments',
        'AI-powered defect detection software'
      ],
      ru: [
        'Платформы класса Matrice 300/350 RTK',
        '45Мп фотограмметрия и 640×512 тепловизоры',
        'LiDAR для 3D-карт облаков точек',
        '15-55 минут полёта на аккумуляторе',
        'RTK позиционирование сантиметровой точности',
        'Защита IP55 для суровых условий',
        'ПО с ИИ для обнаружения дефектов'
      ],
      zh: [
        'Matrice 300/350 RTK级企业平台',
        '4500万像素摄影测量和640×512热成像相机',
        '激光雷达传感器用于3D点云测绘',
        '每块电池15-55分钟续航',
        'RTK厘米级定位',
        'IP55防护等级适应恶劣环境',
        'AI驱动的缺陷检测软件'
      ]
    },
    useCases: {
      en: [
        'Power line & transmission tower inspection',
        'Oil & gas pipeline leak detection',
        'Solar panel thermal defect scanning',
        'Wind turbine blade inspection',
        'Construction progress documentation',
        'Bridge & dam structural assessment',
        'Mining stockpile volume calculation'
      ],
      ru: [
        'Инспекция ЛЭП и опор',
        'Поиск утечек нефтегазопроводов',
        'Тепловая дефектоскопия солнечных панелей',
        'Инспекция лопастей ветрогенераторов',
        'Документирование хода строительства',
        'Оценка мостов и плотин',
        'Объём насыпей в карьерах'
      ],
      zh: [
        '电力线和输电塔巡检',
        '油气管道泄漏检测',
        '太阳能板热缺陷扫描',
        '风力发电机叶片检查',
        '施工进度记录',
        '桥梁和大坝结构评估',
        '矿山堆场体积计算'
      ]
    },
    value: {
      en: [
        '80% cost reduction vs. traditional inspection methods',
        '10x faster data collection over manual surveys',
        'Eliminate working-at-height risks',
        'Digital twin creation for asset management',
        'Regulatory-compliant reporting built-in'
      ],
      ru: [
        'Снижение затрат на 80% против традиционных методов',
        'Сбор данных в 10 раз быстрее ручных обследований',
        'Исключение работ на высоте',
        'Создание цифровых двойников',
        'Отчётность по нормативам из коробки'
      ],
      zh: [
        '相比传统巡检方法成本降低80%',
        '数据采集速度是人工测量的10倍',
        '消除高空作业风险',
        '创建数字孪生用于资产管理',
        '内置合规报告功能'
      ]
    }
  },
  {
    id: 1405,
    slug: 'cartography',
    icon: '🗺️',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    gradient: 'from-blue-900 via-slate-900 to-indigo-950',
    name: { en: 'Mapping & Cartography', ru: 'Картография', zh: '测绘制图' },
    tagline: {
      en: 'High-precision aerial mapping and 3D modeling for surveying professionals',
      ru: 'Высокоточная аэросъёмка и 3D-моделирование для геодезистов',
      zh: '面向测绘专业人士的高精度航空测绘和3D建模'
    },
    description: {
      en: 'Professional aerial mapping solutions delivering survey-grade accuracy for cartography, urban planning, and land management. Our mapping drones equipped with RTK/PPK systems produce orthomosaics, digital elevation models, and 3D textured meshes with centimeter-level precision. Whether you need cadastral surveys, corridor mapping, or large-scale topographic mapping, our integrated drone-to-software workflow delivers production-ready geospatial data.',
      ru: 'Профессиональные решения для аэросъёмки с точностью геодезического класса для картографии, градостроительства и землеустройства. Наши картографические БПЛА с RTK/PPK создают ортофотопланы, ЦМР и 3D-текстурные модели сантиметровой точности. Для кадастровых работ, коридорной съёмки или крупномасштабной топографии — наш интегрированный рабочий процесс выдаёт готовые геоданные.',
      zh: '专业航空测绘解决方案，为制图、城市规划和土地管理提供测量级精度。我们的测绘无人机配备RTK/PPK系统，可生成厘米级精度的正射影像、数字高程模型和3D纹理网格。无论您需要地籍测量、走廊测绘还是大比例尺地形测绘，我们的无人机到软件一体化工作流都能交付可直接使用的地理空间数据。'
    },
    configurations: {
      en: [
        'Phantom 4 RTK / Wingtra VTOL mapping drones',
        '20MP mechanical shutter global cameras',
        'RTK/PPK centimeter-accurate positioning',
        'Multi-spectrum sensors for vegetation analysis',
        'GCP-free PPK processing capability',
        'Up to 400 hectares per flight coverage',
        'Compatible with Pix4D, DJI Terra, ArcGIS'
      ],
      ru: [
        'Phantom 4 RTK / Wingtra VTOL картографы',
        '20Мп камеры с глобальным затвором',
        'RTK/PPK сантиметровая точность',
        'Мультиспектральные сенсоры для растительности',
        'Обработка PPK без опорных точек',
        'До 400 гектаров за полёт',
        'Совместимость с Pix4D, DJI Terra, ArcGIS'
      ],
      zh: [
        'Phantom 4 RTK / Wingtra垂直起降测绘无人机',
        '2000万像素机械快门全局相机',
        'RTK/PPK厘米级定位',
        '多光谱传感器用于植被分析',
        '无需像控点的PPK处理能力',
        '单次飞行覆盖高达400公顷',
        '兼容Pix4D、DJI Terra、ArcGIS'
      ]
    },
    useCases: {
      en: [
        'Topographic mapping & contour generation',
        'Cadastral & boundary surveys',
        'Urban planning & development monitoring',
        'Road & railway corridor mapping',
        'Forest inventory & vegetation analysis',
        'Flood modeling & watershed analysis',
        'Archaeological site documentation'
      ],
      ru: [
        'Топосъёмка и построение горизонталей',
        'Кадастровые и межевые работы',
        'Градпланирование и мониторинг застройки',
        'Съёмка коридоров дорог и ЖД',
        'Лесоустройство и анализ растительности',
        'Моделирование паводков и водосборов',
        'Документирование археологических памятников'
      ],
      zh: [
        '地形测绘和等高线生成',
        '地籍和边界测量',
        '城市规划和开发监控',
        '公路铁路走廊测绘',
        '森林资源调查和植被分析',
        '洪水建模和流域分析',
        '考古遗址记录'
      ]
    },
    value: {
      en: [
        'Survey-grade accuracy: 1-3 cm horizontal, 3-5 cm vertical',
        '10x faster than traditional total station surveys',
        'Reduced field crew requirements — 1 operator',
        'Direct export to CAD/GIS formats',
        'Repeat surveys for change detection & monitoring'
      ],
      ru: [
        'Точность: 1-3 см план, 3-5 см высота',
        'В 10 раз быстрее тахеометрии',
        'Один оператор вместо бригады',
        'Экспорт в CAD/GIS напрямую',
        'Повторные съёмки для мониторинга'
      ],
      zh: [
        '测量级精度：平面1-3厘米，高程3-5厘米',
        '比传统全站仪测量快10倍',
        '减少现场人员需求——仅需1名操作员',
        '直接导出CAD/GIS格式',
        '可重复测量用于变化检测和监控'
      ]
    }
  },
  {
    id: 1404,
    slug: 'geodesy',
    icon: '📐',
    color: 'bg-teal-50 text-teal-600 border-teal-200',
    gradient: 'from-teal-900 via-slate-900 to-cyan-950',
    name: { en: 'Geodesy & Surveying', ru: 'Геодезия', zh: '大地测量' },
    tagline: {
      en: 'Precision surveying instruments and UAV-based geodetic solutions',
      ru: 'Высокоточные геодезические приборы и БПЛА-решения',
      zh: '精密测量仪器和无人机大地测量解决方案'
    },
    description: {
      en: 'Complete geodesy solutions combining traditional survey instruments with UAV-based data collection. From GNSS receivers and total stations to drone-based LiDAR and photogrammetry, we provide the full toolkit for engineering geodesy, construction staking, deformation monitoring, and control network establishment. Our integrated approach ensures millimeter-level accuracy where it matters and centimeter-level efficiency at scale.',
      ru: 'Комплексные геодезические решения, сочетающие традиционные приборы с БПЛА-съёмкой. От GNSS-приёмников и тахеометров до дронов с LiDAR и фотограмметрией — полный инструментарий для инженерной геодезии, выноса осей, мониторинга деформаций и создания опорных сетей. Наш подход обеспечивает миллиметровую точность и сантиметровую эффективность в масштабе.',
      zh: '完整的大地测量解决方案，将传统测量仪器与无人机数据采集相结合。从GNSS接收机和全站仪到无人机激光雷达和摄影测量，我们为工程测量、施工放样、变形监测和控制网建立提供全套工具。我们的集成方法在关键位置确保毫米级精度，在大范围内实现厘米级效率。'
    },
    configurations: {
      en: [
        'Multi-band GNSS RTK receivers (GPS/GLONASS/Galileo/BeiDou)',
        'Robotic total stations with auto-tracking',
        'Drone LiDAR systems (up to 500m range)',
        'Digital levels & barcode staffs',
        'Ground penetrating radar integration',
        'Deformation monitoring prisms & software',
        'Coordinate transformation & adjustment software'
      ],
      ru: [
        'Многодиапазонные GNSS RTK приёмники',
        'Роботизированные тахеометры с автосопровождением',
        'Дрон-LiDAR (до 500 м дальность)',
        'Цифровые нивелиры и штрих-рейки',
        'Георадарное интегрирование',
        'Призмы и ПО для мониторинга деформаций',
        'ПО трансформации и уравнивания координат'
      ],
      zh: [
        '多频GNSS RTK接收机（GPS/GLONASS/伽利略/北斗）',
        '自动跟踪机器人全站仪',
        '无人机激光雷达系统（高达500米射程）',
        '数字水准仪和条码尺',
        '探地雷达集成',
        '变形监测棱镜和软件',
        '坐标转换和平差软件'
      ]
    },
    useCases: {
      en: [
        'Engineering surveys for construction projects',
        'Control network establishment & densification',
        'Deformation monitoring of dams & buildings',
        'Tunnel & underground surveying',
        'Cadastral surveying & land registration',
        'Hydrographic & bathymetric surveys',
        'Mining survey & volume calculations'
      ],
      ru: [
        'Инженерные изыскания для строительства',
        'Создание и сгущение опорных сетей',
        'Мониторинг деформаций плотин и зданий',
        'Тоннельная и подземная съёмка',
        'Кадастровая съёмка и учёт земель',
        'Гидрографическая и батиметрическая съёмка',
        'Маркшейдерия и подсчёт объёмов'
      ],
      zh: [
        '建筑工程测量',
        '控制网建立和加密',
        '大坝和建筑变形监测',
        '隧道和地下测量',
        '地籍测量和土地登记',
        '水文和水深测量',
        '矿山测量和体积计算'
      ]
    },
    value: {
      en: [
        'Millimeter-level precision for critical measurements',
        'Integrated workflow: field to finish in one suite',
        'Reduced rework and survey errors',
        'Compliant with GOST/ISO survey standards',
        'Scalable from single-point to corridor-wide surveys'
      ],
      ru: [
        'Миллиметровая точность критичных измерений',
        'Комплексный процесс: от поля до отчёта',
        'Снижение переделок и ошибок',
        'Соответствие ГОСТ/ISO',
        'Масштабируемость от точки до коридора'
      ],
      zh: [
        '关键测量毫米级精度',
        '一体化工作流：从外业到成图',
        '减少返工和测量错误',
        '符合GOST/ISO测量标准',
        '从单点到走廊级测量可扩展'
      ]
    }
  },
  {
    id: 1401,
    slug: 'rescue_operations',
    icon: '🚁',
    color: 'bg-pink-50 text-pink-600 border-pink-200',
    gradient: 'from-pink-900 via-slate-900 to-rose-950',
    name: { en: 'Search & Rescue', ru: 'Спасательные операции', zh: '搜救救援' },
    tagline: {
      en: 'Life-saving drone systems for emergency response and disaster relief',
      ru: 'Спасательные БПЛА для экстренного реагирования и ликвидации ЧС',
      zh: '用于应急响应和救灾的救生无人机系统'
    },
    description: {
      en: 'Emergency response drone systems designed to save lives in critical situations. Equipped with thermal cameras, spotlights, loudspeakers, and payload delivery mechanisms, our SAR drones provide rapid aerial overwatch in the golden hour after disasters. From missing person searches to flood rescue and wildfire monitoring, these systems deliver real-time situational awareness to incident commanders when every minute counts.',
      ru: 'БПЛА экстренного реагирования для спасения жизней в критических ситуациях. Тепловизоры, прожекторы, громкоговорители, механизмы доставки — наши поисково-спасательные дроны обеспечивают быстрое воздушное патрулирование в "золотой час" после ЧС. От поиска пропавших до спасения на наводнениях и мониторинга лесных пожаров — системы передают оперативную обстановку командирам, когда важна каждая минута.',
      zh: '专为紧急情况下拯救生命而设计的应急响应无人机系统。配备热成像相机、探照灯、扬声器和物资投放装置，我们的搜救无人机在灾害发生后的黄金时间提供快速空中监视。从失踪人员搜索到洪水救援和野火监测，这些系统在每一分钟都至关重要的时刻为现场指挥官提供实时态势感知。'
    },
    configurations: {
      en: [
        'Thermal/visible dual-sensor camera gimbals',
        'High-intensity LED searchlights (1500+ lumens)',
        'Long-range loudspeaker & PA systems',
        'Emergency supply delivery winch (up to 5kg)',
        'Life vest & flotation device drops',
        '45+ minute endurance with swappable batteries',
        'Real-time video streaming to command center',
        'IP55+ weather resistance for storm conditions'
      ],
      ru: [
        'Тепловизионные/видимые двойные подвесы',
        'Мощные LED-прожекторы (1500+ люмен)',
        'Дальнобойные громкоговорители',
        'Лебёдка доставки грузов (до 5 кг)',
        'Сброс спасательных жилетов',
        '45+ минут полёта, сменные АКБ',
        'Потоковое видео в штаб в реальном времени',
        'IP55+ для штормовых условий'
      ],
      zh: [
        '热成像/可见光双传感器云台相机',
        '高强度LED探照灯（1500流明以上）',
        '远程扬声器和广播系统',
        '应急物资投放绞盘（高达5公斤）',
        '救生衣和漂浮装置投放',
        '45分钟以上续航，可更换电池',
        '实时视频流传输到指挥中心',
        'IP55以上防护等级适应暴风雨天气'
      ]
    },
    useCases: {
      en: [
        'Missing person search in difficult terrain',
        'Flood & swift water rescue operations',
        'Wildfire perimeter mapping & hotspot detection',
        'Earthquake collapse victim location',
        'Avalanche & mountain rescue',
        'Law enforcement tactical overwatch',
        'Post-disaster damage assessment'
      ],
      ru: [
        'Поиск пропавших в сложной местности',
        'Спасение на наводнениях и быстрой воде',
        'Картирование пожаров и очагов',
        'Поиск жертв землетрясений',
        'Лавинная и горная спасслужба',
        'Тактическое наблюдение правопорядка',
        'Оценка ущерба после ЧС'
      ],
      zh: [
        '复杂地形失踪人员搜索',
        '洪水和急流救援行动',
        '野火边界测绘和热点检测',
        '地震坍塌受害者定位',
        '雪崩和山地救援',
        '执法战术监视',
        '灾后损失评估'
      ]
    },
    value: {
      en: [
        'Deployed in under 60 seconds from vehicle',
        'Thermal detection of persons at 500m+ range',
        'Reduces search area coverage time by 90%',
        '24/7 all-weather operational readiness',
        'Interoperable with emergency service comms'
      ],
      ru: [
        'Развёртывание за 60 секунд из автомобиля',
        'Тепловизионное обнаружение с 500м+',
        'Сокращение времени поиска на 90%',
        'Круглосуточная всепогодная готовность',
        'Совместимость со связью экстренных служб'
      ],
      zh: [
        '从车辆部署不到60秒即可升空',
        '500米以上热成像人员检测',
        '搜索区域覆盖时间减少90%',
        '全天候24/7待命',
        '与应急服务通信系统互操作'
      ]
    }
  },
  {
    id: 1406,
    slug: 'agriculture',
    icon: '🌾',
    color: 'bg-green-50 text-green-600 border-green-200',
    gradient: 'from-green-900 via-slate-900 to-emerald-950',
    name: { en: 'Agriculture & Farming', ru: 'Сельское хозяйство', zh: '农业植保' },
    tagline: {
      en: 'Precision agriculture drones for crop monitoring, spraying and analysis',
      ru: 'Дроны точного земледелия для мониторинга, опрыскивания и анализа',
      zh: '用于作物监测、喷洒和分析的精准农业无人机'
    },
    description: {
      en: 'Agricultural drone systems transforming modern farming through precision agriculture. Our agri-drones perform multispectral crop health analysis, targeted spraying, and field mapping to help farmers reduce input costs by 30% while increasing yields. From small family farms to large agribusiness operations, our solutions provide actionable crop intelligence and automated treatment capabilities.',
      ru: 'Сельскохозяйственные БПЛА, преобразующие современное земледелие через точное земледелие. Наши агро-дроны проводят мультиспектральный анализ состояния культур, точечное опрыскивание и картирование полей, снижая затраты на 30% и повышая урожайность. От небольших ферм до крупных агрохолдингов — наши решения дают применимую аналитику и автоматизированную обработку.',
      zh: '通过精准农业改变现代农业的农业无人机系统。我们的农业无人机执行多光谱作物健康分析、精准喷洒和田地测绘，帮助农民降低30%的投入成本同时提高产量。从小型家庭农场到大型农业企业，我们的解决方案提供可操作的作物情报和自动化处理能力。'
    },
    configurations: {
      en: [
        'Multispectral cameras (RGB+RE+NIR) for NDVI analysis',
        'Spraying drones with 10-40L payload tanks',
        'Centrifugal nozzles with variable rate application',
        'RTK precision flight for repeatable routes',
        '10-30 hectare per hour spraying coverage',
        'Automated obstacle avoidance for orchards',
        'Farm management software integration'
      ],
      ru: [
        'Мультиспектральные камеры (RGB+RE+NIR) для NDVI',
        'Опрыскиватели с баками 10-40 л',
        'Центробежные форсунки с переменной нормой',
        'RTK-точность для повторяемых маршрутов',
        '10-30 га/час производительность опрыскивания',
        'Автоматический обход препятствий в садах',
        'Интеграция с ПО управления фермой'
      ],
      zh: [
        '多光谱相机（RGB+红边+近红外）用于NDVI分析',
        '10-40升药箱的喷洒无人机',
        '离心式喷头，支持变量喷洒',
        'RTK精准飞行，可重复航线',
        '每小时喷洒10-30公顷',
        '果园自动避障',
        '农场管理软件集成'
      ]
    },
    useCases: {
      en: [
        'Crop health monitoring & NDVI mapping',
        'Precision spraying of fertilizers & pesticides',
        'Plant population & emergence counting',
        'Irrigation planning & drainage analysis',
        'Yield prediction & harvest planning',
        'Pest & disease early detection',
        'Orchard & vineyard management'
      ],
      ru: [
        'Мониторинг состояния и NDVI-карты',
        'Точное внесение удобрений и СЗР',
        'Подсчёт всходов и густоты стояния',
        'Планирование полива и дренажа',
        'Прогноз урожая и сроков уборки',
        'Раннее обнаружение вредителей и болезней',
        'Управление садами и виноградниками'
      ],
      zh: [
        '作物健康监测和NDVI制图',
        '精准喷洒肥料和农药',
        '植株数量和出苗率统计',
        '灌溉规划和排水分析',
        '产量预测和收获计划',
        '病虫害早期检测',
        '果园和葡萄园管理'
      ]
    },
    value: {
      en: [
        '30% reduction in chemical usage',
        '90% water savings vs. ground spraying',
        '50x faster field scouting than walking',
        'Early stress detection 7-10 days before visible symptoms',
        'Data-driven decisions for input optimization'
      ],
      ru: [
        'Снижение расхода химикатов на 30%',
        'Экономия воды 90% против наземного опрыскивания',
        'В 50 раз быстрее обхода пешком',
        'Раннее обнаружение стресса за 7-10 дней',
        'Решения на данных для оптимизации'
      ],
      zh: [
        '化学品使用量减少30%',
        '相比地面喷洒节水90%',
        '比人工巡查快50倍',
        '比可见症状提前7-10天检测到胁迫',
        '数据驱动的投入优化决策'
      ]
    }
  },
  {
    id: 1402,
    slug: 'electrical_installation',
    icon: '⚡',
    color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    gradient: 'from-yellow-900 via-slate-900 to-amber-950',
    name: { en: 'Electrical Installation', ru: 'Электромонтаж', zh: '电气安装' },
    tagline: {
      en: 'Power line construction, stringing and maintenance with drone assistance',
      ru: 'Строительство, натяжка и обслуживание ЛЭП с помощью дронов',
      zh: '无人机辅助的电力线建设、架线和维护'
    },
    description: {
      en: 'Drone-assisted electrical installation and power line maintenance solutions. Our specialized UAVs pull pilot lines for stringing operations across difficult terrain, inspect conductors and insulators from close range, and create detailed as-built documentation. From 110kV distribution to 750kV transmission lines, these systems reduce construction time and improve worker safety by eliminating helicopter and climbing operations.',
      ru: 'Решения для электромонтажа и обслуживания ЛЭП с БПЛА. Наши специализированные дроны протягивают лидер-тросы через сложную местность, инспектируют провода и изоляторы с близкого расстояния, создают исполнительную документацию. От распределительных сетей 110кВ до ЛЭП 750кВ — системы сокращают время строительства и повышают безопасность, исключая вертолёты и подъёмы.',
      zh: '无人机辅助电气安装和电力线维护解决方案。我们的专业无人机在复杂地形中牵引导引绳进行架线作业，近距离检查导线和绝缘子，并创建详细的竣工文档。从110kV配电到750kV输电线路，这些系统通过消除直升机和攀爬作业来缩短施工时间并提高工人安全。'
    },
    configurations: {
      en: [
        'Heavy-lift drones for pilot line pulling (up to 25kg)',
        'High-zoom cameras (200x+) for insulator inspection',
        'Corona discharge UV detection cameras',
        'LiDAR for sag & clearance measurements',
        'Live-line working compatible systems',
        'GPS-guided autonomous stringing routes',
        'EMI-shielded avionics for high-voltage environments'
      ],
      ru: [
        'Тяжёлые дроны для натяжки лидера (до 25 кг)',
        'Камеры с 200x+ зумом для изоляторов',
        'УФ-камеры коронного разряда',
        'LiDAR для измерения провисов и габаритов',
        'Системы для работ под напряжением',
        'GPS-автономные маршруты натяжки',
        'Экранированная авионика для полей ВН'
      ],
      zh: [
        '用于牵引导引绳的大载重无人机（高达25公斤）',
        '200倍以上变焦相机用于绝缘子检查',
        '电晕放电紫外检测相机',
        '激光雷达用于弧垂和净空测量',
        '带电作业兼容系统',
        'GPS引导的自主架线航线',
        '高压环境EMI屏蔽航电系统'
      ]
    },
    useCases: {
      en: [
        'Pilot line pulling for transmission stringing',
        'Distribution line construction over obstacles',
        'Live-line insulator & hardware inspection',
        'Corona & partial discharge detection',
        'Vegetation encroachment monitoring',
        'Storm damage assessment & restoration',
        'Thermal hotspot detection on connections'
      ],
      ru: [
        'Протяжка лидера при монтаже ЛЭП',
        'Строительство распределительных сетей через препятствия',
        'Инспекция изоляторов и арматуры под напряжением',
        'Обнаружение короны и ЧР',
        'Мониторинг поросли в просеке',
        'Оценка ущерба после штормов',
        'Тепловой поиск дефектных соединений'
      ],
      zh: [
        '输电架线牵引导引绳',
        '跨障碍配电线路施工',
        '带电绝缘子和金具检查',
        '电晕和局部放电检测',
        '植被侵占监测',
        '风暴损坏评估和恢复',
        '连接头发热点检测'
      ]
    },
    value: {
      en: [
        '80% cost reduction vs. helicopter stringing',
        'No line outages required for inspection',
        'Worker safety — no climbing or helicopter risks',
        'Cross rivers, canyons, highways in minutes',
        'Digital as-built records for asset management'
      ],
      ru: [
        'Экономия 80% против вертолётной натяжки',
        'Инспекция без отключения линии',
        'Безопасность — без подъёмов и вертолётов',
        'Пересечение рек, каньонов, трасс за минуты',
        'Цифровые исполнительные документы'
      ],
      zh: [
        '相比直升机架线成本降低80%',
        '检查无需停电',
        '工人安全——无攀爬或直升机风险',
        '数分钟内跨越河流、峡谷、公路',
        '数字化竣工记录用于资产管理'
      ]
    }
  },
  {
    id: 1399,
    slug: 'entertainment',
    icon: '🎮',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    gradient: 'from-purple-900 via-slate-900 to-violet-950',
    name: { en: 'Entertainment & FPV', ru: 'Развлечение', zh: '娱乐FPV' },
    tagline: {
      en: 'FPV drones, racing systems and aerial cinematography for creators',
      ru: 'FPV-дроны, гоночные системы и аэросъёмка для креаторов',
      zh: '面向创作者的FPV无人机、竞速系统和航空摄影'
    },
    description: {
      en: 'Consumer and prosumer drone systems for FPV flying, drone racing, aerial photography, and cinematography. From ready-to-fly micro drones for beginners to custom-built 5-inch freestyle FPV rigs and professional cinema lifters, we carry the complete ecosystem of frames, motors, ESCs, flight controllers, VTX, cameras, and goggles. Our entertainment category serves hobbyists, racers, and content creators with the latest FPV technology.',
      ru: 'Потребительские и полупрофессиональные БПЛА для FPV-полётов, гонок, аэрофото- и видеосъёмки. От RTF-микродронов для новичков до кастомных 5-дюймовых фристайл-сетапов и профессиональных киноподъёмников — полная экосистема рам, моторов, ESC, полётных контроллеров, VTX, камер и очков. Категория развлечений обслуживает хоббистов, гонщиков и креаторов с новейшими FPV-технологиями.',
      zh: '用于FPV飞行、无人机竞速、航空摄影和电影制作的消费级和准专业无人机系统。从初学者的到手即飞微型无人机到定制5寸自由式FPV套装和专业电影级吊运机，我们提供完整的机架、电机、电调、飞控、图传、相机和眼镜生态系统。娱乐类别为爱好者、竞速者和内容创作者提供最新的FPV技术。'
    },
    configurations: {
      en: [
        'RTF micro FPV drones (1S-3S for beginners)',
        '5-inch freestyle & racing drones (4S-6S)',
        'Cinewhoop & cinelifter for cinematic FPV',
        'Analog & HD digital FPV systems (DJI/Walksnail)',
        'FPV goggles & radio controllers',
        'LiPo batteries, chargers & power systems',
        'Action cameras (GoPro/Insta360 mounting)'
      ],
      ru: [
        'RTF-микро FPV (1S-3S для начинающих)',
        '5-дюймовые фристайл и гоночные (4S-6S)',
        'Cinewhoop и cinelifter для кинематографии',
        'Аналоговые и HD-цифровые FPV (DJI/Walksnail)',
        'FPV-очки и аппы радиоуправления',
        'LiPo аккумуляторы, зарядные устройства',
        'Экшн-камеры (GoPro/Insta360)'
      ],
      zh: [
        'RTF微型FPV无人机（1S-3S初学者）',
        '5寸自由式和竞速无人机（4S-6S）',
        'Cinewhoop和电影FPV吊运机',
        '模拟和高清数字FPV系统（DJI/Walksnail）',
        'FPV眼镜和遥控器',
        'LiPo电池、充电器和电源系统',
        '运动相机（GoPro/Insta360安装）'
      ]
    },
    useCases: {
      en: [
        'FPV freestyle & acrobatic flying',
        'Drone racing leagues & competitions',
        'Cinematic FPV for film & advertising',
        'Aerial photography & content creation',
        'Indoor & whoop flying',
        'Long-range & surfing FPV',
        'STEM education & drone workshops'
      ],
      ru: [
        'FPV-фристайл и акробатика',
        'Гоночные лиги и соревнования',
        'Кинематографичный FPV для кино и рекламы',
        'Аэрофотосъёмка и создание контента',
        'Полёты в помещении и whoop',
        'Дальнобойный FPV и серфинг',
        'STEM-образование и дрон-воркшопы'
      ],
      zh: [
        'FPV自由式和特技飞行',
        '无人机竞速联盟和比赛',
        '电影和广告FPV航拍',
        '航空摄影和内容创作',
        '室内和涵道机飞行',
        '远航和冲浪FPV',
        'STEM教育和无人机工作坊'
      ]
    },
    value: {
      en: [
        'Complete ecosystem from components to RTF',
        'Latest HD digital FPV with low latency',
        'Expert support for builds & troubleshooting',
        'Same-day shipping on in-stock items',
        'Community & racing event support'
      ],
      ru: [
        'Полная экосистема от компонентов до RTF',
        'Новейший HD-цифровой FPV с низкой задержкой',
        'Экспертная поддержка сборок и проблем',
        'Отгрузка в день заказа со склада',
        'Поддержка сообщества и гонок'
      ],
      zh: [
        '从组件到RTF的完整生态',
        '最新低延迟高清数字FPV',
        '组装和故障排除专家支持',
        '现货当日发货',
        '社区和竞速活动支持'
      ]
    }
  },
  {
    id: 1400,
    slug: 'for_training',
    icon: '🎓',
    color: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    gradient: 'from-cyan-900 via-slate-900 to-sky-950',
    name: { en: 'Education & Training', ru: 'Для обучения', zh: '教育培训' },
    tagline: {
      en: 'Educational drone kits and training systems for schools and universities',
      ru: 'Образовательные наборы дронов и системы для школ и вузов',
      zh: '面向学校和大学的教育无人机套件和培训系统'
    },
    description: {
      en: 'Drone education platforms designed for STEM learning, professional pilot training, and certification preparation. From classroom coding drones that teach programming to full flight simulators and enterprise training fleets, our education solutions support K-12 STEM programs, university aerospace engineering courses, and Part 107/remote pilot certification training. Durable, safe, and curriculum-aligned.',
      ru: 'Образовательные платформы для STEM-обучения, подготовки пилотов и сертификации. От классных кодинговых дронов для программирования до авиасимуляторов и учебных парков — наши решения поддерживают STEM-программы K-12, курсы аэрокосмической инженерии вузов и подготовку к сертификации пилотов. Надёжные, безопасные, с учебной программой.',
      zh: '专为STEM学习、专业飞行员培训和认证考试设计的无人机教育平台。从教授编程的课堂编码无人机到完整飞行模拟器和企业培训机队，我们的教育解决方案支持K-12 STEM课程、大学航空航天工程课程以及Part 107/远程飞行员认证培训。耐用、安全且与课程对齐。'
    },
    configurations: {
      en: [
        'Programmable classroom drones (Python/Scratch)',
        'Drone flight simulators with realistic physics',
        'Training fleets (10-30 units) with charging cases',
        'Certification exam prep kits (Part 107 equivalent)',
        'Indoor safety cages & guard kits',
        'Curriculum materials & lesson plans',
        'Modular repair kits for hands-on learning'
      ],
      ru: [
        'Программируемые классные дроны (Python/Scratch)',
        'Авиасимуляторы с реалистичной физикой',
        'Учебные парки (10-30 ед.) с кейсами зарядки',
        'Наборы для подготовки к сертификации',
        'Защитные клетки и пропгарды для помещений',
        'Учебные материалы и планы уроков',
        'Модульные ремкомплекты для практики'
      ],
      zh: [
        '可编程课堂无人机（Python/Scratch）',
        '真实物理无人机飞行模拟器',
        '培训机队（10-30台）带充电箱',
        '认证考试准备套件（Part 107等效）',
        '室内安全笼和保护罩套件',
        '课程材料和教案',
        '模块化维修套件用于实践学习'
      ]
    },
    useCases: {
      en: [
        'K-12 STEM & robotics programs',
        'University aerospace & engineering labs',
        'Professional pilot certification training',
        'Corporate drone program onboarding',
        'Public safety UAS training academies',
        'Drone coding & programming workshops',
        'Summer camps & after-school programs'
      ],
      ru: [
        'STEM и робототехника K-12',
        'Аэрокосмические и инженерные лаборатории вузов',
        'Подготовка к сертификации пилотов',
        'Корпоративное обучение дрон-программ',
        'Академии БПЛА общественной безопасности',
        'Воркшопы по кодингу дронов',
        'Летние лагеря и кружки'
      ],
      zh: [
        'K-12 STEM和机器人项目',
        '大学航空航天和工程实验室',
        '专业飞行员认证培训',
        '企业无人机项目入职培训',
        '公共安全无人机培训学院',
        '无人机编程工作坊',
        '夏令营和课后项目'
      ]
    },
    value: {
      en: [
        'Curriculum-aligned with educational standards',
        'Durable design for student use (replacement parts available)',
        'Scalable from single classroom to district-wide',
        'Instructor training & support included',
        'Clear pathway from beginner to certified pilot'
      ],
      ru: [
        'Соответствие образовательным стандартам',
        'Прочная конструкция (есть запчасти)',
        'Масштабируемость от класса до района',
        'Обучение инструкторов и поддержка',
        'Понятный путь от новичка до сертификата'
      ],
      zh: [
        '与教育标准课程对齐',
        '耐用设计适合学生使用（提供替换零件）',
        '从单个教室到全区可扩展',
        '包含教师培训和支持',
        '从初学者到认证飞行员的清晰路径'
      ]
    }
  }
];

export function getApplicationBySlug(slug: string): ApplicationArea | undefined {
  return applicationAreas.find(a => a.slug === slug);
}

export function getApplicationById(id: number): ApplicationArea | undefined {
  return applicationAreas.find(a => a.id === id);
}
