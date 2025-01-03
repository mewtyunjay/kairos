import { useState } from 'react'

interface TaskInputProps {
  onPlanDay: () => void
  isLoading: boolean
}

export default function TaskInput({ onPlanDay, isLoading }: TaskInputProps) {
  const [input, setInput] = useState('')

  return (
    <div className="bg-zinc-800 rounded-lg p-4">
      <textarea
        className="w-full bg-transparent resize-none h-24 focus:outline-none"
        placeholder="what do you need to do today..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="flex justify-center mt-4">
        <button
          className="bg-zinc-800 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors duration-200 flex items-center"
          onClick={onPlanDay}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'plan my day →'
          )}
        </button>
      </div>
    </div>
  )
}

