/**
 * webLog.ts
 * 統一的網頁操作 Log 發送工具
 *
 * 使用方式：
 *   import { sendLog } from '@/api/webLog'
 *   await sendLog('進入搶答模式')
 */

export async function sendLog(record: string): Promise<void> {
  const studentId = localStorage.getItem('student_id')
  if (!studentId) return   // 未登入不記錄

  try {
    await fetch('/api/web-log/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: Number(studentId), record })
    })
  } catch {
    // Log 失敗不中斷使用者操作
  }
}
