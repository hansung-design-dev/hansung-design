'use client';

import { useState, useEffect, useCallback } from 'react';
import MypageContainer from '@/src/components/mypageContainer';
import { useAuth } from '@/src/contexts/authContext';
import CustomFileUpload from '@/src/components/ui/CustomFileUpload';
import DesignSkeleton from '@/src/components/skeleton/DesignSkeleton';
import Image from 'next/image';

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
  projectName?: string;
  user_profile_id?: string;
}

// 시안 카드용 인터페이스
interface DraftCard {
  id: string; // draft.id 또는 order.id (시안이 없을 경우)
  orderId: string;
  orderNumber: string;
  orderCreatedAt: string;
  draft?: DesignDraft;
  draftDeliveryMethod?: 'email' | 'upload';
  projectName?: string;
  isEmailOnly: boolean; // 이메일로만 보낸 경우 (시안이 없음)
}

export default function DesignPage() {
  const { user } = useAuth();
  const [draftCards, setDraftCards] = useState<DraftCard[]>([]);
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
          '🔍 [시안보기] 필터링된 주문:',
          {
            totalOrders: data.orders.length,
            filteredOrders: completedOrders.length,
            orders: completedOrders.map((o: Order) => ({
              id: o.id,
              order_number: o.order_number,
              payment_status: o.payment_status,
              hasDesignDraftsId: !!(o as Order & { design_drafts_id?: string }).design_drafts_id,
              hasDesignDrafts: !!(o.design_drafts && o.design_drafts.length > 0),
              designDraftsCount: o.design_drafts?.length || 0,
              projectName: (o as Order & { projectName?: string }).projectName || o.design_drafts?.[0]?.project_name || '없음',
            }))
          }
        );
        // setOrders는 더 이상 사용하지 않음 (draftCards만 사용)

        // 주문 배열을 시안 배열로 변환
        const cards: DraftCard[] = [];
        completedOrders.forEach((order: Order) => {
          const hasDrafts = order.design_drafts && order.design_drafts.length > 0;
          const isEmailOnly = order.draft_delivery_method === 'email' && !hasDrafts;

          if (hasDrafts) {
            // 시안이 있는 경우: 각 시안마다 카드 생성
            order.design_drafts!.forEach((draft) => {
              cards.push({
                id: draft.id,
                orderId: order.id,
                orderNumber: order.order_number,
                orderCreatedAt: order.created_at,
                draft: draft,
                draftDeliveryMethod: order.draft_delivery_method,
                projectName: draft.project_name || order.projectName,
                isEmailOnly: false,
              });
            });
          } else if (isEmailOnly) {
            // 이메일로만 보낸 경우: 시안이 없어도 카드 1개 생성
            cards.push({
              id: `email-only-${order.id}`,
              orderId: order.id,
              orderNumber: order.order_number,
              orderCreatedAt: order.created_at,
              draft: undefined,
              draftDeliveryMethod: 'email',
              projectName: order.projectName,
              isEmailOnly: true,
            });
          } else {
            // 시안도 없고 이메일도 아닌 경우: 카드 1개 생성 (업로드 가능)
            cards.push({
              id: `no-draft-${order.id}`,
              orderId: order.id,
              orderNumber: order.order_number,
              orderCreatedAt: order.created_at,
              draft: undefined,
              draftDeliveryMethod: order.draft_delivery_method,
              projectName: order.projectName,
              isEmailOnly: false,
            });
          }
        });

        console.log('🔍 [시안보기] 시안 카드 변환 결과:', {
          totalOrders: completedOrders.length,
          totalCards: cards.length,
          cards: cards.map((c) => ({
            id: c.id,
            orderNumber: c.orderNumber,
            hasDraft: !!c.draft,
            isEmailOnly: c.isEmailOnly,
            projectName: c.projectName,
          })),
        });

        setDraftCards(cards);
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

  const handleFileUpload = async (orderId: string, file: File, draftId?: string) => {
    try {
      const uploadKey = draftId || orderId;
      setUploadingFile(uploadKey);
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

      {draftCards.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">시안 업로드할 주문이 없습니다.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {draftCards.map((card) => (
            <div
              key={card.id}
              className="border-solid border-1 border-gray-200 rounded-lg p-6 bg-white shadow-sm"
            >
              <div className="">
                <div>
                  <h3 className="text-1 font-semibold">
                    주문번호: {card.orderNumber}
                  </h3>
                  <p className="text-gray-600">
                    주문일: {new Date(card.orderCreatedAt).toLocaleDateString()}
                  </p>
                  {card.projectName && card.projectName !== '프로젝트명 없음' && (
                    <p className="text-blue-600 font-medium">
                      작업명: {card.projectName}
                    </p>
                  )}
                  <div className="items-end justify-end flex flex-col gap-2"></div>
                </div>
              </div>

              {/* 이메일로 보내기 신청한 경우 표기 */}
              {card.isEmailOnly && (
                <div className="flex items-center gap-2 mt-2 mb-4">
                  <span className="text-sm text-blue-600 font-medium">
                    이메일로 보내기 신청:
                  </span>
                  <span className="text-xs text-blue-800 px-2 py-1 rounded bg-blue-50">
                    banner114@hanmail.net
                  </span>
                </div>
              )}

              <div className="space-y-4">
                {/* 이메일로 보내기 신청한 경우 안내 메시지 */}
                {card.isEmailOnly && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-blue-700">
                        이메일로 시안을 보내셨지만, 홈페이지에서도 업로드할 수
                        있습니다.
                      </span>
                    </div>
                  </div>
                )}

                {/* 이미 업로드된 시안 미리보기 표시 */}
                {card.draft && card.draft.file_name && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3 flex-wrap">
                      {card.draft.file_url &&
                      card.draft.file_name
                        ?.toLowerCase()
                        .match(/\.(jpg|jpeg|png)$/) ? (
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImageUrl(card.draft!.file_url!);
                            setPreviewImageName(card.draft!.file_name || null);
                          }}
                          className="cursor-pointer"
                        >
                          <div className="relative h-16 w-16">
                            <Image
                              src={card.draft.file_url!}
                              alt={card.draft.file_name || '시안'}
                              fill
                              className="rounded border border-green-300 object-contain bg-white"
                            />
                          </div>
                        </button>
                      ) : (
                        <span className="text-sm text-green-600">
                          {card.draft.file_name}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 커스텀 파일 업로드 */}
                <CustomFileUpload
                  onFileSelect={(file) =>
                    handleFileUpload(card.orderId, file, card.draft?.id)
                  }
                  disabled={uploadingFile === (card.draft?.id || card.orderId)}
                  placeholder="시안 파일을 선택해주세요"
                  className="w-[13rem]"
                />

                {uploadingFile === (card.draft?.id || card.orderId) && (
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
              <div className="relative max-w-full max-h-[80vh] mx-auto">
                <Image
                  src={previewImageUrl}
                  alt={previewImageName || '시안 미리보기'}
                  width={800}
                  height={600}
                  className="w-full h-auto rounded object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </MypageContainer>
  );
}
