export type DateLike = Date | string | number

export type ConfirmationWindowInput = {
    now?: DateLike
    confirmationOpensAt: DateLike
    confirmationExpiresAt: DateLike
}

export type ValidConfirmationWindowInput = {
    meetingStartsAt?: DateLike
    confirmationOpensAt: DateLike
    confirmationExpiresAt: DateLike
}

export function toDate(value: DateLike): Date {
    const date = value instanceof Date ? value : new Date(value)

    if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid date value.")
    }

    return date
}

export function isConfirmationWindowOpen(input: ConfirmationWindowInput): boolean {
    const now = input.now === undefined ? new Date() : toDate(input.now)
    const opensAt = toDate(input.confirmationOpensAt)
    const expiresAt = toDate(input.confirmationExpiresAt)

    return now >= opensAt && now <= expiresAt
}

export function isConfirmationWindowClosed(input: ConfirmationWindowInput): boolean {
    const now = input.now === undefined ? new Date() : toDate(input.now)
    const expiresAt = toDate(input.confirmationExpiresAt)

    return now > expiresAt
}

export function assertValidConfirmationWindow(input: ValidConfirmationWindowInput): void {
    const opensAt = toDate(input.confirmationOpensAt)
    const expiresAt = toDate(input.confirmationExpiresAt)

    if (opensAt >= expiresAt) {
        throw new Error("confirmationOpensAt must be before confirmationExpiresAt.")
    }

    if (input.meetingStartsAt !== undefined) {
        const meetingStartsAt = toDate(input.meetingStartsAt)

        if (meetingStartsAt > expiresAt) {
            throw new Error("meetingStartsAt must be before or equal to confirmationExpiresAt.")
        }
    }
}
