import React from 'react';

export const Logo = () => {
	return(
		<div className="flex flex-col items-center justify-center w-full max-w-[280px] xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl gap-2 xs:gap-3 sm:gap-4">
			{/* logo */}
			<div className="w-28 xs:w-32 sm:w-36 md:w-40 lg:w-44 xl:w-52">
				<img
				src="/logo/logo2.png"
				alt="ShakElTaaban Logo"
				className="w-full h-auto object-contain"
				/>
			</div>
    </div>
	)
	
};
export default React.memo(Logo);