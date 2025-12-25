import React from 'react'
import Title from './Title'


{/*
const Newsletter = () => {
    return (
        <div className='flex flex-col items-center mx-4 my-36 font-serif'>
            <Title title="The Charis Journal" description="Subscribe to the Charis Journal for privileged access to new arrivals, limited pieces, and refined inspirations from our atelier." visibleButton={false} />
            <div className='flex bg-slate-100 text-sm p-1 rounded-full w-full max-w-xl my-10 border-2 border-white ring ring-slate-200'>
                <input className='flex-1 pl-5 outline-none' type="text" placeholder='Enter your email address' />
                <button className='font-medium bg-green-500 text-white px-7 py-3 rounded-full hover:scale-103 active:scale-95 transition'>Get Updates</button>
            </div>
        </div>
    )
}

export default Newsletter
*/}

const Newsletter = () => {
  return (
    <div className="flex flex-col items-center mx-4 my-30 ">
      
      {/* Gradient title */}
      <h2 className="
        text-4xl font-semibold tracking-wide text-center
        font-serif
        bg-gradient-to-r from-orange-700 via-blue-500 to-orange-600
        bg-clip-text text-transparent
      ">
        The Charis Journal
      </h2>

      {/* Description */}
      <p className="mt-4 max-w-xl text-center text-slate-600 font-'Georgia'">
        Subscribe to the Charis Journal for privileged access to new arrivals, <br></br>limited pieces, and refined inspirations from our atelier.
      </p>

      {/* Input */}
      <div className="flex bg-slate-100 text-sm p-1 rounded-full w-full max-w-xl my-10 border-2 border-white ring ring-slate-200">
        <input
          className="flex-1 pl-5 outline-none bg-transparent placeholder:text-slate-400"
          type="email"
          placeholder="Enter your email address"
        />
        <button className="font-medium bg-[#8a5a2b] text-white px-7 py-3 rounded-full hover:scale-105 active:scale-95 transition">
          Get Updates
        </button>
      </div>

    </div>
  );
};

export default Newsletter
