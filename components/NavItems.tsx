'use client'
import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

const NavItems = () => {

    const pathname = usePathname();
  return (
    <ul className='flex flex-row items-center mb-10 gap-5'>
        <li>
            <Link href='/' className={cn('font-semibold', pathname === '/' ? 'text-light-200': 'text-light-100')}>Home</Link>
        </li>
        <li>
            <Link href='/search' className={cn('font-semibold', pathname === '/search' ? 'text-light-200': 'text-light-100')}>Search</Link>
        </li>
        <li>
            <Link href='/profile' className={cn('font-semibold', pathname === '/profile' ? 'text-light-200': 'text-light-100')}>Profile</Link>
        </li>
    </ul>
  )
}

export default NavItems