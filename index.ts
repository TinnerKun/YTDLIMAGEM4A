/*
Build : tsc -w
Run : yarn ts-node index.ts
*/

import axios from "axios";
import { exec } from "child_process";
import { access, existsSync, mkdirSync, constants } from "fs";
import { Client } from "soundcloud-scraper"; 
import { getAlbumInfo } from "bandcamp-scraper";
import extractDomain from "extract-domain";

const soundcloud = new Client(); 

const arg = process.argv.slice(2);
const vdo = arg[0];

const yt_file = 'yt-dlp.exe';
const folder = 'Music_Done' // new Date().toISOString().slice(0, 10);
const StartTime = +new Date();

if (vdo === undefined) {
    console.log('Please enter a video link');;
}

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
    switch (extractDomain(url) as string) {
        case 'youtube.com':
        case 'youtube-nocookie.com':
        case 'youtu.be':
        case 'www.youtube.com':
        case 'www.youtube-nocookie.com':
        case 'www.youtu.be':
            console.log('Downloading -> Youtube');
            axios.get(`https://www.youtube.com/oembed?url=${url}&format=json`).then(async (res) => {
                console.log(`
        title : ${res.data.title}
        author : ${res.data.author_name}
        `)
                exec(`${yt_file} --add-metadata --encoding utf8 -o %(title)s.%(ext)s --embed-thumbnail -f m4a ${url}`, async (err, stdout, stderr) => {
                    console.log(stdout)
                    exec(`powershell -Command "Move-Item -Path ./.\\*.m4a -Destination ./${path}/"`)
                    const EndTime = +new Date();
                    console.log(`${EndTime - StartTime}ms`);;
                })
            })
            break;

        case 'soundcloud.com':
        case 'www.soundcloud.com':
            console.log('Downloading -> Soundcloud');
            soundcloud.getSongInfo(`${url}`)
                .then(song => {
                    console.log(`
        title : ${song.title}
        author : ${song.author.name}
        `)
                    exec(`${yt_file} --add-metadata --encoding utf8 -o %(title)s.%(ext)s --embed-thumbnail ${url}`, async (err, stdout, stderr) => {
                        console.log(stdout)
                        exec(`powershell -Command "Move-Item -Path ./.\\*.mp3 -Destination ./${path}/"`)
                        const EndTime = +new Date();
                        console.log(`${EndTime - StartTime}ms`);
                    })
                }).catch(err => {
                    console.log(err);
                });
            break;
        case 'bilibili.com':
        case 'www.bilibili.com':
            console.log('Downloading -> Bilibili');
            axios.get(`https://api.bilibili.com/x/web-interface/view`,
                {
                    headers: {
                        bvid: url.split('/')[4].slice(0, 12),
                    }
                }).then(async (res) => {
                    console.log(`
        title : ${res.data.data.title}
        author : ${res.data.data.owner.name}
        `)
                    exec(`${yt_file} --add-metadata --encoding utf8 -o %(title)s.%(ext)s --embed-thumbnail -f m4a https://www.bilibili.com/video/${url.split('/')[4]}`, async (err, stdout, stderr) => {
                        console.log(stdout)
                        exec(`powershell -Command "Move-Item -Path ./.\\*.m4a -Destination ./${path}/"`)
                        const EndTime = +new Date();
                        console.log(`${EndTime - StartTime}ms`);
                    })
                }).catch(err => {
                    console.log(err);
                });
            break;

        case 'bandcamp.com':
        case 'www.bandcamp.com':
            console.log('Downloading -> Bandcamp');

            getAlbumInfo(url, function (error, albumInfo) {
                if (error) {
                    console.log(error)
                } else {
                    console.log(`
        title : ${albumInfo.title}
        author : ${albumInfo.artist}
        `)
                    exec(`${yt_file} --add-metadata --encoding utf8 -o %(title)s.%(ext)s --embed-thumbnail ${url}`, async (err, stdout, stderr) => {
                        console.log(stdout)
                        exec(`powershell -Command "Move-Item -Path ./.\\*.mp3 -Destination ./${path}/"`)
                        const EndTime = +new Date();
                        console.log(`${EndTime - StartTime}ms`);
                    })
                }
            })
            break;
        case 'nicovideo.jp':
        case 'www.nicovideo.jp':
            console.log('Downloading -> Nicovideo');
            axios.get(`https://www.nicovideo.jp/api/getflv?v=${url.split('/')[4]}`).then(async (res) => {
                console.log(`
        title : ${res.data.title}
        author : ${res.data.user_id}
        `)
                exec(`${yt_file} --add-metadata --encoding utf8 -o '%(title)s.%(ext)s' --embed-thumbnail --remux-video m4a ${url}`, async (err, stdout, stderr) => {
                    console.log(stdout)
                    exec(`powershell -Command "Move-Item -Path ./.\\*.m4a -Destination ./${path}/"`)
                    const EndTime = +new Date();
                    console.log(`${EndTime - StartTime}ms`);
                })
            })
            break;
        
        default:
            console.log('Downloading -> Unknown');
            break;
    }

}
