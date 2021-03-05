import { copyFile, existsSync, mkdirSync } from 'fs'
import esbuild from 'esbuild'
import { svelte } from './plugins.js'
import path from 'path'
import url from 'url'

export const builder = async () => {
  const { preprocess } = await import(url.pathToFileURL(path.resolve('svelte.config.js'))).catch(err => { console.error(err) })
  // make sure the directory exists before stuff gets put into into
  if (!existsSync('./dist/')) {
    mkdirSync('./dist/')
  }
  // build the application
  esbuild.build({
    entryPoints: ['src/index.js'],
    outdir: './dist',
    format: 'esm',
    minify: true,
    bundle: true,
    splitting: true,
    incremental: true,
    plugins: [
      svelte({
        cache: false,
        compileOptions: { css: false },
        preprocess
      })
    ]
  })
    .then((result) => {
      if (process.env.NODE_ENV === 'production') {
        process.exit(0)
      }
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })

  // use a basic html file to test with
  copyFile('./public/index.html', './dist/index.html', (err) => {
    if (err) throw err
  })
  copyFile('./public/favicon.ico', './dist/favicon.ico', (err) => {
    if (err) throw err
  })
  copyFile('./public/robots.txt', './dist/robots.txt', (err) => {
    if (err) throw err
  })
}
export const server = async () => {
  const { preprocess } = await import(url.pathToFileURL(path.resolve('svelte.config.js'))).catch(err => { console.error(err) })
  esbuild
    .serve(
      {
        servedir: 'public',
        port: 8080,
        host: '0.0.0.0'
      },
      {
        entryPoints: ['src/index.js'],
        outdir: 'public',
        format: 'esm',
        // minify: true,
        bundle: true,
        // splitting: true,
        // incremental: true,
        plugins: [
          svelte({
            cache: false,
            compileOptions: { css: false },
            preprocess
          })
        ]
      }
    )
    .then((server) => {
      console.log(server)
      process.on('SIGINT', function () {
        server.stop()
      })
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
