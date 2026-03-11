const SPACE_KEY = "vibepunch_space_id";

export function getStoredSpaceId(): string | null {
  return localStorage.getItem(SPACE_KEY);
}

export function setStoredSpaceId(spaceId: string) {
  localStorage.setItem(SPACE_KEY, spaceId);
}

export function clearStoredSpaceId() {
  localStorage.removeItem(SPACE_KEY);
}
