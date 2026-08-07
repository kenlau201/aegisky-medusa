'use client';

import { useState } from 'react';

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  // 模拟评价数据
  const reviews = [
    {
      id: 1,
      product: 'Aegisky Test Drone Pro 测试商品',
      productImage: '',
      user: 'test@aegisky.com',
      rating: 5,
      content: '产品质量很好，飞行稳定，摄像头清晰，非常满意！',
      images: [],
      time: '2026-08-07 14:30',
      status: 'pending',
      reply: ''
    },
    {
      id: 2,
      product: 'SK7200-SPI 视频模块',
      productImage: '',
      user: 'buyer***',
      rating: 4,
      content: '发货快，包装完好，测试正常，好评。',
      images: [],
      time: '2026-08-06 10:15',
      status: 'approved',
      reply: '感谢您的支持！'
    }
  ];

  const filteredReviews = activeTab === 'pending'
    ? reviews.filter(r => r.status === 'pending')
    : reviews;

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">商品评价</h1>
          <p className="text-gray-500 mt-1">管理用户评价和晒单</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          + 添加用户评价
        </button>
      </div>

      <div className="bg-white rounded-xl border">
        <div className="border-b px-4 flex gap-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-3 px-2 border-b-2 text-sm ${activeTab === 'pending' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500'}`}
          >
            待审核 <span className="ml-1 bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">1</span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-3 px-2 border-b-2 text-sm ${activeTab === 'all' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500'}`}
          >
            全部评价
          </button>
        </div>

        <div className="divide-y">
          {filteredReviews.length > 0 ? filteredReviews.map(review => (
            <div key={review.id} className="p-4 hover:bg-gray-50">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center text-gray-400">
                  📦
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-sm">{review.product}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-500">{review.user}</span>
                        {renderStars(review.rating)}
                        <span className="text-xs text-gray-400">{review.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {review.status === 'pending' ? (
                        <>
                          <button className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">通过</button>
                          <button className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">拒绝</button>
                        </>
                      ) : (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">已通过</span>
                      )}
                      <button className="text-blue-600 text-xs hover:text-blue-800">回复</button>
                      <button className="text-red-600 text-xs hover:text-red-800">删除</button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{review.content}</p>
                  {review.reply && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                      <span className="text-blue-600 font-medium">商家回复：</span>
                      {review.reply}
                    </div>
                  )}
                  {review.images.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {review.images.map((img, i) => (
                        <div key={i} className="w-16 h-16 bg-gray-100 rounded"></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center text-gray-400">暂无评价数据</div>
          )}
        </div>
      </div>
    </div>
  );
}
