import Image from 'next/image';
import Calendar from '@/src/components/calendar';

interface DateLocationFilterProps {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  searchLocation: string;
  setSearchLocation: (location: string) => void;
  showStartCalendar: boolean;
  setShowStartCalendar: (open: boolean) => void;
  showEndCalendar: boolean;
  setShowEndCalendar: (open: boolean) => void;
}

const DateLocationFilter = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  searchLocation,
  setSearchLocation,
  showStartCalendar,
  setShowStartCalendar,
  showEndCalendar,
  setShowEndCalendar,
}: DateLocationFilterProps) => (
  <div className="bg-[#F5F5F5] p-4 md:p-6 rounded-lg mb-6 lg:w-full md:w-full sm:min-w-[20rem]">
    <div className="flex flex-col md:flex-row flex-wrap gap-6 md:gap-8 justify-between md:items-start md:justify-center">
      {/* 날짜 필터 */}
      <div className="w-full md:w-auto ">
        <div className="text-gray-600 mb-2">주문일</div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={startDate}
              onClick={() => {
                setShowStartCalendar(true);
                setShowEndCalendar(false);
              }}
              readOnly
              className="border-solid shadow-none lg:w-[6rem] border border-gray-200 rounded-lg px-4 py-3 pr-10 cursor-pointer md:w-[6rem] sm:w-[4rem]"
              placeholder="YYYY.MM.DD"
            />
            <button
              onClick={() => {
                setShowStartCalendar(true);
                setShowEndCalendar(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 border-none"
            >
              <Image
                src="/svg/calendar.svg"
                width={20}
                height={20}
                alt="calendar"
              />
            </button>
            {showStartCalendar && (
              <Calendar
                selectedDate={startDate}
                onDateSelect={(date: string) => setStartDate(date)}
                onClose={() => setShowStartCalendar(false)}
              />
            )}
          </div>
          <div className="text-1.25 font-500 px-4">~</div>
          <div className="relative">
            <input
              type="text"
              value={endDate}
              onClick={() => {
                setShowEndCalendar(true);
                setShowStartCalendar(false);
              }}
              readOnly
              className="border-solid shadow-none lg:w-[6rem] border border-gray-200 rounded-lg px-4 py-3 pr-10 cursor-pointer md:w-[6rem] sm:w-[4rem]"
              placeholder="YYYY.MM.DD"
            />
            <button
              onClick={() => {
                setShowEndCalendar(true);
                setShowStartCalendar(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 border-none"
            >
              <Image
                src="/svg/calendar.svg"
                width={20}
                height={20}
                alt="calendar"
              />
            </button>
            {showEndCalendar && (
              <Calendar
                selectedDate={endDate}
                onDateSelect={(date: string) => setEndDate(date)}
                onClose={() => setShowEndCalendar(false)}
              />
            )}
          </div>
        </div>
      </div>
      <div className="w-full md:w-auto ">
        <div className="text-gray-600 mb-2">광고위치</div>
        <div className="flex flex-wrap gap-2 sm:gap-10">
          <input
            type="text"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="border border-solid shadow-none border-gray-200 rounded-lg w-full md:w-[11rem] px-4 py-3 sm:w-[10rem]"
            placeholder="위치를 입력해보세요. ex.송파구"
          />
          <button className="w-full md:w-[5.75rem] px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 sm:w-[4rem]">
            조회
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default DateLocationFilter;
