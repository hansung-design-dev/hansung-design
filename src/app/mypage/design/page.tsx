'use client';

import { useState, useEffect, useCallback } from 'react';
import MypageContainer from '@/src/components/mypageContainer';
import Image from 'next/image';
import { useAuth } from '@/src/contexts/authContext';

interface DesignTab {
  name: string;
  id: string;
}

interface DesignItem {
  id: string;
  orderNumber: string;
  title: string;
  subtitle?: string;
  location: string;
  status: 'pending' | 'uploaded' | 'completed';
  uploadDate?: string;
  completionDate?: string;
  thumbnail?: string;
}

interface OrderItem {
  id: string;
  panel_info: {
    address: string;
    nickname?: string;
    panel_status: string;
    region_dong?: string;
    max_banner?: number;
    first_half_closure_quantity?: number;
    second_half_closure_quantity?: number;
  };
  slot_info: {
    slot_name: string;
    banner_type: string;
    price_unit: string;
  };
  quantity: number;
  unit_price: number;
  total_price: number;
  start_date: string;
  end_date: string;
  price_display?: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  order_date: string;
  year_month?: string;
  order_items: OrderItem[];
}

interface OrdersResponse {
  success: boolean;
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statusSummary: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
  };
  error?: string;
}

export default function DesignPage() {
  const [activeTab, setActiveTab] = useState('send');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const { user, loading: authLoading } = useAuth();

  const tabs: DesignTab[] = [
    { name: '시안 보내기', id: 'send' },
    { name: '시안 보기', id: 'view' },
  ];

  // 시안 보기 리스트 (한성디자인이 완성한 디자인들)
  const viewDesignList: DesignItem[] = [
    {
      id: '1',
      orderNumber: 'ORD-2025-001',
      title: '울림픽대교 남단사거리 앞',
      location: '방이동',
      status: 'completed',
      completionDate: '2025.01.20',
      thumbnail: '/images/digital-signage-example.jpeg',
    },
    {
      id: '2',
      orderNumber: 'ORD-2025-003',
      title: '마포구청 앞 LED게시대',
      location: '합정동',
      status: 'completed',
      completionDate: '2025.01.18',
      thumbnail: '/images/digital-signage-example.jpeg',
    },
  ];

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders?page=1&limit=50');
      const data: OrdersResponse = await response.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        console.error(data.error || '주문 내역을 불러오는데 실패했습니다.');
      }
    } catch {
      console.error('주문 내역을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      return;
    }

    fetchOrders();
  }, [user, authLoading, fetchOrders]);

  // 결제완료된 주문들을 시안 보내기용으로 변환
  const sendDesignList: DesignItem[] = orders
    .filter((order) => order.status === 'confirmed') // 결제완료된 주문만 필터링
    .flatMap((order) =>
      order.order_items.map((item, index) => ({
        id: `${order.id}-${index}`,
        orderNumber: order.order_number,
        title: item.panel_info.nickname || item.panel_info.address,
        subtitle: `(${item.slot_info.banner_type})`,
        location: item.panel_info.region_dong || item.panel_info.address,
        status: 'pending' as const, // 시안 대기 상태
      }))
    );

  const handleUploadDesign = (orderId: string) => {
    // 시안 업로드 모달 또는 페이지로 이동
    console.log('시안 업로드:', orderId);
  };

  const handleViewDesign = (orderId: string) => {
    // 시안 상세보기 페이지로 이동
    console.log('시안 보기:', orderId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
            시안 대기
          </span>
        );
      case 'uploaded':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            시안 업로드 완료
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            디자인 완성
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <MypageContainer activeTab="시안관리">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">시안관리</h1>
        <p className="text-gray-600">
          결제완료된 주문의 시안을 업로드하고 완성된 디자인을 확인할 수
          있습니다.
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border border-gray-200 rounded-lg p-1 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium text-sm transition-colors rounded-md flex-1 ${
              activeTab === tab.id
                ? 'bg-gray-800 text-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* 시안 보내기 탭 */}
      {activeTab === 'send' && (
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              시안 보내기
            </h2>
            <p className="text-sm text-gray-600">
              결제가 완료된 주문에 대해 시안을 업로드할 수 있습니다.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">주문 내역을 불러오는 중...</div>
          ) : sendDesignList.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500">업로드할 시안이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sendDesignList.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {item.title}
                          {item.subtitle && (
                            <span className="ml-1 text-gray-500 font-normal">
                              {item.subtitle}
                            </span>
                          )}
                        </h3>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        주문번호: {item.orderNumber}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        위치: {item.location}
                      </p>
                      {item.uploadDate && (
                        <p className="text-sm text-gray-500">
                          업로드일: {item.uploadDate}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleUploadDesign(item.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        item.status === 'pending'
                          ? 'bg-gray-800 text-white hover:bg-gray-900'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      disabled={item.status === 'uploaded'}
                    >
                      {item.status === 'pending'
                        ? '시안 업로드'
                        : '업로드 완료'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 시안 보기 탭 */}
      {activeTab === 'view' && (
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              시안 보기
            </h2>
            <p className="text-sm text-gray-600">
              한성디자인에서 완성한 디자인을 확인할 수 있습니다.
            </p>
          </div>

          {viewDesignList.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500">완성된 디자인이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {viewDesignList.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video bg-gray-100 relative">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <svg
                          className="w-12 h-12"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {item.title}
                        {item.subtitle && (
                          <span className="ml-1 text-gray-500 font-normal">
                            {item.subtitle}
                          </span>
                        )}
                      </h3>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      주문번호: {item.orderNumber}
                    </p>
                    <p className="text-xs text-gray-600 mb-3">
                      위치: {item.location}
                    </p>
                    {item.completionDate && (
                      <p className="text-xs text-gray-500 mb-3">
                        완성일: {item.completionDate}
                      </p>
                    )}
                    <button
                      onClick={() => handleViewDesign(item.id)}
                      className="w-full px-3 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 transition-colors"
                    >
                      디자인 보기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </MypageContainer>
  );
}
