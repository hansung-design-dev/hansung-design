import SectionTitle from './SectionTitle';

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
  { title: '고령군 옥외광고 <br/> 사이드간판 시범운영', year: '2025' },
  { title: '관악구 아트테리어', year: '2025' },
  { title: '관악구 안심디자인', year: '2025' },
  { title: '종로서촌 특화디자인', year: '2025' },
  { title: '남동구 미디어광장', year: '2025' },
  { title: '동작구<br/> 틈새공간디자인', year: '2025' },
  { title: '양주시 경관동 디자인', year: '2025' },

  // 2024년 프로젝트들
  { title: '함평군 전자게시대<br/>  제작 및설치업체', year: '2024' },
  { title: '동작구 도시 틈새공간<br/> CPTED 설계및 제작업체', year: '2024' },
  { title: '노원역 문화의거리 일부<br/> 간판개선사업 제작업체', year: '2024' },
  { title: '구월3동 스마트 마을 조성<br/> 사업 제작업체', year: '2024' },
  { title: '강북구 현수막 게시대 /<br/> 전자게시대 제작업체', year: '2024' },
  { title: '횡성군 둔내면 좌포1리<br/> 간판개선사업 제작업체', year: '2024' },
  {
    title: '양주 장흥 환경개선사업<br/> 제작업체(유니버설 디자인)',
    year: '2024',
  },
  { title: '연수역 북측 일원 <br/> 간판개선사업 제작업체', year: '2024' },
  { title: '영등포구 전자게시대 <br/> 설치 및운영사업', year: '2024' },

  // 2023년 프로젝트들
  { title: '동작구 수해 안전디자인<br/> 시범사업', year: '2023' },
  { title: '동대문구 LED 전자게시대', year: '2023' },
  { title: '중구 다산로 일대 LED간판<br/> 개선사업 제작업체', year: '2023' },
  { title: '관악구 전통시장 안내간판<br/> 디자인 및 제작설치', year: '2023' },
  {
    title: '마포구 현수막(자전형, 열림형) <br/>게시대 제작·관리·설치 업체',
    year: '2023',
  },
  { title: '관악구 전자게시대<br/> 제작·관리·설치 업체', year: '2023' },

  // 2022년 프로젝트들
  { title: '강동구 전자게시대<br/> 제작·관리·설치 업체', year: '2022' },
  { title: '구로구 에너지절약형 <br/>LED간판개선사업 제작업체', year: '2022' },
  //2021년 프로젝트들
  { title: '관악구 강감찬대로<br/> 간판개선사업 제작업체', year: '2021' },
  {
    title: '구로구 중앙로 에너지절약형 <br/>LED간판개선사업 제작업체',
    year: '2022',
  },

  // 2020년 프로젝트들
  {
    title: '서대문구 충청로 음식특화거리<br/> 간판개선사업 제작업체',
    year: '2020',
  },
  { title: '서대문구 세검정로 <br/>간판개선사업 제작업체', year: '2020' },
  { title: '광진구 전자게시대 <br/>제작·관리·설치 업체', year: '2020' },
  {
    title: '후곡 4단지 등 상가동 4개소<br/> 간판개선사업 제작업체',
    year: '2020',
  },
  {
    title: '동작구 사당동 편리미엄 <br/>Media Mate조성 제작업체',
    year: '2020',
  },
  //2019년 프로젝트들
  {
    title: '강릉 중앙동 서부시장 푸드존 <br/>조성 및 공공디자인 제작업체',
    year: '2019',
  },
  { title: '강남구 2020 강남스타일 <br/>브랜드 안내판 제작업체', year: '2020' },
  {
    title: '구로구 중앙로(고척동)에너지절약형간판개선사업 제작업체',
    year: '2020',
  },
  // 2019년 프로젝트들
  { title: '동작구 사당1동 <br/>간판개선사업 제작업체', year: '2019' },
  { title: '강동구 전자게시대<br/> 제작·관리·설치 업체', year: '2019' },
  { title: '광주 꿈꾸는 경안간판풍경<br/> 만들기 제작업체', year: '2019' },
  {
    title: '충남 태안 운산면 농촌중심지<br/> 활성화 간판정비사업 제작설치업체',
    year: '2019',
  },
  { title: '충남 당진 예쁜간판 만들기<br/> 개선사업 제작업체', year: '2019' },

  // 2018년 프로젝트들
  { title: '금천구 간판개선사업,<br/> 홍익대학교 광고물 제작', year: '2018' },
  { title: '마포구 어린이 영어도서관<br/> 외부간판 제작', year: '2018' },
  {
    title: '염리생활체육관·우리마포<br/>복지관 옥·내외 사인물 제작',
    year: '2018',
  },
  {
    title: '한국중부발전(주)세종열병합 <br/>건설사무소 옥·내외 사인물 제작',
    year: '2018',
  },
  {
    title: '서대문구·마포구·송파구·<br/>관악구 학습구 지정 게시대 운영업체',
    year: '2018',
  },
  { title: '마포구 사설안내간판<br/> 제작설치업체', year: '2018' },
  { title: '마포구 도화동 <br/>간판개선사업 제작업체', year: '2018' },
  { title: '포곡 전대마을 <br/>간판개선사업 제작업체', year: '2018' },
  { title: '서대문구 통일로 일대<br/> 간판개선사업 제작업체', year: '2018' },
  { title: '서대문구 인왕시장<br/> 간판개선사업 제작업체', year: '2018' },
  { title: '동작구 액션미디어거리 <br/>조성사업 제작업체', year: '2018' },

  // 2010년 프로젝트들
  { title: '듀폰 옥외광고물·하이튼<br/> 광고물 제작업체', year: '2010' },
  {
    title: '용인지구 쌍용아파트 광고물·<br/>북한산시티 제작업체',
    year: '2010',
  },
  { title: '인터넷게임 넷마블 현수막<br/> 제작 지정업체', year: '2010' },
  { title: '서울형 어린이집제1~4차<br/>  간판 지정업체', year: '2010' },
  { title: '마포구 복지목욕탕<br/> 간판 제작업체', year: '2010' },
  { title: '마포구 불법옥외광고물 <br/>수거정비업체', year: '2010' },
  {
    title: '마포구 서교동 간판이 <br/>아름다운거리 조성사업 업체',
    year: '2010',
  },

  // 2000년 프로젝트들
  {
    title: '(주)한국전자정보통신산업<br/> 진흥회 광고물 제작업체',
    year: '2000',
  },
  { title: '한솔소프트·인터파크 <br/>광고물 제작업체', year: '2000' },
  { title: '삼성 엔지니어링<br/> 옥외광고물 제작업체', year: '2000' },
  { title: '국립의료원 실내 광고물<br/> 제작업체', year: '2000' },
  { title: '한국일보사·범서기업(주)<br/> 옥외광고물 제작업체', year: '2000' },
  { title: '안국약품(주)<br/> 광고물 제작업체', year: '2000' },
  { title: '경향신문사 <br/>옥외광고물 제작업체', year: '2000' },
  { title: '한국코닥 대리점<br/> 간판 지정 제작업체', year: '2000' },
  { title: '효성건설 광고물 <br/>지정 제작업체', year: '2000' },
  { title: '(주)하우징그룹 행인<br/> 광고물 제작업체', year: '2000' },
  { title: '금호전기 <br/>광고물 제작업체', year: '2000' },
  { title: '서초구청 <br/>광고물 제작업체', year: '2000' },
  { title: '(주)여해산업개발<br/> 광고물 제작업체', year: '2000' },
];

export default function Performance() {
  return (
    <section id="performance" className="py-20 flex flex-col items-center">
      <div className="max-w-7xl mx-4 px-4 sm:px-6 lg:px-8">
        {/* 섹션 제목 */}
        <SectionTitle title="실적내역" />

        {/* 카드 그리드 */}
        <div className="grid gap-4 lg:gap-4 md:gap-6 mx-auto place-items-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 max-w-7xl">
          {performanceData.map((item, index) => (
            <div
              key={index}
              className="flex lg:w-[11rem] md:w-[14rem] sm:w-[14rem] h-[4rem] sm:h-[4rem] md:h-[3rem] lg:h-[3rem] p-[1rem_0.5rem] sm:p-[1.5rem_0.5rem] md:p-[2rem_0.5rem] lg:p-[2.5rem_0.5rem] flex-col justify-center items-center gap-[0.625rem] bg-white rounded-[1.25rem] shadow-lg"
            >
              <div
                className="text-[0.875rem] font-600 text-center break-keep"
                dangerouslySetInnerHTML={{ __html: item.title }}
              />
              <div className="text-[0.875rem] font-500 text-[#2187FF]">
                {item.year}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
