export type { LoginFormProps, LoginFormValues, SignupFormProps, SignupFormValues } from "./auth"

type AuthSearchParams = Promise<{
  redirect_url?: string
  return_to?: string
}>

export type LoginPageProps = {
  searchParams: AuthSearchParams
}

export type SignupPageProps = {
  searchParams: AuthSearchParams
}

