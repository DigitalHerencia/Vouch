'use client'

import { UserButton } from '@clerk/nextjs'

export function UserMenu() {
    return (
        <UserButton
            appearance={{
                elements: {
                    userButtonTrigger:
                        'rounded-full border border-neutral-700 transition-colors hover:border-blue-500 hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                    avatarBox:
                        'h-9 w-9 rounded-full bg-blue-600 text-neutral-100 transition-colors hover:bg-blue-500',
                    userButtonAvatarBox:
                        'h-9 w-9 rounded-full bg-blue-600 text-neutral-100 transition-colors hover:bg-blue-500',
                    userButtonPopoverCard:
                        'border border-neutral-700 bg-neutral-950 text-neutral-100 shadow-2xl shadow-black/40',
                    userButtonPopoverActionButton:
                        'text-neutral-100 hover:bg-blue-600 hover:text-neutral-100',
                    userButtonPopoverActionButtonText: 'text-neutral-100',
                },
            }}
        />
    )
}
