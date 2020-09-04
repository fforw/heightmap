const Jimp = require("jimp");
const SimplexNoise = require("simplex-noise");

const width = 2048;
const height = 2048;

const phactor = 2 / (1 + Math.sqrt(5));

const noise = new SimplexNoise();

const Yargs = require('yargs')
    .help();

const argv = Yargs
    .argv;

const fileArgs = argv._;

if (fileArgs.length !== 1)
{
    console.error("Need exactly one target image file to write to");
    process.exit(1)
}

function clamp(n)
{
    return n < 0 ? 0 : n > 1 ? 1 : n;
}


new Jimp(width, height, (err, image) => {
    if (err)
    {
        console.error(err);
        return;
    }

    const {data} = image.bitmap;

    let offset = 0;

    const fx = 255 / width;
    const fy = 255 / height;

    const size = Math.min(width, height) * 0.5 * phactor;

    const cx = width >> 1;
    const cy = height >> 1;

    const mult = 24;

    for (let y = 0; y < height; y++)
    {
        for (let x = 0; x < width; x++)
        {
            const dx = cx - x;
            const dy = cy - y;

            const d = Math.sqrt(dx * dx + dy * dy);

            // data[offset    ] = x * fx;
            // data[offset + 1] = y * fy;
            // data[offset + 2] = 0;
            // data[offset + 3] = 255;

            const angle = Math.atan2(dy, dx);
            let h = 0.5 + Math.sin(angle * mult) * 0.5;

            h = Math.pow(h, 0.7 + Math.sin((d * d / 700 - 100) * 0.025) * 0.6);

            h = clamp(h + noise.noise2D(d * 0.04, Math.sin(angle) * 3) * 0.7);
            // const noiseScale = 0.01;
            // h = clamp(h + noise.noise2D(dx * noiseScale,dy * noiseScale)* 0.5) ;


            data[offset] = h * 255;
            data[offset + 1] = h * 255;
            data[offset + 2] = h * 255;
            data[offset + 3] = 255;

            offset += 4;
        }
    }

    image.write(fileArgs[0]);
})
