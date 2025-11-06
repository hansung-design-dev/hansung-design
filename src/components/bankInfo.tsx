interface BankInfoProps {
  bankInfo?: {
    id: string;
    bank_name: string;
    account_number: string;
    depositor: string;
    region_gu: {
      id: string;
      name: string;
    };
    display_types: {
      id: string;
      name: string;
    };
  } | null;
  flexRow?: boolean;
}

export default function BankInfo({ bankInfo, flexRow = false }: BankInfoProps) {
  // 디버깅용 로그
  console.log('🔍 BankInfo props:', { bankInfo, flexRow });

  return (
    <div className="text-gray-600">
      {bankInfo ? (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            {bankInfo.bank_name} {bankInfo.account_number}
          </div>
          <div className="text-0.875 text-gray-500">
            예금주: {bankInfo.depositor}
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-400">-</div>
      )}
    </div>
  );
}
