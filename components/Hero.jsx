'use client'
import { assets } from '@/assets/assets'
import { ArrowRightIcon, ChevronRightIcon, ArrowRightSquareIcon, ArrowBigRightDashIcon, ArrowRightFromLineIcon, ArrowRightCircle, ArrowUpRightSquare, ArrowRightToLineIcon} from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import CategoriesMarquee from './CategoriesMarquee'

const Hero = () => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'

    return (
        <div className='mx-6'>
            <div className='flex flex-col gap-8 max-w-7xl mx-auto my-10'>

             {/* ================= BIG HERO CARD ================= */}
<div
  className="
    relative
    w-full
    max-w-[95vw]
    min-h-[80vh]
    mx-auto
    flex flex-col
    rounded-4xl
    overflow-hidden
    group
  "
>
  {/* Background Image */}
  <Image
    src={assets.CoverBC}
    alt="Hero background"
    fill
    priority
    className="object-cover"
  />


  {/* Dark overlay */}{/*
  <div className='absolute inset-0 bg-black/40' />
  */}

  {/* Content */}
  <div className='relative z-10 p-5 sm:p-16 flex flex-col'>

      {/* Badge top-left */}
    



<div
  className="
    relative inline-flex items-center gap-2
    bg-gradient-to-r from-orange-300 to-white
    text-black p-2 rounded-full
    text-sm sm:text-base font-medium font-[Garamond] mb-4
    group shadow-lg
    hover:shadow-[0_0_25px_rgba(59,130,246,0.75)]
    hover:brightness-110
    transition-all duration-300
  "
>
  {/* Badge */}
  <span className="bg-gradient-to-r from-blue-800 to-blue-200 px-4 py-1.5 rounded-full text-white text-sm sm:text-base font-[Garamond] font-semibold shadow-lg">
    The Perfect Gift!
  </span>

  {/* Label */}
  <span className="uppercase tracking-wide font-[Georgia]">
    Purchase as a Gift Card
  </span>

  {/* Icon */}
  <ArrowRightSquareIcon
    className="ml-2 text-black"
    size={30}
  />
</div>







      
      
{/* Big heading (left aligned) */}
<h2
  className="
    text-6xl sm:text-6xl lg:text-7xl text-white
    leading-tight sm:leading-tight
    my-10 max-w-2xl
    font-serif font-semibold
    bg-gradient-to-r from-blue-900 via-slate-900 to-blue-900
    bg-clip-text text-transparent
  "
>
  A graceful collection of vivid arts & fine craftsmanship.
</h2>











      {/* Right-aligned block (Explore + button) */}
      <div className='flex flex-col items-end text-right mt-6'>
          <div className='text-white text-sm font-[Playball] font-semibold font-medium'>
              <p className='text-3xl'>Exclusive Artisan Creations</p>
              <p className='text-2xl'>Starting only at {currency} 499</p>
          </div>

          <button className='bg-slate-900 text-white text-sm py-2.5 px-7 sm:py-5 sm:px-12 mt-4 sm:mt-10 rounded-md hover:bg-black hover:scale-105 active:scale-95 transition'>
              EXPLORE THE GALLERY
          </button>
      </div>

  </div>

</div>




                {/* ================= SMALL CARDS ================= */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-sm text-slate-600'>

                    {/* Card 1 */}
                    <div className='flex items-center justify-between bg-orange-200 rounded-3xl p-6 px-8 group'>
                        <div>
                            <p className='text-3xl font-medium bg-gradient-to-r from-slate-800 to-[#FFAD51] bg-clip-text text-transparent max-w-40'>
                                Curators' Picks
                            </p>
                            <p className='flex items-center gap-1 mt-4'>
                                Thoughtfully chosen,<br></br>just for you
                                {/*<ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} />*/}
                            </p>
                        </div>
                        <Image className='w-40 rounded-2xl transition-all duration-300 group-hover:scale-105 group-hover:brightness-110 group-hover:shadow-xl' src={assets.hero_product_img1} alt='' />
                    </div>

                    {/* Card 2 */}
                    <div className='flex items-center justify-between bg-purple-200 rounded-3xl p-6 px-8 group'>
                        <div>
                            <p className='text-3xl font-medium bg-gradient-to-r from-purple-300 via-purple-400 to-purple-500  bg-clip-text text-transparent max-w-40'>
                                Get 10% Off
                            </p>
                            <p className='flex items-center gap-1 mt-4'>
                                Good taste,better price
                                {/*<ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} />*/}
                            </p>
                        </div>
                        <Image className='w-40 rounded-2xl transition-all duration-300 group-hover:scale-105 group-hover:brightness-110 group-hover:shadow-xl' src={assets.hero_product_img2} alt='' />
                    </div>

                    {/* Card 3 (NEW) */}
                    <div className='flex items-center justify-between bg-blue-200 rounded-3xl p-6 px-8 group'>
                        <div>
                            <p className='text-3xl font-medium bg-gradient-to-r from-slate-800 to-blue-200 bg-clip-text text-transparent max-w-40'>
                                New arrivals
                            </p>
                            <p className='flex items-center gap-1 mt-4'>
                                The latest,just landed
                                {/*<ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} />*/}
                            </p>
                        </div>
                        <Image className='w-40 rounded-2xl transition-all duration-300 group-hover:scale-105 group-hover:brightness-110 group-hover:shadow-xl' src={assets.hero_product_img3} alt='' />
                    </div>

                </div>
            </div>

            <CategoriesMarquee />
        </div>
    )
}

export default Hero
