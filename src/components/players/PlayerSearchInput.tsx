import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'

interface PlayerSearchInputProps {
  value: string
  onChange: (value: string) => void
  debounceMs?: number
}

export function PlayerSearchInput({
  value,
  onChange,
  debounceMs = 200,
}: PlayerSearchInputProps) {
  const [localValue, setLocalValue] = useState(value)
  const lastEmittedRef = useRef(value)

  // Sync external value changes (not our own debounced updates coming back)
  useEffect(() => {
    if (value !== lastEmittedRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional sync of external prop to local state
      setLocalValue(value)
      lastEmittedRef.current = value
    }
  }, [value])

  // Debounce the onChange callback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== lastEmittedRef.current) {
        lastEmittedRef.current = localValue
        onChange(localValue)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [localValue, debounceMs, onChange])

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search players..."
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="bg-neutral-900/50 border-neutral-700/50 text-white placeholder:text-neutral-500 pr-8"
      />
      {localValue && (
        <button
          type="button"
          onClick={() => {
            setLocalValue('')
            onChange('')
          }}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
