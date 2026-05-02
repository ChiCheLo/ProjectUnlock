import { ref } from 'vue'

export const isMuted = ref(false)

export function toggleMute() {
  isMuted.value = !isMuted.value
}
