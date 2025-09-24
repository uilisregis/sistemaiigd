import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, X, Crop, RotateCw, Camera, ZoomIn, ZoomOut, Move } from 'lucide-react'
import { toast } from 'react-hot-toast'
import ImageCropper from './ImageCropper'

const PhotoUpload = ({ 
  currentPhoto, 
  onPhotoChange, 
  aspectRatio = 3/4, 
  maxSize = 5 * 1024 * 1024, // 5MB
  className = "" 
}) => {
  const [preview, setPreview] = useState(currentPhoto || null)
  const [originalFile, setOriginalFile] = useState(null)
  const [showCrop, setShowCrop] = useState(false)
  const [cropData, setCropData] = useState(null)
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState(null)
  const [currentFacingMode, setCurrentFacingMode] = useState('user')
  const [showNewCropper, setShowNewCropper] = useState(false)
  const [imageForCrop, setImageForCrop] = useState(null)
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const videoRef = useRef(null)
  const cameraCanvasRef = useRef(null)

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem')
      return
    }

    // Validar tamanho
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Máximo 5MB')
      return
    }

    // Armazenar arquivo original
    setOriginalFile(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      console.log('📁 Arquivo selecionado, abrindo novo cropper')
      setImageForCrop(e.target.result)
      setShowNewCropper(true)
    }
    reader.readAsDataURL(file)
  }, [maxSize])

  const handleCrop = useCallback(() => {
    console.log('🎯 HANDLE CROP CHAMADO!', { originalFile: !!originalFile, canvasRef: !!canvasRef.current })
    
    if (!originalFile || !canvasRef.current) {
      console.error('❌ ERRO: originalFile ou canvasRef não encontrado')
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      console.log('🖼️ Imagem carregada no canvas!')
      console.log('🖼️ Imagem carregada:', {
        width: img.width,
        height: img.height,
        zoom,
        position,
        rotation
      })

      // Dimensões do canvas de saída (3x4)
      const canvasWidth = 300
      const canvasHeight = 400
      
      canvas.width = canvasWidth
      canvas.height = canvasHeight

      // Limpar canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)

      // MÉTODO POR VIEWPORT - MUITO MAIS SIMPLES E CONFIÁVEL:
      // Vou calcular baseado no que está visível no preview (300x400)
      
      // 1. Calcular a área central da imagem (3x4) - área base
      const imgAspect = img.width / img.height
      const targetAspect = 3 / 4 // 0.75
      
      let baseSourceX, baseSourceY, baseSourceWidth, baseSourceHeight
      
      if (imgAspect > targetAspect) {
        // Imagem é mais larga, cortar laterais
        baseSourceHeight = img.height
        baseSourceWidth = img.height * targetAspect
        baseSourceX = (img.width - baseSourceWidth) / 2
        baseSourceY = 0
      } else {
        // Imagem é mais alta, cortar topo/baixo
        baseSourceWidth = img.width
        baseSourceHeight = img.width / targetAspect
        baseSourceX = 0
        baseSourceY = (img.height - baseSourceHeight) / 2
      }

      // 2. CALCULAR O QUE ESTÁ VISÍVEL NO PREVIEW (300x400)
      // O preview mostra uma área específica da imagem baseada no zoom e posição
      const previewWidth = 300
      const previewHeight = 400
      
      // Calcular a área visível baseada no zoom
      const visibleWidth = baseSourceWidth / zoom
      const visibleHeight = baseSourceHeight / zoom
      
      // Calcular offset baseado na posição (convertendo de pixels do preview para pixels da imagem)
      const offsetX = (position.x / previewWidth) * baseSourceWidth
      const offsetY = (position.y / previewHeight) * baseSourceHeight
      
      // Coordenadas finais da área visível
      const finalSourceX = baseSourceX + offsetX
      const finalSourceY = baseSourceY + offsetY

      console.log('📐 MÉTODO POR VIEWPORT:', {
        imgAspect,
        targetAspect,
        baseSourceX,
        baseSourceY,
        baseSourceWidth,
        baseSourceHeight,
        visibleWidth,
        visibleHeight,
        offsetX,
        offsetY,
        finalSourceX,
        finalSourceY
      })

      // VALIDAR E CORRIGIR COORDENADAS
      let correctedSourceX = finalSourceX
      let correctedSourceY = finalSourceY
      
      // Garantir que não saia dos limites da imagem
      if (correctedSourceX < 0) correctedSourceX = 0
      if (correctedSourceY < 0) correctedSourceY = 0
      if (correctedSourceX + visibleWidth > img.width) {
        correctedSourceX = img.width - visibleWidth
      }
      if (correctedSourceY + visibleHeight > img.height) {
        correctedSourceY = img.height - visibleHeight
      }
      
      console.log('🔧 COORDENADAS FINAIS:', {
        original: { finalSourceX, finalSourceY },
        corrected: { correctedSourceX, correctedSourceY },
        visibleWidth,
        visibleHeight,
        imgWidth: img.width,
        imgHeight: img.height
      })

      // Desenhar a área visível no canvas 3x4
      ctx.drawImage(
        img,
        correctedSourceX, correctedSourceY, visibleWidth, visibleHeight,  // Área de origem na imagem
        0, 0, canvasWidth, canvasHeight  // Área de destino no canvas (sempre 3x4)
      )
      
      console.log('✅ Canvas desenhado com sucesso - ÁREA LIMITADA')
      
      // Converter para blob e chamar callback
      canvas.toBlob((blob) => {
        if (blob) {
          console.log('📁 Blob criado:', blob.size, 'bytes')
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
          console.log('📤 Chamando onPhotoChange com arquivo:', file.name, file.size, 'bytes')
          onPhotoChange(file)
          setShowCrop(false)
          setZoom(1)
          setPosition({ x: 0, y: 0 })
          setRotation(0)
          toast.success('Foto recortada com sucesso!')
        } else {
          console.error('❌ ERRO: Blob não foi criado')
        }
      }, 'image/jpeg', 0.9)
    }
    
    // Usar o arquivo original em vez do preview
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target.result
    }
    reader.readAsDataURL(originalFile)
  }, [originalFile, rotation, zoom, position, onPhotoChange])

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5))
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    
    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y
    
    // LIMITAR MOVIMENTO PARA DENTRO DA ÁREA VISÍVEL (300x400)
    // Calcular limites baseados no zoom
    const maxX = Math.max(0, (300 * (zoom - 1)) / 2)
    const maxY = Math.max(0, (400 * (zoom - 1)) / 2)
    
    const limitedX = Math.max(-maxX, Math.min(maxX, newX))
    const limitedY = Math.max(-maxY, Math.min(maxY, newY))
    
    setPosition({ x: limitedX, y: limitedY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleRemovePhoto = () => {
    setPreview(null)
    setShowCrop(false)
    setShowCamera(false)
    setShowNewCropper(false)
    onPhotoChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCropComplete = useCallback((croppedFile) => {
    console.log('✅ CROP COMPLETO COM NOVA BIBLIOTECA:', croppedFile.name, croppedFile.size, 'bytes')
    setPreview(URL.createObjectURL(croppedFile))
    setShowNewCropper(false)
    onPhotoChange(croppedFile)
  }, [onPhotoChange])

  const handleCropCancel = useCallback(() => {
    console.log('❌ Crop cancelado')
    setShowNewCropper(false)
    setImageForCrop(null)
  }, [])

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const startCamera = async (facingMode = 'user') => {
    try {
      // Parar stream anterior se existir
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: facingMode
        } 
      })
      
      setStream(mediaStream)
      setShowCamera(true)
      
      // Aguardar um pouco para garantir que o vídeo seja carregado
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.play()
        }
      }, 100)
    } catch (error) {
      toast.error('Erro ao acessar a câmera: ' + error.message)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  const switchCamera = () => {
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user'
    setCurrentFacingMode(newFacingMode)
    startCamera(newFacingMode)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !cameraCanvasRef.current) return

    const video = videoRef.current
    const canvas = cameraCanvasRef.current
    const ctx = canvas.getContext('2d')

    // Verificar se o vídeo está carregado
    if (video.readyState < 2) {
      toast.error('Vídeo ainda não carregado. Aguarde um momento.')
      return
    }

    // Definir dimensões do canvas para 3x4
    canvas.width = 300
    canvas.height = 400

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Calcular dimensões para manter proporção
    const videoAspect = video.videoWidth / video.videoHeight
    const canvasAspect = canvas.width / canvas.height
    
    let sourceX = 0, sourceY = 0, sourceWidth = video.videoWidth, sourceHeight = video.videoHeight
    
    if (videoAspect > canvasAspect) {
      // Vídeo é mais largo, cortar laterais
      sourceWidth = video.videoHeight * canvasAspect
      sourceX = (video.videoWidth - sourceWidth) / 2
    } else {
      // Vídeo é mais alto, cortar topo/baixo
      sourceHeight = video.videoWidth / canvasAspect
      sourceY = (video.videoHeight - sourceHeight) / 2
    }

    // Desenhar frame do vídeo no canvas
    ctx.drawImage(
      video, 
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, canvas.width, canvas.height
    )

    // Converter para blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })
        setPreview(URL.createObjectURL(blob))
        onPhotoChange(file)
        stopCamera()
        toast.success('Foto capturada com sucesso!')
      } else {
        toast.error('Erro ao processar a foto')
      }
    }, 'image/jpeg', 0.9)
  }

  // Cleanup da câmera quando componente desmonta
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Preview da foto atual */}
      {preview && !showCrop && (
        <div className="relative inline-block">
          <div className="w-24 h-32 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemovePhoto}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Área de upload */}
      {!preview && (
        <div
          onClick={openFileDialog}
          className="w-24 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <Upload className="h-6 w-6 text-gray-400 mb-2" />
          <span className="text-xs text-gray-500 text-center">Clique para<br />adicionar foto</span>
        </div>
      )}

      {/* Botões de ação */}
      {preview && !showCrop && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openFileDialog}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <Upload className="h-4 w-4 inline mr-1" />
            Trocar Foto
          </button>
          <button
            type="button"
            onClick={startCamera}
            className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            <Camera className="h-4 w-4 inline mr-1" />
            Câmera
          </button>
          <button
            type="button"
            onClick={() => setShowCrop(true)}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            <Crop className="h-4 w-4 inline mr-1" />
            Recortar
          </button>
        </div>
      )}

      {/* Botões para quando não há foto */}
      {!preview && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openFileDialog}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <Upload className="h-4 w-4 inline mr-1" />
            Selecionar Foto
          </button>
          <button
            type="button"
            onClick={startCamera}
            className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            <Camera className="h-4 w-4 inline mr-1" />
            Tirar Foto
          </button>
        </div>
      )}

      {/* Modal de recorte */}
      {showCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recortar Foto (3x4)</h3>
              <button
                type="button"
                onClick={() => setShowCrop(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview do recorte */}
            <div className="mb-4 flex justify-center">
              <div className="relative overflow-hidden border-2 border-gray-300 rounded-lg" style={{ width: '300px', height: '400px' }}>
                <div 
                  className="relative cursor-move select-none"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease'
                  }}
                >
                  <img
                    ref={imageRef}
                    src={preview}
                    alt="Crop preview"
                    className="block"
                    style={{ 
                      width: '300px',
                      height: 'auto',
                      userSelect: 'none',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
                <div className="absolute inset-0 border-2 border-blue-500 border-dashed pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                      3x4
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Controles */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={handleZoomOut}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                <ZoomOut className="h-4 w-4" />
                Zoom -
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                <ZoomIn className="h-4 w-4" />
                Zoom +
              </button>
              <button
                type="button"
                onClick={handleRotate}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                <RotateCw className="h-4 w-4" />
                Girar
              </button>
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded">
                <Move className="h-4 w-4" />
                <span className="text-sm">Arrastar para posicionar</span>
              </div>
            </div>
            
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                Zoom: {Math.round(zoom * 100)}% | Posição: {position.x}, {position.y}
              </p>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCrop(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCrop}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Aplicar Recorte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal da Câmera */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Capturar Foto</h3>
              <button
                type="button"
                onClick={stopCamera}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 relative">
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '3/4', maxHeight: '60vh' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ 
                    transform: currentFacingMode === 'user' ? 'scaleX(-1)' : 'none'
                  }}
                />
                
                {/* Overlay com guias 3x4 */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg">
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                      3x4
                    </div>
                  </div>
                </div>

                {/* Indicador de câmera */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  {currentFacingMode === 'user' ? 'Frontal' : 'Traseira'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={switchCamera}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                <Camera className="h-4 w-4" />
                Trocar Câmera
              </button>
              
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              
              <button
                type="button"
                onClick={capturePhoto}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <Camera className="h-4 w-4 inline mr-2" />
                Capturar Foto
              </button>
            </div>

            <div className="mt-3 text-center">
              <p className="text-sm text-gray-600">
                Posicione a pessoa dentro do retângulo 3x4 e clique em "Capturar Foto"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Canvas oculto para processamento */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />

      {/* Canvas oculto para câmera */}
      <canvas
        ref={cameraCanvasRef}
        className="hidden"
      />

      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Novo Cropper com react-image-crop */}
      {showNewCropper && imageForCrop && (
        <ImageCropper
          src={imageForCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={aspectRatio}
        />
      )}
    </div>
  )
}

export default PhotoUpload
