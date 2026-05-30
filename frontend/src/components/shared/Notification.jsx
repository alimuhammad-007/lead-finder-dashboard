/**
 * components/shared/Notification.jsx
 * =====================================
 * Global toast notification that appears at the top-right.
 * Controlled by Zustand store via showNotification().
 */

import { motion } from 'framer-motion'
import { CheckCircle, XCircle, X } from 'lucide-react'
import useStore from '../../store/useStore'

export default function Notification({ type, message }) {
  const showNotification = useStore(s => s.showNotification)

  const isSuccess = type === 'success'

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, y: -10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className={`
        fixed top-5 right-5 z-50 flex items-center gap-3
        px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg
        max-w-sm text-sm font-medium
        ${isSuccess
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-red-500/10 border-red-500/30 text-red-300'
        }
      `}
    >
      {isSuccess
        ? <CheckCircle className="w-4 h-4 shrink-0" />
        : <XCircle    className="w-4 h-4 shrink-0" />
      }
      <span className="flex-1">{message}</span>
      <button
        onClick={() => showNotification(null, '')}
        className="opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}