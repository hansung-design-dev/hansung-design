'use client';

import { useState, useEffect } from 'react';
import MypageContainer from '@/src/components/mypageContainer';
import { useAuth } from '@/src/contexts/authContext';
import CustomFileUpload from '@/src/components/ui/CustomFileUpload';
import DesignSkeleton from '@/src/components/skeleton/DesignSkeleton';

interface DesignDraft {
  id: string;
  project_name?: string;
  draft_category: string;
  file_name?: string;
  created_at: string;
  is_approved: boolean;
}

interface Order {
  id: string;
  order_number: string;
  total_price: number;
  payment_status: string;
  admin_approval_status: string;
  created_at: string;
  updated_at: string;
  draft_delivery_method?: 'email' | 'upload';
  design_drafts?: DesignDraft[];
}

export default function DesignPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'view'>('upload');
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      const data = await response.json();

      if (data.success) {
        // 결제 완료된 주문만 필터링
        const completedOrders = (data.data || []).filter(
          (order: Order) => order.payment_status === 'completed'
        );
        setOrders(completedOrders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleFileUpload = async (orderId: string, file: File) => {
    try {
      setUploadingFile(orderId);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('orderId', orderId);

      const response = await fetch('/api/design-drafts/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // 업로드 성공 후 주문 목록 새로고침
        fetchOrders();
      } else {
        alert('파일 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('File upload failed:', error);
      alert('파일 업로드에 실패했습니다.');
    } finally {
      setUploadingFile(null);
    }
  };

  const getDraftStatus = (draft: DesignDraft) => {
    switch (draft.draft_category) {
      case 'initial':
        return '초기 시안';
      case 'feedback':
        return '피드백';
      case 'revision':
        return '수정 시안';
      case 'final':
        return '최종 시안';
      default:
        return '시안';
    }
  };

  const getStatusColor = (draft: DesignDraft) => {
    if (draft.is_approved) return 'text-green-600';
    if (draft.draft_category === 'final') return 'text-blue-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <MypageContainer activeTab="시안관리">
        <h1 className="text-2xl font-bold mb-8">시안 관리</h1>
        <DesignSkeleton />
      </MypageContainer>
    );
  }

  return (
    <MypageContainer activeTab="시안관리">
      <h1 className="text-2xl font-bold mb-8">시안 관리</h1>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'upload'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          시안 업로드
        </button>
        <button
          onClick={() => setActiveTab('view')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'view'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          업로드된 시안
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {activeTab === 'upload'
              ? '시안 업로드할 주문이 없습니다.'
              : '업로드된 시안이 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    주문번호: {order.order_number}
                  </h3>
                  <p className="text-gray-600">
                    주문일: {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  {order.design_drafts?.[0]?.project_name && (
                    <p className="text-blue-600 font-medium">
                      작업명: {order.design_drafts[0].project_name}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {order.total_price?.toLocaleString()}원
                  </p>
                  <p className="text-sm text-green-600 font-medium">결제완료</p>
                </div>
              </div>

              {order.draft_delivery_method === 'email' && (
                <div className="flex items-center gap-2 mt-2 mb-4">
                  <span className="text-sm text-blue-600 font-medium">
                    이메일로 보내기:
                  </span>
                  <span className="text-xs text-blue-800 px-2 py-1 rounded">
                    banner114@hanmail.net
                  </span>
                </div>
              )}

              {activeTab === 'upload' ? (
                <div className="space-y-4">
                  {/* 이메일로 보내기 신청한 경우 안내 메시지 */}
                  {order.draft_delivery_method === 'email' && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`upload-checkbox-${order.id}`}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`upload-checkbox-${order.id}`}
                          className="text-sm text-blue-700"
                        >
                          홈페이지에서도 시안 업로드하기
                        </label>
                      </div>
                    </div>
                  )}

                  {/* 커스텀 파일 업로드 */}
                  <CustomFileUpload
                    onFileSelect={(file) => handleFileUpload(order.id, file)}
                    disabled={uploadingFile === order.id}
                    placeholder="시안 파일을 선택해주세요"
                  />

                  {uploadingFile === order.id && (
                    <div className="text-center py-2">
                      <span className="text-sm text-gray-500">
                        업로드 중...
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* 업로드된 시안 목록 */}
                  {order.design_drafts && order.design_drafts.length > 0 ? (
                    order.design_drafts.map((draft) => (
                      <div
                        key={draft.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <div className="flex items-center space-x-3">
                          <span
                            className={`text-sm font-medium ${getStatusColor(
                              draft
                            )}`}
                          >
                            {getDraftStatus(draft)}
                          </span>
                          {draft.file_name && (
                            <span className="text-sm text-gray-600">
                              {draft.file_name}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(draft.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {draft.is_approved && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            승인됨
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      {order.draft_delivery_method === 'email'
                        ? '이메일로 시안이 전송되었습니다.'
                        : '업로드된 시안이 없습니다.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </MypageContainer>
  );
}
