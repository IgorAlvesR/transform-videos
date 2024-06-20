import { Download, FileVideo, Play, RotateCw } from 'lucide-react'
import { ChangeEvent, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { VideoService } from './services/VideoService'

const videoService = new VideoService()

export function App() {
  const [files, setFiles] = useState<File[]>([])
  const [videoUrl, setVideoUrl] = useState<string>()
  const [videosUrls, setVideosUrls] = useState<string[]>([])
  const [status, setStatus] = useState<'stop' | 'unify' | 'split'>('stop')
  const inputFile = useRef<HTMLInputElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    try {
      if (!event.target.files) return
      const files = Array.from(event.target.files)
      const insuficientFiles = files.length < 1
      const incorretTypeFiles = files.some((file) => file.type !== 'video/mp4')

      if (incorretTypeFiles) {
        throw new Error('Somente arquivos do tipo video/mp4 são permitidos')
      }

      if (insuficientFiles) {
        throw new Error('É necessário mais de um arquivo selecionado.')
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
      setVideoUrl(url)

      await sleep(1000)
      setStatus('split')

      if (!videoRef.current) {
        setStatus('stop')
        return
      }

      const urls = await videoService.splitVideo(url, videoRef.current.duration)
      setVideosUrls(urls)
      setStatus('stop')
    } catch (error) {
      if (error instanceof Error) {
        toast.error(
          `Ocorreu um problema ao iniciar o processo. (${error.message})`,
        )
      }
    }
  }

  function handleResetForm() {
    if (inputFile.current) {
      inputFile.current.value = ''
    }
    setVideoUrl('')
    setFiles([])
    setVideosUrls([])
  }

  function getBgColor() {
    if (status === 'split') {
      return 'bg-green-500'
    }

    if (status === 'unify') {
      return 'bg-yellow-500'
    }

    return 'bg-primary'
  }

  function getLabel() {
    if (status === 'split') {
      return 'Transformando...'
    }

    if (status === 'unify') {
      return 'Unificando...'
    }

    return 'Iniciar'
  }

  return (
    <main className="max-w-md md:max-w-xl p-4 mx-auto space-y-6">
      <div className="space-y-px">
        <FileVideo className="text-center w-full h-12" />
        <h1 className="text-center text-md sm:text-2xl font-semibold">
          Transforme seus vídeos em clipes de 1 minuto
        </h1>
      </div>

      <div className="flex flex-col gap-3">
        <div className="border p-6 rounded-md">
          <Input ref={inputFile} type="file" multiple onChange={handleInput} />
        </div>

        <div className="flex items-center justify-between gap-1">
          <Button
            disabled={!files.length}
            className={`w-full hover:${getBgColor()} ${getBgColor()} flex items-center`}
            onClick={() => handleInit()}
          >
            {status === 'stop' && <Play className="h-4" />}
            {getLabel()}
          </Button>

          <Button
            onClick={() => handleResetForm()}
            className="w-full flex items-center"
            variant="outline"
          >
            <RotateCw className="h-4" />
            Limpar
          </Button>
        </div>

        {videoUrl && <video ref={videoRef} src={videoUrl} controls hidden />}

        {!!videosUrls.length && (
          <div className="border rounded-md">
            <div className="flex justify-between items-center p-2 border">
              <p className="text-sm text-zinc-500 p-2 font-medium">Preview</p>
              <Button
                onClick={() => videoService.dowload(videosUrls)}
                size="sm"
                variant="outline"
              >
                <Download className="h-3" />
                Download
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {videosUrls.map((url) => (
                <video
                  key={url}
                  className="max-h-[150px] w-full object-contain"
                  src={url}
                  controls
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
