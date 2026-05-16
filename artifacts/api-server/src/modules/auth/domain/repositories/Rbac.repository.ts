export interface IRbacRepository {
  getAbilitiesByUserId(userId: string): Promise<Record<string, string[]>>;
}
