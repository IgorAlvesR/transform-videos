/* eslint-disable no-useless-constructor */

import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

export class FFmpegAdapter {
  private constructor() {}

  static async load() {
    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
      const ffmpeg = new FFmpeg()
      /*   ffmpeg.on('log', ({ message }) => {
        console.log(message)
      }) */

      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          'text/javascript',
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          'application/wasm',
        ),
      })

      return ffmpeg
    } catch (err) {
      console.log(err)
    }
  }
}
