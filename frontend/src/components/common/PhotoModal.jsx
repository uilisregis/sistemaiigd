import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import { useState } from 'react'

export function PhotoModal({ isOpen, onClose, imageSrc, memberName }) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleReset = () => {
    setScale(1)
    setRotation(0)
  }

  if (!isOpen || !imageSrc) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Controles */}
        <div className="absolute top-4 left-4 flex space-x-2 z-10">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          
          <button
            onClick={handleRotate}
            className="p-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
          >
            <RotateCw className="h-5 w-5" />
          </button>
          
          <button
            onClick={handleReset}
            className="p-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors text-sm"
          >
            Reset
          </button>
        </div>

        {/* Botão de fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Nome do membro */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg z-10">
          <h3 className="text-lg font-medium">{memberName}</h3>
        </div>

        {/* Imagem */}
        <div className="max-w-full max-h-full overflow-auto">
          <img
            src={imageSrc}
            alt={memberName}
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
          />
        </div>

        {/* Informações de zoom */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg z-10">
          <span className="text-sm">
            Zoom: {Math.round(scale * 100)}% | Rotação: {rotation}°
          </span>
        </div>
      </div>
    </div>
  )
}
