import {spawn} from 'child_process';

export function runffmpeg(cameraUrl: string, youtubeUrl: string) {
    const ffmpeg = spawn('ffmpeg', [
        '-nostats',
        '-hide_banner',
        '-f',
        'lavfi',
        '-i',
        'anullsrc',
        '-rtsp_transport',
        'tcp',
        '-r',
        '1',
        '-re',
        '-analyzeduration',
        '0',
        '-probesize',
        '1024',
        '-i',
        cameraUrl,
        '-tune',
        'zerolatency',
        '-c:v',
        'copy',
        '-c:a',
        'aac',
        '-strict',
        'experimental',
        '-f',
        'flv',
        '-flvflags',
        'no_duration_filesize',
        youtubeUrl
    ]);

    ffmpeg.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    ffmpeg.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    ffmpeg.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}