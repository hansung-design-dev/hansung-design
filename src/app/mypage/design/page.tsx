'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import MypageContainer from '@/src/components/mypageContainer';
import { useAuth } from '@/src/contexts/authContext';
import CustomFileUpload from '@/src/components/ui/CustomFileUpload';
import DesignSkeleton from '@/src/components/skeleton/DesignSkeleton';

interface DesignDraft {
  id: string;
  project_name?: string;
  draft_category: string;
  file_name?: string;
  file_url?: string;
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
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewImageName, setPreviewImageName] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/orders?userId=${user?.id}`);
      const data = await response.json();

      if (data.orders) {
        // 결제 완료된 주문만 필터링 (completed, approved, pending, waiting_admin_approval 상태 모두 포함)
        const completedOrders = (data.orders || []).filter(
          (order: Order) =>
            order.payment_status === 'completed' ||
            order.payment_status === 'approved' ||
            order.payment_status === 'pending' ||
            order.payment_status === 'waiting_admin_approval'
        );
        console.log(
          '🔍 필터링된 주문:',
          completedOrders.length,
          completedOrders.map((o: Order) => ({
            id: o.id,
            payment_status: o.payment_status,
          }))
        );
        setOrders(completedOrders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

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

      const result = await response.json();

      if (response.ok && result.success) {
        // 업로드 성공 후 주문 목록 새로고침
        fetchOrders();
      } else {
        alert(result.error || '파일 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('File upload failed:', error);
      alert('파일 업로드 중 오류가 발생했습니다.');
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

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">시안 업로드할 주문이 없습니다.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border-solid border-1 border-gray-200 rounded-lg p-6 bg-white shadow-sm"
            >
              <div className="">
                <div>
                  <h3 className="text-1 font-semibold">
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
                  <div className="items-end justify-end flex flex-col gap-2"></div>
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

              <div className="space-y-4">
                {/* 이메일로 보내기 신청한 경우 안내 메시지 */}
                {order.draft_delivery_method === 'email' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-blue-700">
                        이메일로 시안을 보내셨지만, 홈페이지에서도 업로드할 수
                        있습니다.
                      </span>
                    </div>
                  </div>
                )}

                {/* 홈페이지 업로드한 경우 이미 업로드된 시안 미리보기 표시 */}
                {order.draft_delivery_method === 'upload' &&
                  order.design_drafts &&
                  order.design_drafts.length > 0 &&
                  order.design_drafts[0].file_name && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3 flex-wrap">
                        {order.design_drafts[0].file_url &&
                        order.design_drafts[0].file_name
                          ?.toLowerCase()
                          .match(/\.(jpg|jpeg|png)$/) ? (
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewImageUrl(
                                order.design_drafts![0].file_url!
                              );
                              setPreviewImageName(
                                order.design_drafts![0].file_name || null
                              );
                            }}
                            className="cursor-pointer"
                          >
                            <img
                              src={order.design_drafts[0].file_url!}
                              alt={order.design_drafts[0].file_name || '시안'}
                              className="h-16 w-auto rounded border border-green-300 object-contain bg-white"
                            />
                          </button>
                        ) : (
                          <span className="text-sm text-green-600">
                            {order.design_drafts[0].file_name}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                {/* 커스텀 파일 업로드 - 이메일 선택 시에도 업로드 가능 */}
                <CustomFileUpload
                  onFileSelect={(file) => handleFileUpload(order.id, file)}
                  disabled={uploadingFile === order.id}
                  placeholder="시안 파일을 선택해주세요"
                  className="w-[13rem]"
                />

                {uploadingFile === order.id && (
                  <div className="text-center py-2">
                    <span className="text-sm text-gray-500">업로드 중...</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* 시안 이미지 미리보기 모달 */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
          onClick={() => {
            setPreviewImageUrl(null);
            setPreviewImageName(null);
          }}
        >
          <div
            className="bg-white rounded-lg max-w-[90vw] max-h-[90vh] p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                {previewImageName || '시안 미리보기'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setPreviewImageUrl(null);
                  setPreviewImageName(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none px-2"
              >
                ×
              </button>
            </div>
            <div className="overflow-auto max-h-[80vh]">
              <img
                src={previewImageUrl}
                alt={previewImageName || '시안 미리보기'}
                className="max-w-full h-auto mx-auto rounded"
              />
            </div>
          </div>
        </div>
      )}
    </MypageContainer>
  );
}
