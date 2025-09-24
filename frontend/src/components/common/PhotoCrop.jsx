import { useState, useRef, useEffect } from 'react'
import { X, RotateCw, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from './Button'

export function PhotoCrop({ 
  isOpen, 
  onClose, 
  onCrop, 
  imageFile, 
  aspectRatio = 3/4 // 3x4 ratio
}) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [imageSrc, setImageSrc] = useState('')
  const canvasRef = useRef(null)
  const imageRef = useRef(null)

  useEffect(() => {
    if (imageFile && isOpen) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImageSrc(e.target.result)
      }
      reader.readAsDataURL(imageFile)
    }
  }, [imageFile, isOpen])

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleCrop = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const image = imageRef.current

    if (!canvas || !ctx || !image) return

    // Configurar canvas para 3x4 em alta qualidade (600x800)
    const cropWidth = 600
    const cropHeight = 800
    canvas.width = cropWidth
    canvas.height = cropHeight

    // Limpar canvas
    ctx.clearRect(0, 0, cropWidth, cropHeight)

    // NOVA LÓGICA: Crop baseado na área azul visível
    // A área azul ocupa 75% da largura e 100% da altura
    const cropAreaWidth = cropWidth * 0.75  // 450px
    const cropAreaHeight = cropHeight        // 800px
    const cropAreaX = cropWidth * 0.125     // 75px (centrado)
    const cropAreaY = 0                     // 0px

    // Calcular escala para preencher a área de crop
    const scaleX = cropAreaWidth / image.naturalWidth
    const scaleY = cropAreaHeight / image.naturalHeight
    const scale = Math.max(scaleX, scaleY) // Preencher completamente a área

    // Calcular dimensões da imagem escalada
    const scaledWidth = image.naturalWidth * scale
    const scaledHeight = image.naturalHeight * scale

    // Calcular posição para centralizar na área de crop
    const x = cropAreaX + (cropAreaWidth - scaledWidth) / 2
    const y = cropAreaY + (cropAreaHeight - scaledHeight) / 2

    // Debug
    console.log('NOVO Crop Debug:', {
      cropArea: { width: cropAreaWidth, height: cropAreaHeight, x: cropAreaX, y: cropAreaY },
      originalSize: { width: image.naturalWidth, height: image.naturalHeight },
      scales: { scaleX, scaleY, finalScale: scale },
      scaledSize: { width: scaledWidth, height: scaledHeight },
      finalPosition: { x, y }
    })

    // Configurar qualidade de renderização
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Aplicar rotação se necessário
    if (rotation !== 0) {
      ctx.save()
      ctx.translate(cropWidth / 2, cropHeight / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-cropWidth / 2, -cropHeight / 2)
    }

    // Desenhar imagem na posição calculada
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight)

    if (rotation !== 0) {
      ctx.restore()
    }

    // Converter para blob com alta qualidade
    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], 'cropped-photo.jpg', {
          type: 'image/jpeg'
        })
        onCrop(croppedFile)
        onClose()
      }
    }, 'image/jpeg', 0.95) // Qualidade 95%
  }

  if (!isOpen || !imageSrc) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recortar Foto (3x4) - Alta Qualidade</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Controles */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
            >
              <ZoomOut className="h-4 w-4 mr-1" />
              Zoom -
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRotate}
            >
              <RotateCw className="h-4 w-4 mr-1" />
              Girar
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
            >
              <ZoomIn className="h-4 w-4 mr-1" />
              Zoom +
            </Button>
          </div>

          {/* Área de crop */}
          <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden" style={{ aspectRatio: '3/4', maxHeight: '500px' }}>
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Preview"
              className="w-full h-full object-contain"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
                transformOrigin: 'center center',
                imageRendering: 'high-quality'
              }}
              draggable={false}
            />
            
            {/* Overlay de crop */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>
              <div 
                className="absolute border-2 border-blue-500 rounded-lg bg-blue-500 bg-opacity-20"
                style={{
                  width: '75%',
                  height: '100%',
                  top: '0',
                  left: '12.5%'
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-sm font-medium bg-blue-500 px-3 py-1 rounded-full">
                    3x4 - ARRASTE PARA POSICIONAR
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instruções */}
          <div className="text-center text-sm text-gray-600">
            <p>Arraste a área azul para posicionar sobre o rosto</p>
            <p className="text-xs mt-1">A foto será salva em alta qualidade (600x800 pixels)</p>
          </div>

          {/* Botões */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCrop}
              className="flex-1"
            >
              Salvar Foto (Alta Qualidade)
            </Button>
          </div>
        </div>

        {/* Canvas oculto para processamento */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  )
}
