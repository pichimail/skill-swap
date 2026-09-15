export function normalizeSkill(skill: string) {
  return skill.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function getClientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip')?.trim() || 'unknown';
}
