const cp = require('child_process')
const path = require('path')

const items = ['core', 'client', 'processor']

for (let item of items) {
  console.log('Installing:', item)
  cp.spawn('npm', ['i'], {
    cwd: path.join(__dirname, '../@paintbucket', item),
    shell: true,
    stdio: 'inherit'
  })
}