// 실적내역 데이터
const performanceData = [
  { title: '성남시 전자게시대', year: '2025' },
  { title: '용산구 전자게시대', year: '2025' },
  { title: '하동 간판디자인', year: '2025' },
  { title: '송파 풍납시장 간판개선사업', year: '2025' },
  { title: '연수구 동남아파트 <br/> 외 간판개선사업', year: '2025' },
  { title: '고양 장항동 관광특구<br/>  라이트업거리 조성', year: '2025' },
  { title: '동작구 액션미디어거리<br/>  조성사업 제작업체', year: '2018' },
  { title: '두툼 옥외광고물<br/>  · 하이트 광고물 제작업체', year: '2010' },
  {
    title: '용인지구 쌍용아파트 광고물 ·<br/>  복합산업단지 제작업체',
    year: '2010',
  },
  { title: '인터넷게임 넷마블<br/>  현수막 제작 지정업체', year: '2010' },
  { title: '서울형 어린이집<br/>  제1~4차 간판 지정업체', year: '2010' },
  { title: '마포구 복지목욕탕<br/>  간판제작업체', year: '2010' },
  { title: '마포구 법률등록광고물<br/>  수거정비업체', year: '2010' },
  {
    title: '마포구 서교동 간판이<br/>  아름다운거리 조성사업 업체',
    year: '2010',
  },
  {
    title: '(주)정보엔지니어링정보사업<br/>  진흥원 광고물 제작업체',
    year: '2010',
  },
  { title: '삼성 애니콜 이마트<br/>  옥외광고물 제작업체', year: '2000' },
  { title: '국립공원 광고물 제작업체', year: '2000' },
  { title: '한국일보 · 벅시기타<br/>  (주)옥외광고물 제작업체', year: '2000' },
  { title: '약국연합 광고물 제작업체', year: '2000' },
  { title: '광화문사옥 옥외광고물<br/>  제작업체', year: '2000' },
  { title: '한국공대 디지털 간판 지정<br/>  제작업체', year: '2000' },
  { title: '효성생활 광고물 지정 제작업체', year: '2000' },
  { title: '(주)하우징플랜 광고물<br/>  제작업체', year: '2000' },
  { title: '금호전기 광고물 제작업체', year: '2000' },
  { title: '서초구청 광고물 제작업체', year: '2000' },
  { title: '(주)예다인플랜 광고물 <br/> 제작업체', year: '2000' },
];

export default function Performance() {
  return (
    <section id="performance" className="py-20 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 제목 */}
        <div className="flex justify-center mb-16">
          <div className="text-[#7D7D7D] text-[1.5rem] font-500 w-[11.125rem] rounded-full border-solid border-[0.1rem] border-[#D9D9D9] text-center py-2">
            실적내역
          </div>
        </div>

        {/* 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {performanceData.map((item, index) => (
            <div
              key={index}
              className="flex w-[13rem] h-[3rem] p-[3.4375rem_2.3125rem] flex-col justify-center items-start gap-[0.625rem] bg-white rounded-[1.25rem] shadow-lg"
            >
              <h3
                className="text-[1.125rem] font-700 text-start"
                dangerouslySetInnerHTML={{ __html: item.title }}
              />
              <p className="text-[0.875rem] font-500 text-[#2187FF]">
                {item.year}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
