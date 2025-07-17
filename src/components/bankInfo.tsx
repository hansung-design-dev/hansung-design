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
    <div className={`text-1 font-500 text-gray-600 flex gap-2 pt-2`}>
      <span> {bankInfo ? `입금계좌` : ''}</span>

      <div
        className={`flex text-gray-600  ${
          flexRow ? 'flex-row' : 'flex-col'
        } gap-1`}
      >
        <span>
          {bankInfo ? `${bankInfo.bank_name} ${bankInfo.account_number} ` : ''}
        </span>

        <span>{bankInfo?.depositor}</span>
      </div>
    </div>
  );
}
