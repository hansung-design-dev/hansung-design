export default function Organization() {
  // 조직도 데이터
  const organizationData = [
    {
      id: 1,
      name: '관리',
      lines: [
        { x1: '50%', y1: '0', x2: '50%', y2: '30' },
        { x1: '50%', y1: '30', x2: '7.14%', y2: '30' },
        { x1: '7.14%', y1: '30', x2: '7.14%', y2: '60' },
      ],
    },
    {
      id: 2,
      name: '디지털사업부',
      lines: [
        { x1: '50%', y1: '0', x2: '50%', y2: '30' },
        { x1: '50%', y1: '30', x2: '21.43%', y2: '30' },
        { x1: '21.43%', y1: '30', x2: '21.43%', y2: '60' },
      ],
    },
    {
      id: 3,
      name: '디자인',
      lines: [
        { x1: '50%', y1: '0', x2: '50%', y2: '30' },
        { x1: '50%', y1: '30', x2: '35.71%', y2: '30' },
        { x1: '35.71%', y1: '30', x2: '35.71%', y2: '60' },
      ],
    },
    {
      id: 4,
      name: '제안',
      lines: [{ x1: '50%', y1: '0', x2: '50%', y2: '60' }],
    },
    {
      id: 5,
      name: '실행',
      lines: [
        { x1: '50%', y1: '0', x2: '50%', y2: '30' },
        { x1: '50%', y1: '30', x2: '64.29%', y2: '30' },
        { x1: '64.29%', y1: '30', x2: '64.29%', y2: '60' },
      ],
    },
    {
      id: 6,
      name: '실사',
      lines: [
        { x1: '50%', y1: '0', x2: '50%', y2: '30' },
        { x1: '50%', y1: '30', x2: '78.57%', y2: '30' },
        { x1: '78.57%', y1: '30', x2: '78.57%', y2: '60' },
      ],
    },
    {
      id: 7,
      name: '제작관리',
      lines: [
        { x1: '50%', y1: '0', x2: '50%', y2: '30' },
        { x1: '50%', y1: '30', x2: '92.86%', y2: '30' },
        { x1: '92.86%', y1: '30', x2: '92.86%', y2: '60' },
      ],
    },
  ];

  return (
    <section id="organization" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 제목 */}
        <div className="flex justify-center mb-16">
          <div className="text-[#7D7D7D] text-[1.5rem] font-500 w-[11.125rem] rounded-full border-solid border-[0.1rem] border-[#D9D9D9] text-center py-2">
            조직도
          </div>
        </div>

        {/* 조직도 */}
        <div className="flex justify-center">
          <div className="relative">
            {/* 대표이사 */}
            <div className="text-center mt-2">
              <div className="bg-black text-white px-8 py-1 rounded-full inline-block font-bold text-lg ">
                대표이사
              </div>
            </div>

            {/* 연결선들 */}
            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-full">
              <svg
                width="100%"
                height="100"
                className="absolute"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {organizationData.map((dept) =>
                  dept.lines.map((line, lineIndex) => (
                    <line
                      key={`${dept.id}-${lineIndex}`}
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      stroke="black"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))
                )}
              </svg>
            </div>

            {/* 부서들 */}
            <div className="grid grid-cols-7 gap-4 mt-16">
              {organizationData.map((dept) => (
                <div
                  key={dept.id}
                  className="bg-black text-white px-4 py-3 rounded-full text-center text-sm font-medium"
                >
                  {dept.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
