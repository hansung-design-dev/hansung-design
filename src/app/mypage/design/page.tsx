'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/authContext';

import { useRouter } from 'next/navigation';
import MypageContainer from '@/src/components/mypageContainer';

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
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    fetchOrders();
  }, [user, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();

      if (data.success) {
        // 결제 완료된 주문만 필터링 (일반 결제 완료 또는 어드민 승인 후 결제 완료)
        const completedOrders = data.data.filter(
          (order: Order) =>
            order.payment_status === 'completed' ||
            (order.admin_approval_status === 'approved' &&
              order.payment_status === 'completed')
        );
        setOrders(completedOrders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (orderId: string, file: File) => {
    if (!file) return;

    setUploadingFile(orderId);

    try {
      // 파일 업로드 (실제 구현에서는 파일 스토리지 서비스 사용)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('orderId', orderId);

      const uploadResponse = await fetch('/api/design-drafts/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (uploadData.success) {
        // 시안 정보 업데이트
        const updateResponse = await fetch('/api/design-drafts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'updateDraft',
            draftId: uploadData.data.draftId,
            file_name: file.name,
            file_url: uploadData.data.fileUrl,
            file_extension: file.name.split('.').pop(),
            file_size: file.size,
            notes: '사용자가 업로드한 시안',
          }),
        });

        const updateData = await updateResponse.json();

        if (updateData.success) {
          // 주문 목록 새로고침
          fetchOrders();
        }
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
      <main className="min-h-screen bg-white pt-[5.5rem]">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">로딩 중...</div>
        </div>
      </main>
    );
  }

  return (
    <MypageContainer activeTab="시안관리">
      <h1 className="text-2xl font-bold mb-8">시안 관리</h1>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                시안 업로드할 주문이 없습니다.
              </p>
            </div>

            {/* 시안 업로드 탭 */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">시안 업로드</h4>
              <div className="text-center py-4 text-gray-500">
                업로드할 주문이 없습니다.
              </div>
            </div>

            {/* 업로드된 시안 탭 */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">업로드된 시안</h4>
              <div className="text-center py-4 text-gray-500">
                업로드된 시안이 없습니다.
              </div>
            </div>
          </div>
        ) : (
          orders.map((order) => (
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
                  {order.draft_delivery_method === 'email' && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-blue-600 font-medium">
                        이메일로 보내기 신청
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {user?.email}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {order.total_price?.toLocaleString()}원
                  </p>
                  <p className="text-sm text-green-600 font-medium">결제완료</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">시안 업로드</h4>

                {/* 이메일로 보내기 신청한 경우 안내 메시지 */}
                {order.draft_delivery_method === 'email' && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      이메일로 시안을 받기로 신청하셨지만, 추가로 홈페이지에서도
                      시안을 업로드할 수 있습니다.
                    </p>
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

                {/* 파일 업로드 */}
                <div className="mb-4">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.hwp,.ai,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(order.id, file);
                      }
                    }}
                    disabled={uploadingFile === order.id}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    지원 형식: PDF, Word, 텍스트, 한글, AI, JPG, JPEG, PNG
                  </p>
                </div>

                {/* 기존 시안 목록 */}
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">업로드된 시안</h5>
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
                      업로드된 시안이 없습니다.
                    </div>
                  )}
                </div>

                {uploadingFile === order.id && (
                  <div className="text-center py-2">
                    <span className="text-sm text-gray-500">업로드 중...</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </MypageContainer>
  );
}
