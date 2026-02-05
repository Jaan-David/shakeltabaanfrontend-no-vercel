import React from 'react'

const AboutUsSection = () => {
    return (
      <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[16%] min-h-[220px] sm:min-h-[200px] md:min-h-[190px] lg:h-[25vh] flex flex-col justify-end items-end pt-8" suppressHydrationWarning>
        <div className="w-full sm:w-[95%] md:w-[90%] lg:w-[85%] min-h-[7vh] sm:min-h-[6vh] md:min-h-[5vh] flex flex-row  items-center gap-1 sm:gap-2 md:gap-3 mx-auto px-1 sm:px-2">
          {/* company name - positioned on the left */}
          <div className="w-[45%] sm:w-[40%] md:w-[50%] lg:w-[55%] min-h-[5vh] sm:min-h-[4.5vh] flex justify-start items-center ">
            <span className="font-beiruti font-semibold text-base sm:text-lg md:text-xl lg:text-2xl text-[#f1f5f9]">منصة شق الثعبان</span>
          </div>
          
          {/* logo - positioned on the right */}
          <div className="w-[50%] sm:w-[40%] md:w-[50%]   lg:w-[50%] h-[6vh] sm:h-[6.5vh] md:h-[7vh] lg:h-[100%] flex  ">
            <img
            src="/logo/logo2.png"
            alt="شق التعبان"
            className="w-full h-full object-contain "
            />
          </div>
        </div>
        <p className="w-full h-auto lg:h-[70%] opacity-100 rotate-0 text-sm sm:text-base leading-relaxed sm:leading-none tracking-normal text-right font-medium font-beiruti pt-6 sm:pt-7 md:pt-8 lg:pt-10 px-2 sm:px-3 md:px-4 lg:px-0 text-[#f1f5f9]">
          منصة متخصصة في جميع انواع الرخام 
        </p>

      </div>
    );
  };
export default React.memo(AboutUsSection)