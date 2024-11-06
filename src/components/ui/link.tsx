
import clsx from 'clsx'
import NextLink from 'next/link'
import React from 'react'

export const Link = NextLink


export type EmailLinkProps = { email: string } & Omit<React.ComponentPropsWithoutRef<'a'>, 'href'>

export function EmailLink({ email, className, ...props}: EmailLinkProps) {

    if(email == '') return null

    return <a
        {...props}
        className={clsx(
            className,
            'hover:underline'
        )}
        href={`mailto:${email}`}
    >{email}</a>
}

export type PhoneLinkProps = { phoneNumber: string } & Omit<React.ComponentPropsWithoutRef<'a'>, 'href'>

export function PhoneLink({ phoneNumber, className, ...props}: PhoneLinkProps) {
    if(phoneNumber == '') return null

    let linkNumber = phoneNumber, displayNumber = phoneNumber
    if(phoneNumber.startsWith('642')) {
        // NZ Cell Number
        linkNumber = '+' + phoneNumber
        displayNumber = `0${phoneNumber.slice(2, 4)} ${phoneNumber.slice(4, 7)} ${phoneNumber.slice(7)}`
    }

    return <a
        {...props}
        className={clsx(
            className,
            'font-mono hover:underline'
        )}
        href={`tel:${linkNumber}`}
    >{displayNumber}</a>

    
}