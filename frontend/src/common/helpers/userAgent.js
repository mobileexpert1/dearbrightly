export const isInstagramWebview = () => {
  if (navigator.userAgent.includes("Instagram")) {
   return true
  }
  return false
}