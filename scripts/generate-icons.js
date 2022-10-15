const { favicons }  = require('favicons')
const fs = require('fs')
const path = require('path')

const projectRoot = path.join(__dirname, '..')
const sourceFilePath = path.join(projectRoot, 'icons/icon-128x128-original.png')
const config = {
  icons: {
    android: false,
    appleIcon: false,
    appleStartup: false,
    coast: false,
    firefox: false,
    yandex: false,
    windows: false,
  },
}
favicons(sourceFilePath, config, (error, response) => {
  if (error) {
    throw new Error(error)
  }
  const iconsDirPath = path.join(projectRoot, 'icons')
  const targets = [
    {
      generatedImageName: 'favicon-16x16.png',
      outputPath: path.join(iconsDirPath, 'icon-16x16.png'),
    },
    {
      generatedImageName: 'favicon-48x48.png',
      outputPath: path.join(iconsDirPath, 'icon-48x48.png'),
    },
  ]
  for (const {generatedImageName, outputPath} of targets) {
    fs.writeFileSync(outputPath, response.images.find(e => e.name === generatedImageName).contents)
  }
})
