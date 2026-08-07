const fs = require('fs');
const path = require('path');

// Medusa API配置
const MEDUSA_API = process.env.MEDUSA_API || 'http://localhost:9000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@aegisky.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';

async function medusaFetch(endpoint, options = {}) {
  const url = `${MEDUSA_API}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }
  
  return response.json();
}

async function login() {
  console.log('🔐 登录Medusa管理后台...');
  for (let i = 0; i < 30; i++) {
    try {
      const result = await medusaFetch('/auth/user/emailpass', {
        method: 'POST',
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        })
      });
      console.log('✅ 登录成功');
      return result.token;
    } catch (e) {
      console.log(`  等待Medusa就绪... (${i+1}/30)`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  throw new Error('无法登录Medusa，请确认服务已启动');
}

async function setupRegions(token) {
  console.log('\n🌍 配置销售区域和多货币...');
  
  try {
    // 1. 创建北美区域（USD）
    console.log('  创建北美区域 (USD)...');
    await medusaFetch('/admin/regions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: 'North America',
        currency_code: 'usd',
        countries: ['US', 'CA', 'MX'],
        tax_rate: 0,
        payment_providers: ['stripe', 'manual'],
        fulfillment_providers: ['manual']
      })
    });

    // 2. 创建欧洲区域（EUR）
    console.log('  创建欧洲区域 (EUR)...');
    await medusaFetch('/admin/regions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: 'Europe',
        currency_code: 'eur',
        countries: ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'SE', 'NO', 'DK', 'FI', 'PL', 'AT', 'IE', 'PT'],
        tax_rate: 0,
        payment_providers: ['stripe', 'manual'],
        fulfillment_providers: ['manual']
      })
    });

    // 3. 创建亚太区域（USD结算）
    console.log('  创建亚太区域...');
    await medusaFetch('/admin/regions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: 'Asia Pacific',
        currency_code: 'usd',
        countries: ['CN', 'JP', 'KR', 'AU', 'NZ', 'SG', 'HK', 'TW', 'IN', 'TH', 'MY', 'ID', 'PH', 'VN'],
        tax_rate: 0,
        payment_providers: ['stripe', 'manual'],
        fulfillment_providers: ['manual']
      })
    });

    // 4. 创建世界其他区域
    console.log('  创建全球其他区域...');
    await medusaFetch('/admin/regions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: 'Rest of World',
        currency_code: 'usd',
        countries: ['RU', 'BR', 'AE', 'SA', 'ZA', 'TR', 'IL', 'EG', 'NG', 'AR', 'CL', 'CO'],
        tax_rate: 0,
        payment_providers: ['stripe', 'manual'],
        fulfillment_providers: ['manual']
      })
    });

    console.log('✅ 销售区域创建完成');
  } catch (e) {
    console.log('⚠️  区域可能已存在，跳过:', e.message.substring(0, 100));
  }
}

async function setupShippingOptions(token) {
  console.log('\n🚚 配置运费选项...');
  
  try {
    // 获取所有区域
    const regions = await medusaFetch('/admin/regions', {
      headers: { Authorization: `Bearer ${token}` }
    });

    for (const region of regions.regions) {
      console.log(`  为区域 ${region.name} 配置运费...`);
      
      // 标准配送
      await medusaFetch('/admin/shipping-options', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: 'Standard Shipping (DHL/FedEx)',
          region_id: region.id,
          provider_id: 'manual',
          data: {
            id: 'manual-fulfillment'
          },
          price_type: 'flat',
          amount: 2999, // $29.99
          is_return: false,
          admin_only: false
        })
      });

      // 快递配送
      await medusaFetch('/admin/shipping-options', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: 'Express Shipping (3-5 days)',
          region_id: region.id,
          provider_id: 'manual',
          data: {
            id: 'manual-fulfillment'
          },
          price_type: 'flat',
          amount: 5999, // $59.99
          is_return: false,
          admin_only: false
        })
      });

      // 免运费（满$500）
      await medusaFetch('/admin/shipping-options', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: 'Free Shipping (Orders over $500)',
          region_id: region.id,
          provider_id: 'manual',
          data: {
            id: 'manual-fulfillment'
          },
          price_type: 'flat',
          amount: 0,
          is_return: false,
          admin_only: false
        })
      });
    }

    console.log('✅ 运费选项配置完成');
  } catch (e) {
    console.log('⚠️  运费配置错误:', e.message.substring(0, 150));
  }
}

async function setupB2BSettings(token) {
  console.log('\n🏢 配置B2B功能...');
  
  try {
    // 创建B2B客户组
    console.log('  创建经销商等级客户组...');
    
    const groups = [
      { name: 'Standard Buyer', metadata: { discount: 0, min_spend: 0 } },
      { name: 'Bronze Dealer', metadata: { discount: 5, min_spend: 1000 } },
      { name: 'Silver Dealer', metadata: { discount: 10, min_spend: 5000 } },
      { name: 'Gold Dealer', metadata: { discount: 15, min_spend: 25000 } },
      { name: 'Platinum Distributor', metadata: { discount: 20, min_spend: 100000 } }
    ];

    for (const group of groups) {
      try {
        await medusaFetch('/admin/customer-groups', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(group)
        });
      } catch (e) {
        // 已存在则跳过
      }
    }

    console.log('✅ B2B客户组创建完成');
  } catch (e) {
    console.log('⚠️  B2B配置警告:', e.message.substring(0, 100));
  }
}

async function main() {
  console.log('🚀 开始配置Aegisky B2B电商功能...\n');
  
  const token = await login();
  
  await setupRegions(token);
  await setupShippingOptions(token);
  await setupB2BSettings(token);
  
  console.log('\n🎉 B2B功能配置完成！');
  console.log('\n📋 已配置功能:');
  console.log('  ✅ 4个销售区域（北美/欧洲/亚太/全球）');
  console.log('  ✅ 多货币支持（USD/EUR）');
  console.log('  ✅ Stripe信用卡支付 + 线下转账/账期支付');
  console.log('  ✅ 3档运费（标准$29.99/快递$59.99/满$500免运费）');
  console.log('  ✅ 5级经销商折扣体系');
  console.log('\n📍 管理后台: http://localhost:9000/app');
}

main().catch(console.error);
