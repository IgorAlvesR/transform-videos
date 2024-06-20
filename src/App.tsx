import { ChangeEvent, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { VideoService } from './services/VideoService'

const videoService = new VideoService()

export function App() {
  const [files, setFiles] = useState<File[]>([])
  const [videoUrl, setVideoUrl] = useState<string>()
  const [status, setStatus] = useState<'stop' | 'unify' | 'download'>('stop')
  const inputFile = useRef<HTMLInputElement | null>(null)

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

      setStatus('download')
      await sleep(1000)
      videoService.dowload(url)

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
  }

  function getBgColor() {
    if (status === 'download') {
      return 'bg-green-500'
    }

    if (status === 'unify') {
      return 'bg-yellow-500'
    }

    return 'bg-primary'
  }

  function getLabel() {
    if (status === 'download') {
      return 'Baixando'
    }

    if (status === 'unify') {
      return 'Unificando'
    }

    return 'Iniciar'
  }

  return (
    <main className="max-w-lg p-4 mx-auto space-y-1">
      <div className="space-y-px">
        <h1 className="text-lg font-semibold">Ajuste o tempo de seus vídeos</h1>
        <p className="text-sm text-zinc-500">
          Agora você pode cortar vídeos para o tempo exato do story do instagram
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="border p-6 rounded-md">
          <Input ref={inputFile} type="file" multiple onChange={handleInput} />
        </div>

        <div className="flex items-center justify-between gap-1">
          <Button
            disabled={!files.length}
            className={`w-full hover:${getBgColor()} ${getBgColor()}`}
            onClick={() => handleInit()}
          >
            {getLabel()}
          </Button>

          <Button
            onClick={() => handleResetForm()}
            className="w-full"
            variant="outline"
          >
            Limpar
          </Button>
        </div>

        {videoUrl && (
          <div className="border rounded-md">
            <p className="text-sm text-zinc-500 p-2 font-medium">Preview</p>
            <video
              className="max-h-[300px] w-full object-contain"
              src={videoUrl}
              controls
            />
          </div>
        )}
      </div>
    </main>
  )
}
