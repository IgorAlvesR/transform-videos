import { VideoService } from '@/services/VideoService'
import { Scissors, Merge, Check, Play } from 'lucide-react'
import { useState, useRef, ChangeEvent } from 'react'
import { toast } from 'sonner'

type Status = 'stop' | 'unify' | 'split' | 'ready'

export function useHome(videoService: VideoService) {
  const [files, setFiles] = useState<File[]>([])
  const [videoUrlUnify, setVideoUrlUnify] = useState<string>()
  const [videosUrls, setVideosUrls] = useState<string[]>([])
  const [status, setStatus] = useState<Status>('stop')
  const inputFile = useRef<HTMLInputElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    try {
      if (!event.target.files) return
      const files = Array.from(event.target.files)
      const corretTypeFiles = files.some(
        (file) => file.type === 'video/mp4' || file.type === 'video/quicktime',
      )

      if (!corretTypeFiles) {
        throw new Error('Somente arquivos do tipo .mp4 e .mov são permitidos')
      }

      setFiles(files)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(
          `Ocorreu um problema ao iniciar o processo. (${error.message})`,
        )
      }
    }
  }

  function sleep(time: number) {
    return new Promise<boolean>((resolve) =>
      setTimeout(() => resolve(true), time),
    )
  }

  async function handleInit() {
    try {
      setStatus('unify')
      const url = await videoService.unifyVideos(files)
      setVideoUrlUnify(url)

      await sleep(1000)
      setStatus('split')

      if (!videoRef.current) {
        setStatus('stop')
        return
      }

      const urls = await videoService.splitVideo(url, videoRef.current.duration)
      setVideosUrls(urls)
      setStatus('ready')
    } catch (error) {
      if (error instanceof Error) {
        toast.error(
          `Ocorreu um problema ao iniciar o processo. (${error.message})`,
        )
      }
    }
  }

  function handleResetForm() {
    setStatus('stop')
    if (inputFile.current) {
      inputFile.current.value = ''
    }
    setVideoUrlUnify('')
    setFiles([])
    setVideosUrls([])
  }

  function getBgColor() {
    if (status === 'split') {
      return 'bg-blue-500'
    }

    if (status === 'unify') {
      return 'bg-yellow-500'
    }

    if (status === 'ready') {
      return 'bg-green-500'
    }

    return 'bg-primary'
  }

  function getLabel() {
    if (status === 'split') {
      return (
        <div className="flex items-center gap-1">
          <Scissors className="h-5" />
          Editando...
        </div>
      )
    }

    if (status === 'unify') {
      return (
        <div className="flex items-center gap-1">
          <Merge className="h-5" />
          Unificando...
        </div>
      )
    }

    if (status === 'ready') {
      return (
        <div className="flex items-center gap-1">
          <Check className="h-5" />
          Pronto
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1">
        <Play className="h-4" />
        Iniciar
      </div>
    )
  }

  return {
    handleInit,
    handleInput,
    getLabel,
    getBgColor,
    handleResetForm,
    videoUrlUnify,
    videosUrls,
    inputFile,
    videoRef,
    files,
  }
}
