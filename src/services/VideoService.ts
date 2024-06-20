import { fetchFile } from '@ffmpeg/util'
import { FFmpegAdapter } from './FFmpeg'

export class VideoService {
  dowload(url: string) {
    const a = document.createElement('a')
    a.style.display = 'none'
    document.body.appendChild(a)
    a.href = url
    a.download = 'meu_video.mp4'
    a.click()
    document.body.removeChild(a)
  }

  async unifyVideos(files: File[]) {
    const ffmpeg = await FFmpegAdapter.load()

    if (!ffmpeg) {
      throw new Error('Não foi possível carregar o FFMPEG')
    }

    // Array para armazenar as promessas de gravação dos arquivos
    const writePromises = files.map(async (file, index) => {
      const _file = await fetchFile(file)
      await ffmpeg.writeFile(`input${index}.mp4`, _file)
    })

    await Promise.all(writePromises)

    // Criar um arquivo de texto de concatenação
    const concatFileContent = files
      .map((_, index) => `file 'input${index}.mp4'`)
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
