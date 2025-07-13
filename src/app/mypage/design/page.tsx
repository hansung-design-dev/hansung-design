'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/authContext';
import Nav from '@/src/components/layouts/nav';
import { Button } from '@/src/components/button/button';
import { useRouter } from 'next/navigation';

interface DesignDraft {
  id: string;
  order_id: string;
  user_profile_id: string;
  admin_profile_id: string | null;
  file_name: string | null;
  file_url: string | null;
  file_extension: string | null;
  file_size: number | null;
  draft_category: 'initial' | 'feedback' | 'revision' | 'final';
  notes: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  order_number: string;
  payment_status: string;
  admin_approval_status: string;
  design_drafts_id: string | null;
  created_at: string;
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
        // 결제 완료된 주문만 필터링
        const completedOrders = data.data.filter(
          (order: Order) =>
            order.payment_status === 'completed' ||
            order.admin_approval_status === 'approved'
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
        <Nav variant="default" className="bg-white" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">로딩 중...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-[5.5rem]">
      <Nav variant="default" className="bg-white" />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">시안 관리</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">시안 업로드할 주문이 없습니다.</p>
            <Button
              onClick={() => router.push('/mypage/orders')}
              className="bg-black text-white px-6 py-2 rounded"
            >
              주문내역 보기
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      주문번호: {order.order_number}
                    </h3>
                    <p className="text-sm text-gray-500">
                      주문일: {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        order.payment_status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.payment_status === 'completed'
                        ? '결제완료'
                        : '승인완료'}
                    </span>
                  </div>
                </div>

                {/* 시안 업로드 영역 */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">시안 업로드</h4>

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
                  {order.design_drafts && order.design_drafts.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">업로드된 시안</h5>
                      {order.design_drafts.map((draft) => (
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
                      ))}
                    </div>
                  )}

                  {uploadingFile === order.id && (
                    <div className="text-center py-2">
                      <span className="text-sm text-gray-500">
                        업로드 중...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
