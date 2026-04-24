import { toast } from 'sonner'

export function showAchievementUnlockedToast(title: string, description?: string) {
  toast.success(title, { description, duration: 5_000 })
}
