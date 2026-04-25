export type FieldErrors = Record<string, string[]>

export type ActionResult<TData = void> =
    | {
          ok: true
          data: TData
      }
    | {
          ok: false
          code?: string
          formError?: string
          fieldErrors?: FieldErrors
      }

export function actionSuccess<TData>(data: TData): ActionResult<TData> {
    return { ok: true, data }
}

export function actionFailure<TCode extends string>(
    code: TCode,
    formError: string,
    fieldErrors?: FieldErrors,
): ActionResult<never> {
    return {
        ok: false,
        code,
        formError,
        ...(fieldErrors ? { fieldErrors } : {}),
    }
}
