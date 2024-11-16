export default function ProcessExitPlugin() {
    return {
      name: 'ProcessExitPlugin',
  
      // catch the end of a build with errors
      buildEnd(error?: Error) {
        if (error) {
          console.error('Build failed:', error)
          process.exit(1)
        } else {
          console.log('Build succeeded')
        }
      },
  
      // catch the end of a build without errors
      closeBundle() {
        console.log('Build finished')
        process.exit(0)
      },
    }
  }