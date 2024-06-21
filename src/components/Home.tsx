import { useHome } from '@/hooks/useHome'
import { VideoService } from '@/services/VideoService'
import { Download, FileVideo, RotateCw } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'

const videoService = new VideoService()

export function Home() {
  const {
    getBgColor,
    getLabel,
    handleInit,
    handleInput,
    handleResetForm,
    videosUrls,
    inputFile,
    videoRef,
    videoUrlUnify,
    files,
  } = useHome(videoService)

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
          <Input
            accept="video/*"
            ref={inputFile}
            type="file"
            multiple
            onChange={handleInput}
          />
        </div>

        <div className="flex items-center justify-between gap-1">
          <Button
            disabled={!files.length}
            className={`w-full hover:${getBgColor()} ${getBgColor()} flex items-center`}
            onClick={() => handleInit()}
          >
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

        {videoUrlUnify && (
          <video ref={videoRef} src={videoUrlUnify} controls hidden />
        )}

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
