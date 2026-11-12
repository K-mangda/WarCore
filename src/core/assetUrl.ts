/** Resolve public assets under either a site root or a repository subpath. */
export function assetUrl(path:string){
  return (import.meta.env?.BASE_URL??'/')+path.replace(/^\/+/, '');
}
