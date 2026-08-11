export function getBasePath() {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "";
}

export function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/today";
}
