import Image from 'next/image';
import Calendar from '@/src/components/Calendar';

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
  <div className="bg-[#F5F5F5] p-8 rounded-lg mb-6 w-[65.5rem] h-[6rem]">
    <div className="flex flex-wrap gap-16 justify-between">
      <div>
        <div className="text-gray-600 mb-2">주문일</div>
        <div className="flex items-center justify-around gap-2">
          <div className="relative">
            <input
              type="text"
              value={startDate}
              onClick={() => {
                setShowStartCalendar(true);
                setShowEndCalendar(false);
              }}
              readOnly
              className="lg:w-[6rem]  border border-gray-200 rounded-lg px-[1.5rem] py-[1.1rem] pr-10 cursor-pointer"
              placeholder="YYYY.MM.DD"
            />
            <button
              onClick={() => {
                setShowStartCalendar(true);
                setShowEndCalendar(false);
              }}
              className="absolute right-5 top-1/2 -translate-y-1/2"
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
          <div className="text-1.25 font-500 px-[2rem]">~</div>
          <div className="relative">
            <input
              type="text"
              value={endDate}
              onClick={() => {
                setShowEndCalendar(true);
                setShowStartCalendar(false);
              }}
              readOnly
              className="lg:w-[6rem] border border-gray-200 rounded-lg px-[1.5rem] py-[1.1rem] pr-10 cursor-pointer"
              placeholder="YYYY.MM.DD"
            />
            <button
              onClick={() => {
                setShowEndCalendar(true);
                setShowStartCalendar(false);
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2"
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
      <div>
        <div className="text-gray-600 mb-2">광고위치</div>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="border border-gray-200 rounded-lg w-[16rem] px-[1.5rem] py-[1.1rem]"
            placeholder="위치를 입력해보세요. ex.송파구"
          />
          <button className="w-[5.75rem] px-[1.5rem] py-[1rem] bg-black text-white rounded-lg hover:bg-gray-800">
            조회
          </button>
        </div>
      </div>
    </div>
  </div>
);
export default DateLocationFilter;
