import { useState, useRef } from 'react';
import type { CartItem } from '@/src/contexts/cartContext';
import { Button } from '@/src/components/button/button';

interface CartItemAccordionProps {
  item: CartItem;
}

export default function CartItemAccordion({ item }: CartItemAccordionProps) {
  const [open, setOpen] = useState(false);
  const [workName, setWorkName] = useState('');
  const [phone, setPhone] = useState('');
  const [sendByEmail, setSendByEmail] = useState(true);
  const [coupon, setCoupon] = useState('');
  const [taxInvoice, setTaxInvoice] = useState(false);
  const [fileName, setFileName] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputClick = () => {
    if (!sendByEmail) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPendingFile(e.target.files[0]);
    }
  };

  const handleFileConfirm = () => {
    if (pendingFile) {
      setFileName(pendingFile.name);
      setPendingFile(null);
    }
  };

  return (
    <div className="mb-6">
      <div className="text-1.25 font-700 py-4">{item.name}</div>
      <div
        className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-3 cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          <input type="checkbox" className="w-6 h-6" />
          <span className="text-1.25 font-700">고객이름</span>
        </div>
      </div>
      {open && (
        <div className="p-4 border rounded-b-lg bg-white relative flex flex-col gap-4">
          <div className="text-1.25 font-600 mb-8">고객 정보</div>
          <div className="mb-3 flex justify-between">
            <label className="block text-gray-400 text-1 font-500 mb-1">
              작업이름
            </label>
            <input
              className="w-[21.25rem] h-[3rem] border border-[#AEAEAE] rounded-[0.375rem] px-3"
              value={workName}
              onChange={(e) => setWorkName(e.target.value)}
            />
          </div>
          <div className="mb-3 flex justify-between">
            <label className="block text-gray-400 text-1 font-500 mb-1">
              휴대폰 번호
            </label>
            <input
              className="w-[21.25rem] h-[3rem] border border-[#AEAEAE] rounded-[0.375rem] px-3"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="000-0000-0000"
            />
          </div>
          <div className="mb-3 flex justify-between items-center">
            <label className="block text-gray-400 text-1 font-500 mb-1">
              파일업로드
            </label>
            <div className="flex flex-col gap-2 items-start">
              <div className="flex gap-2 items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sendByEmail}
                    onChange={() => setSendByEmail(true)}
                  />
                  이메일로 파일 보낼게요
                </label>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  className="w-[16rem] h-[3rem] border border-[#AEAEAE] rounded-[0.375rem] px-3 cursor-pointer bg-white"
                  value={pendingFile ? pendingFile.name : fileName}
                  readOnly
                  onClick={handleFileInputClick}
                  placeholder="파일을 선택하세요"
                  disabled={sendByEmail}
                />
                <Button
                  variant="default"
                  className="px-4"
                  size="md"
                  onClick={handleFileInputClick}
                  disabled={sendByEmail}
                >
                  파일선택
                </Button>

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  disabled={sendByEmail}
                />
              </div>
            </div>
          </div>
          <div className="mb-3 flex justify-between">
            <label className="block text-gray-400 text-1 font-500 mb-1">
              쿠폰번호
            </label>
            <div className="flex items-center gap-2">
              <input
                className="w-[16rem] h-[3rem] border border-[#AEAEAE] rounded-[0.375rem] px-3"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
              />
              <Button
                variant="default"
                className="px-7"
                size="md"
                onClick={handleFileConfirm}
                disabled={sendByEmail || !pendingFile}
              >
                확인
              </Button>
            </div>
          </div>
          <div className="mb-3 flex items-center gap-2 justify-between">
            <label className="text-gray-400 text-1 font-500">
              세금계산서 신청
            </label>
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={taxInvoice}
                onChange={(e) => setTaxInvoice(e.target.checked)}
              />
              <label className="text-gray-400 text-1 font-500">
                세금계산서 신청
              </label>
            </div>
          </div>
          {/* 저장 버튼 */}
          <div className="flex justify-end mt-8">
            <button
              type="button"
              style={{ borderRadius: '0.25rem', background: '#F6F6F6' }}
              className="px-6 py-3 text-gray-500 text-1 font-500"
            >
              변경된 내용 저장
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
