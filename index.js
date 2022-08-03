const { exec } = require('child_process');
// const translate = require('translate');
const fs = require('fs')
const axios = require('axios');
const myArgs = process.argv.slice(2);
const videoId = myArgs[0];
const path = './youtube-dl.exe'

console.clear();

console.log(`
███████╗██╗   ██╗ ██████╗███████╗██████╗ ███╗   ██╗███████╗████████╗██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗
██╔════╝╚██╗ ██╔╝██╔════╝██╔════╝██╔══██╗████╗  ██║██╔════╝╚══██╔══╝██║    ██║██╔═══██╗██╔══██╗██║ ██╔╝
███████╗ ╚████╔╝ ██║     █████╗  ██████╔╝██╔██╗ ██║█████╗     ██║   ██║ █╗ ██║██║   ██║██████╔╝█████╔╝ 
╚════██║  ╚██╔╝  ██║     ██╔══╝  ██╔══██╗██║╚██╗██║██╔══╝     ██║   ██║███╗██║██║   ██║██╔══██╗██╔═██╗ 
███████║   ██║   ╚██████╗███████╗██║  ██║██║ ╚████║███████╗   ██║   ╚███╔███╔╝╚██████╔╝██║  ██║██║  ██╗
╚══════╝   ╚═╝    ╚═════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝   ╚═╝    ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
                   Download Youtube & Set Cover image
`)

fs.access(path, fs.F_OK, (err) => {
  if (err) {
    console.log('File -> youtube-dl not found')
    exec('powershell -Command "Invoke-WebRequest https://youtube-dl.org/downloads/latest/youtube-dl.exe -OutFile youtube-dl.exe"'), (err, stdout, stderr) => {
      console.log('Restart Command Run!!!');
    }
  } else {
    downloads();
  }
})

async function downloads() {
  console.log('File -> youtube-dl found')
  console.log(`ytdl -> Download ${videoId} Start`)
  axios.get(`https://www.youtube.com/oembed?url=${videoId}&format=json`)
    .then(async function (response) {
      console.log(`Author Name Music [ Don't EN Fix Now!! ] -> ${response.data.author_name}`)
      // translate.engine = "yandex";
      // translate.key = '';
      // const authorset = await translate(response.data.author_name, "en");
      // console.log(`Author Name Music [ EN Fix Now!! ] -> ${authorset}`)
      // return;
      let title = `${response.data.title}-${myArgs[0].replace('https://www.youtube.com/watch?v=', '')}`
      let list = /['\/,]/gm
      //  let list = /['\/,\\_\-\+=|\]\[\*\^]/gm
      title1 = title.replaceAll(list, ' ')
      //let authorset = response.data.author_name
      exec(`start powershell -Command "${path} --add-metadata --encoding utf8 --embed-thumbnail --output '${title1}.%(ext)s' -f 140 ${videoId}"`, (err, stdout, stderr) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log(`ytdl -> Download ${videoId} Done`)
        exec(`tageditor.exe -s cover="${title1}.jpg" --max-padding 125000 -f "${title1}.m4a"`, (err, stdout, stderr) => {
          console.log('image set Done');
          exec(`powershell -Command "rm -r '${title1}.jpg'"`); console.log('cover removed Done')
          exec(`powershell -Command "Move-Item '${title1}.m4a' .\/Done"`); console.log('file moved Done')
        })
      })
    });
}
