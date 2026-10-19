import toast from 'react-hot-toast'
import { shareService } from '../services/featureService'

/** Creates a family link and opens the phone's share sheet (WhatsApp etc.), or copies it. */
export async function shareWithFamily(profileId, firstName, isOwn) {
  try {
    const { token } = await shareService.create(profileId)
    const url = `${window.location.origin}/family/${token}`
    const text = isOwn
      ? `Here's my matrimony profile — have a look: ${url}`
      : `Please have a look at ${firstName}'s profile: ${url}`
    if (navigator.share) {
      await navigator.share({ title: `${firstName}'s profile`, text, url }).catch(() => {})
      return
    }
    await navigator.clipboard?.writeText(url).catch(() => {})
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
    toast.success('Link copied — valid for 7 days')
  } catch (e) {
    toast.error(e.message || 'Could not create a share link')
  }
}
