export const FREE_LESSON_LIMIT = 1;
export const FREE_TRAINING_LIMIT = 1;

export type AccessPlan = "free" | "paid";

export function effectiveAccessPlan(user: { role: string; accessPlan: AccessPlan }): AccessPlan {
  return user.role === "admin" ? "paid" : user.accessPlan;
}

export function canAccessLesson(user: { role: string; accessPlan: AccessPlan }, lessonNumber: number) {
  return effectiveAccessPlan(user) === "paid" || lessonNumber <= FREE_LESSON_LIMIT;
}
