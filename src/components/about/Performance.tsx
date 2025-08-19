// 실적내역 데이터
const performanceData = [
  // 2025년 프로젝트들
  { title: '성남시 전자게시대', year: '2025' },
  { title: '용산구 전자게시대', year: '2025' },
  { title: '하동 간판디자인', year: '2025' },
  { title: '송파 풍납시장 간판개선사업', year: '2025' },
  { title: '연수구 동남아파트 외 <br/> 간판개선사업', year: '2025' },
  { title: '고양 장항동 관광특구 <br/>라이트업거리 조성', year: '2025' },
  { title: '강동구 한강가는길', year: '2025' },
  { title: '부천시 원미지역 간판개선사업', year: '2025' },
  { title: '고령군 옥외광고 사이드간판 <br/>시범운영', year: '2025' },
  { title: '관악구 아트테리어', year: '2025' },
  { title: '관악구 안심디자인', year: '2025' },
  { title: '종로서촌 특화디자인', year: '2025' },
  { title: '남동구 미디어광장', year: '2025' },
  { title: '동작구 틈새공간디자인', year: '2025' },
  { title: '양주시 경관동 디자인', year: '2025' },

  // 2024년 프로젝트들
  { title: '함평군 전자게시대 제작 및<br/> 설치업체', year: '2024' },
  { title: '동작구 도시 틈새공간<br/> CPTED 설계및 제작업체', year: '2024' },
  { title: '노원역 문화의거리 일부<br/> 간판개선사업 제작업체', year: '2024' },
  { title: '구월3동 스마트 마을 조성<br/> 사업 제작업체', year: '2024' },
  { title: '강북구 학수막 게시대 •<br/> 전자게시대 제작업체', year: '2024' },
  { title: '횡성군 둔내면 좌고리리<br/> 간판개선사업 제작업체', year: '2024' },
  {
    title: '양주 장흥 환경개선사업<br/> 제작업체(유니버설 디자인)',
    year: '2024',
  },
  { title: '연수역 북측 일원 간판개선사업 <br/>제작업체', year: '2024' },
  { title: '영등포구 전자게시대 설치 및<br/> 운영사업', year: '2024' },

  // 2023년 프로젝트들
  { title: '동작구 수해 안전디자인<br/> 시범사업', year: '2023' },
  { title: '동대문구 LED 전자게시대', year: '2023' },
  { title: '중구 다산로 일대 LED간판<br/> 개선사업 제작업체', year: '2023' },
  { title: '관악구 정토사랑 안내간판<br/> 디자인 및 제작설치', year: '2023' },
  {
    title: '마포구 학수막(자전형, 열림형) <br/>게시대 제작·관리·설치 업체',
    year: '2023',
  },
  { title: '관악구 전자게시대<br/> 제작·관리·설치 업체', year: '2023' },

  // 2022년 프로젝트들
  { title: '강동구 전자게시대<br/> 제작·관리·설치 업체', year: '2022' },
  { title: '관악구 강감찬대로<br/> 간판개선사업 제작업체', year: '2022' },
  { title: '구로구 에너지절약형 <br/>LED간판개선사업 제작업체', year: '2022' },

  // 2020년 프로젝트들
  { title: '광진구 전자게시대 <br/>제작·관리·설치 업체', year: '2020' },
  {
    title: '후코 4단지 등 상가동 4개소<br/> 간판개선사업 제작업체',
    year: '2020',
  },
  {
    title: '동작구 사당동 편리미엄 <br/>Media Mate조성 제작업체',
    year: '2020',
  },
  { title: '강남구 2020 강남스타일 <br/>브랜드 안내판 제작업체', year: '2020' },
  {
    title: '서대문구 홍제동 특화거리<br/> 간판개선사업 제작업체',
    year: '2020',
  },
  { title: '서대문구 세검정로 <br/>간판개선사업 제작업체', year: '2020' },
  {
    title: '구로구 중앙로 에너지절약형 <br/>LED간판개선사업 제작업체',
    year: '2020',
  },

  // 2019년 프로젝트들
  {
    title: '강릉 중앙동 서부시장 푸드존 <br/>조성 및 공공디자인 제작업체',
    year: '2019',
  },
  {
    title: '구로구중앙로 에너지절약형<br/> 간판개선사업 제작업체',
    year: '2019',
  },
  { title: '동작구 사당1동 <br/>간판개선사업 제작업체', year: '2019' },
  { title: '강동구 전자게시대<br/> 제작·관리·설치 업체', year: '2019' },
  { title: '광주 꿈꾸는 정원간판풍경<br/> 만들기 제작업체', year: '2019' },
  {
    title:
      '충남 태안 운산면 농촌중심지<br/> 활성화 간판정비사업 <br/>제작설치업체',
    year: '2019',
  },
  { title: '충남 당진 예쁜간판 만들기<br/> 개선사업 제작업체', year: '2019' },

  // 2018년 프로젝트들
  { title: '금천구 간판개선사업 •<br/> 홍익대 광고물 제작', year: '2018' },
  { title: '마포구 어린이 영어도서관<br/> 외부간판 제작', year: '2018' },
  {
    title: '염리생활체육관·우리마포복지관<br/> 옥.내외 사인물 제작',
    year: '2018',
  },
  {
    title:
      '한국중부발전(주) <br/>세종열병합 건설사무소<br/> 옥.내외 사인물 제작',
    year: '2018',
  },
  {
    title: '서대문구·마포구·송파구·관악구<br/> 학습구 지정 게시대 운영업체',
    year: '2018',
  },
  { title: '마포구 사설안내간판<br/> 제작설치업체', year: '2018' },
  { title: '마포구 도화동 <br/>간판개선사업 제작업체', year: '2018' },
  { title: '포곡 전대마을 <br/>간판개선사업 제작업체', year: '2018' },
  { title: '서대문구 통일로 일대<br/> 간판개선사업 제작업체', year: '2018' },
  { title: '서대문구 인왕시장<br/> 간판개선사업 제작업체', year: '2018' },

  // 2010년 프로젝트들
  { title: '동작구 액션미디어거리 <br/>조성사업 제작업체', year: '2010' },
  { title: '듀폰 옥외광고물·하이튼<br/> 광고물 제작업체', year: '2010' },
  {
    title: '용인지구 쌍용아파트<br/> 광고물·북한산시티 제작업체',
    year: '2010',
  },
  { title: '인터넷게임 넷마블<br/> 현수막 제작 지정업체', year: '2010' },
  { title: '서울형 어린이집<br/> 제1~4차 간판 지정업체', year: '2010' },
  { title: '마포구 복지목욕탕<br/> 간판 제작업체', year: '2010' },
  { title: '마포구 불법옥외광고물 <br/>수거정비업체', year: '2010' },
  {
    title: '마포구 서교동 간판이 <br/>아름다운거리 조성사업 업체',
    year: '2010',
  },
  {
    title: '(주)한국전자정보통신산업<br/> 진흥회 광고물 제작업체',
    year: '2010',
  },

  // 2000년 프로젝트들
  { title: '한솔소프트·인터파크 <br/>광고물 제작업체', year: '2000' },
  { title: '삼성 엔지니어링<br/> 옥외광고물 제작업체', year: '2000' },
  { title: '국립의료원 실내 광고물<br/> 제작업체', year: '2000' },
  { title: '한국일보사·범서기업(주)<br/> 옥외광고물 제작업체', year: '2000' },
  { title: '안국약품(주)<br/> 광고물 제작업체', year: '2000' },
  { title: '경향신문사 옥외광고물<br/> 제작업체', year: '2000' },
  { title: '한국고닥 대리점 간판<br/> 지정 제작업체', year: '2000' },
  { title: '효성건설 광고물 지정<br/> 제작업체', year: '2000' },
  { title: '(주)하우정그룹 해인<br/> 광고물 제작업체', year: '2000' },
  { title: '금호전기 광고물 제작업체', year: '2000' },
  { title: '서초구청 광고물 제작업체', year: '2000' },
  { title: '(주)여해산업개발<br/> 광고물 제작업체', year: '2000' },
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
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {performanceData.map((item, index) => (
            <div
              key={index}
              className="flex w-[14rem] h-[3rem] p-[3.4375rem_2.3125rem] flex-col justify-center items-start gap-[0.625rem] bg-white rounded-[1.25rem] shadow-lg"
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
