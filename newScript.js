const canvas = document.getElementById("preview");
const context = canvas.getContext("2d");
const fileInput = document.querySelector('input[type="file"');
const error = document.getElementById("error-container");
const tips = document.getElementById("tips-container");
const body = document.body;

const density = '       .:-i|=+%O#@';

const downloadBtn = document.getElementById("save-btn");
const c = document.createElement('canvas');
const ctx = c.getContext('2d');

var imageWidth;
var imageHeight;

function map(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function asciiEffect(ct, width, height) {
    const pixels = ct.getImageData(0, 0, width, height);
    context.clearRect(0, 0, canvas.width, canvas.height);
    let ascii = ''; //A string to store the mapped ascii characters.
    const cellSize = 10;
    for (let y = 0; y < pixels.height; y += cellSize){
        for (let x = 0; x < pixels.width; x += cellSize){
            const pos = ((y * 4) * pixels.width) + (x * 4);

            const r = pixels.data[pos];
            const g = pixels.data[pos + 1];
            const b = pixels.data[pos + 2];

            const avg = Math.ceil((r+g+b)/3); 

            const charIndex = Math.floor(map(avg, 0, 255, 0, density.length));
            const c = density.charAt(charIndex);

            drawAscii(ct, c, x, y);
        }
    }
}

function drawAscii(ct, asciiChar, x, y){
    ct.fillStyle = 'white';
    ct.textAlign = "center";
    ct.font = "Courier";
    ct.fillText(asciiChar, x, y);
}

fileInput.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = event => {
        const image = new Image();
        image.onload = () => {
            imageWidth = image.width;
            imageHeight = image.height;
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0);
            error.style.display = 'none';
            asciiEffect(context, canvas.width, canvas.height);
        }
        image.src = event.target.result;
    }
    reader.readAsDataURL(file);
}

document.getElementById("save-btn").addEventListener('click', function(e) {
    c.width = imageWidth;
    c.height = imageHeight;
    n = new asciiEffect(ctx, c.width, c.height);

    let image = c.toDataURL("image/png", 1.0);
    const link = document.createElement('a');
    link.href = image;
    link.download = "my-ascii-image.png";
    link.click();
    link.remove();
});
