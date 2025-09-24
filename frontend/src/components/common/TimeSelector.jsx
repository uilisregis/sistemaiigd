import { Clock } from 'lucide-react'

const timeOptions = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
]

export function TimeSelector({ selectedTimes, onTimesChange }) {
  const handleTimeToggle = (time) => {
    if (selectedTimes.includes(time)) {
      onTimesChange(selectedTimes.filter(t => t !== time))
    } else {
      onTimesChange([...selectedTimes, time])
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        <Clock className="inline h-4 w-4 mr-1" />
        Horários do Culto
      </label>
      
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
        {timeOptions.map((time) => (
          <button
            key={time}
            type="button"
            onClick={() => handleTimeToggle(time)}
            className={`
              px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 border-2
              ${selectedTimes.includes(time)
                ? 'bg-blue-700 text-white border-blue-700 shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md'
              }
            `}
          >
            {time}
          </button>
        ))}
      </div>
      
      {selectedTimes.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-700 mb-3 font-medium">Horários selecionados:</p>
          <div className="flex flex-wrap gap-2">
            {selectedTimes.map((time) => (
              <span
                key={time}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-700 text-white shadow-md"
              >
                {time}
                <button
                  type="button"
                  onClick={() => handleTimeToggle(time)}
                  className="ml-2 text-white hover:text-red-200 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-2">
        💡 Selecione os horários em que este culto acontece
      </p>
    </div>
  )
}