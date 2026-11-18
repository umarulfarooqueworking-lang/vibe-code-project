// Video recording and frame snapshot export utility
// Exports 300 sequential frames as a true 30 FPS 10-second video or individual crisp snapshots

export function downloadFrameSnapshot(
  canvas: HTMLCanvasElement,
  frameIndex: number,
  format: 'image/jpeg' | 'image/png' = 'image/jpeg'
) {
  try {
    const frameNumber = String(frameIndex + 1).padStart(3, '0')
    const ext = format === 'image/png' ? 'png' : 'jpg'
    const dataUrl = canvas.toDataURL(format, 0.95)
    const link = document.createElement('a')
    link.download = `nike-sneaker-motion-frame-${frameNumber}.${ext}`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) {
    console.error('Failed to export snapshot:', err)
  }
}

export type ExportProgressCallback = (percent: number, status: string) => void

export async function export30FpsVideo(
  images: Array<HTMLImageElement | null>,
  cleanWatermark = true,
  onProgress?: ExportProgressCallback
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const width = 1280
      const height = 720
      const fps = 30
      const frameDuration = 1000 / fps // 33.33ms per frame
      const totalFrames = images.length

      const offscreen = document.createElement('canvas')
      offscreen.width = width
      offscreen.height = height
      const ctx = offscreen.getContext('2d')
      if (!ctx) {
        throw new Error('Could not create offscreen canvas context')
      }

      // Check supported MIME type
      const mimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4'
      ]
      const selectedMime = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm'

      const stream = offscreen.captureStream(fps)
      const recorder = new MediaRecorder(stream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 8000000 // 8 Mbps high quality
      })

      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: selectedMime })
        const url = URL.createObjectURL(videoBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `nike-sneaker-exploded-motion-10s-30fps.${selectedMime.includes('mp4') ? 'mp4' : 'webm'}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setTimeout(() => URL.revokeObjectURL(url), 10000)
        resolve(videoBlob)
      }

      recorder.start()

      let currentFrame = 0

      const renderCtx = ctx
      function drawAndStep() {
        if (currentFrame >= totalFrames) {
          onProgress?.(100, 'Finalizing video stream...')
          setTimeout(() => {
            recorder.stop()
          }, 300)
          return
        }

        const img = images[currentFrame]
        if (img && img.complete) {
          renderCtx.clearRect(0, 0, width, height)
          renderCtx.drawImage(img, 0, 0, width, height)

          // Seamless AI watermark cleanup in the bottom-right corner if requested
          if (cleanWatermark) {
            cleanBottomRightWatermark(renderCtx, 0, 0, width, height)
          }
        }

        currentFrame += 1
        const pct = Math.round((currentFrame / totalFrames) * 100)
        onProgress?.(pct, `Encoding frame ${currentFrame} of ${totalFrames} (30 FPS)...`)

        setTimeout(drawAndStep, frameDuration)
      }

      drawAndStep()
    } catch (err) {
      reject(err)
    }
  })
}

// Cleanly blends out the small bottom-right watermark star using adjacent matte background sampling
export function cleanBottomRightWatermark(
  ctx: CanvasRenderingContext2D,
  drawX: number,
  drawY: number,
  drawWidth: number,
  drawHeight: number
) {
  try {
    const scale = drawWidth / 1280
    // The watermark star is located at normalized (0.908, 0.916)
    const starX = drawX + drawWidth * 0.908
    const starY = drawY + drawHeight * 0.916
    const radius = Math.max(16 * scale, 14)

    // Sample the clean matte charcoal color right next to the watermark (e.g. 0.86, 0.916)
    const sampleX = Math.round(drawX + drawWidth * 0.86)
    const sampleY = Math.round(drawY + drawHeight * 0.916)
    const pixel = ctx.getImageData(sampleX, sampleY, 1, 1).data
    const r = pixel[0]
    const g = pixel[1]
    const b = pixel[2]

    ctx.save()
    const grad = ctx.createRadialGradient(starX, starY, 0, starX, starY, radius)
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`)
    grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.98)`)
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)

    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(starX, starY, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  } catch {
    // Canvas security or boundary fallback
  }
}
