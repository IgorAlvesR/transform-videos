import { fetchFile } from '@ffmpeg/util'
import { FFmpegAdapter } from './FFmpeg'

export class VideoService {
  async getLoadedFFmpeg() {
    const ffmpeg = await FFmpegAdapter.load()

    if (!ffmpeg) {
      throw new Error('Não foi possível carregar o FFMPEG')
    }
    return ffmpeg
  }

  async splitVideo(videoUrl: string, duration: number): Promise<string[]> {
    const maxSegmentDuration = 60
    const totalVideos = Math.ceil(duration / maxSegmentDuration)

    if (totalVideos <= 1) {
      return [videoUrl]
    }

    try {
      const ffmpeg = await this.getLoadedFFmpeg()

      // Carregar o arquivo de vídeo
      const videoFile = await fetchFile(videoUrl)

      // Gravar o arquivo de entrada no sistema de arquivos virtual do ffmpeg
      await ffmpeg.writeFile('input.mp4', videoFile)

      // Executar comando ffmpeg para segmentar o vídeo
      await ffmpeg.exec([
        '-i',
        'input.mp4',
        '-c',
        'copy',
        '-map',
        '0',
        '-segment_time',
        `${maxSegmentDuration}`,
        '-f',
        'segment',
        '-reset_timestamps',
        '1',
        'output%03d.mp4',
      ])

      const videosUrls: string[] = []

      for (let i = 0; i < totalVideos; i++) {
        const outputFileName = `output${String(i).padStart(3, '0')}.mp4`
        try {
          const data = await ffmpeg.readFile(outputFileName)
          const blob = new Blob([data], { type: 'video/mp4' })
          const url = URL.createObjectURL(blob)
          videosUrls.push(url)
        } catch (error) {
          // Se não conseguir ler o arquivo, quebra o loop
          console.error('Erro ao ler o segmento de vídeo:', error)
          break
        }
      }

      return videosUrls
    } catch (error) {
      console.error('Erro ao dividir o vídeo:', error)
      throw error
    }
  }

  dowload(urls: string[]) {
    urls.forEach((url) => {
      const a = document.createElement('a')
      a.style.display = 'none'
      document.body.appendChild(a)
      a.href = url
      a.download = 'meu_video.mp4'
      a.click()
      document.body.removeChild(a)
    })
  }

  async unifyVideos(files: File[]) {
    const ffmpeg = await this.getLoadedFFmpeg()

    // Array para armazenar as promessas de gravação dos arquivos
    const writePromises = files.map(async (file, index) => {
      const _file = await fetchFile(file)
      if (file.type === 'video/quicktime') {
        await ffmpeg.writeFile(`input${index}.mov`, _file)
      }

      if (file.type === 'video/mp4') {
        await ffmpeg.writeFile(`input${index}.mp4`, _file)
      }
    })

    await Promise.all(writePromises)

    // Criar um arquivo de texto de concatenação
    const concatFileContent = files
      .map((file, index) => {
        let fileName = ''
        if (file.type === 'video/quicktime') {
          fileName = `file 'input${index}.mov'`
        }

        if (file.type === 'video/mp4') {
          fileName = `file 'input${index}.mp4'`
        }

        return fileName
      })
      .join('\n')

    await ffmpeg.writeFile('videos.txt', concatFileContent)

    // Executar o comando ffmpeg para concatenar os vídeos
    await ffmpeg.exec([
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      'videos.txt',
      '-c',
      'copy',
      'output.mp4',
    ])

    // Obter o arquivo de saída
    const data = await ffmpeg.readFile('output.mp4')
    const blob = new Blob([data])
    const url = URL.createObjectURL(blob)
    return url
  }
}
