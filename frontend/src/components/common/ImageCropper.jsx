import React, { useState, useRef, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'

const ImageCropper = ({ src, onCropComplete, onCancel }) => {
  const imgRef = useRef(null)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  
  const [cropArea, setCropArea] = useState({ x: 100, y: 50, width: 300, height: 400 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)

  // Quando a imagem carregar, centralizar a área de crop
  const onImageLoad = useCallback(() => {
    if (imgRef.current) {
      const img = imgRef.current
      const containerWidth = 600
      const containerHeight = 500
      
      // Área de crop 3x4 (300x400)
      const cropWidth = 300
      const cropHeight = 400
      
      // Centralizar
      const x = (containerWidth - cropWidth) / 2
      const y = (containerHeight - cropHeight) / 2
      
      setCropArea({ x, y, width: cropWidth, height: cropHeight })
      setImageLoaded(true)
    }
  }, [])

  // Iniciar arraste
  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - cropArea.x,
      y: e.clientY - cropArea.y
    })
  }, [cropArea])

  // Event listeners para arrastar
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && imgRef.current) {
        const img = imgRef.current
        const newX = e.clientX - dragStart.x
        const newY = e.clientY - dragStart.y
        
        // Limitar dentro da imagem
        const maxX = Math.max(0, img.offsetWidth - cropArea.width)
        const maxY = Math.max(0, img.offsetHeight - cropArea.height)
        
        setCropArea(prev => ({
          ...prev,
          x: Math.max(0, Math.min(maxX, newX)),
          y: Math.max(0, Math.min(maxY, newY))
        }))
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart, cropArea.width, cropArea.height])

  // CROP SIMPLES E EFICAZ - ALTA QUALIDADE
  const getCroppedImg = useCallback(() => {
    if (!imgRef.current || !canvasRef.current || !imageLoaded) {
      toast.error('Aguarde a imagem carregar')
      return
    }

    const image = imgRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    try {
      // Canvas de alta qualidade (600x800 = 3x4 em alta resolução)
      canvas.width = 600
      canvas.height = 800

      // Calcular escala da imagem original para a exibida
      const scaleX = image.naturalWidth / image.offsetWidth
      const scaleY = image.naturalHeight / image.offsetHeight
      
      // Coordenadas na imagem original (alta qualidade)
      const sourceX = cropArea.x * scaleX
      const sourceY = cropArea.y * scaleY
      const sourceWidth = cropArea.width * scaleX
      const sourceHeight = cropArea.height * scaleY

      // Fundo branco
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 600, 800)
      
      // Desenhar com alta qualidade
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      ctx.drawImage(
        image,
        sourceX, sourceY, sourceWidth, sourceHeight,  // Área de origem (alta resolução)
        0, 0, 600, 800                                 // Destino (alta qualidade)
      )

      // Converter para arquivo JPEG de alta qualidade
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `member-photo-${Date.now()}.jpg`, { 
            type: 'image/jpeg' 
          })
          onCropComplete(file)
          onCancel()
          toast.success('Foto salva com alta qualidade!')
        } else {
          toast.error('Erro ao salvar foto')
        }
      }, 'image/jpeg', 1.0) // Qualidade máxima
      
    } catch (error) {
      toast.error('Erro ao processar imagem')
    }
  }, [cropArea, imageLoaded, onCropComplete, onCancel])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recortar Foto (3x4) - Alta Qualidade</h3>
          <button 
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Container da imagem - SEM ZOOM COMPLICADO */}
        <div className="mb-4 flex justify-center">
          <div 
            ref={containerRef}
            className="relative border-2 border-gray-300 bg-gray-100"
            style={{ width: '600px', height: '500px', overflow: 'hidden' }}
          >
            <img
              ref={imgRef}
              src={src}
              onLoad={onImageLoad}
              alt="Imagem para recortar"
              className="w-full h-full object-contain select-none"
              draggable={false}
            />
            
            {/* Área de crop - 3x4 */}
            {imageLoaded && (
              <div
                className="absolute border-4 border-blue-500 bg-blue-500 bg-opacity-10 cursor-move"
                style={{
                  left: cropArea.x,
                  top: cropArea.y,
                  width: cropArea.width,
                  height: cropArea.height,
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
                }}
                onMouseDown={handleMouseDown}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-blue-500 text-white px-3 py-1 rounded font-bold text-lg">
                    3x4 - ARRASTE PARA POSICIONAR
                  </div>
                </div>
                
                {/* Cantos para indicar que é arrastável */}
                <div className="absolute top-0 left-0 w-4 h-4 bg-blue-500"></div>
                <div className="absolute top-0 right-0 w-4 h-4 bg-blue-500"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 bg-blue-500"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500"></div>
              </div>
            )}
          </div>
        </div>

        {/* Instruções */}
        <div className="mb-4 text-center text-gray-600">
          <p className="text-lg">📦 <strong>Arraste a área azul</strong> para posicionar sobre o rosto</p>
          <p className="text-sm">A foto será salva em alta qualidade (600x800 pixels)</p>
        </div>

        {/* Canvas oculto */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Botões */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={getCroppedImg}
            disabled={!imageLoaded}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold"
          >
            💾 Salvar Foto (Alta Qualidade)
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImageCropper