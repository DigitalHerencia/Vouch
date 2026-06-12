export type HeaderBag = {
  get(name: string): string | null
}

export type RequestMetadataInput = {
  headers?: HeaderBag
}
