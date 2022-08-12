import http from "axios";
import { exec } from "child_process";
import { access, existsSync, mkdirSync, constants } from "fs";

const arg = process.argv.slice(2);
const vdo = arg[0];

const yt_file = 'yt-dlp.exe';

const folder = new Date().toISOString().slice(0, 10);

access(yt_file, constants.F_OK, (err) => {
    if (err) {
        console.log('File -> youtube-dl not found')
        exec('powershell -Command "Invoke-WebRequest https://github.com/yt-dlp/yt-dlp/releases/download/2022.08.08/yt-dlp.exe -OutFile yt-dlp.exe"', (err) => {
            if (!err) download(vdo, folder);
        })
    } else {
        console.log('File -> youtube-dl found')
        download(vdo, folder);
    }
});

async function download(url: string, path: string) {
    if (!existsSync(path)) mkdirSync(path);
    http.get(`https://www.youtube.com/oembed?url=${url}&format=json`).then(async (res) => {
        console.log(`
        title : ${res.data.title}
        author : ${res.data.author_name}
        `)
        exec(`${yt_file} --add-metadata --encoding utf8 -o %(title)s.%(ext)s --embed-thumbnail -f 140 ${url}`, async (err, stdout, stderr) => {
            console.log(stdout)
            exec(`powershell -Command "Move-Item -Path ./.\\*.m4a -Destination ./${path}/"`)
        });
    })
}
