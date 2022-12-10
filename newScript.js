const canvas = document.getElementById("preview");
const context = canvas.getContext("2d");
const fileInput = document.querySelector('input[type="file"');
const error = document.getElementById("error-container");
const tips = document.getElementById("tips-container");
const body = document.body;

const density = '       .:-i|=+%O#@';

function map(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function asciiEffect(ctx, width, height) {
    const pixels = ctx.getImageData(0, 0, width, height);
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

            drawAscii(c, x, y);
        }
    }
}

function drawAscii(asciiChar, x, y){
    context.fillStyle = 'white';
    context.textAlign = "center";
    context.font = "Courier";
    context.fillText(asciiChar, x, y);
}

fileInput.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = event => {
        const image = new Image();
        image.onload = () => {
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

// for(let i = 0; i < tipsClose.length; i++){
//     tipsClose[i].addEventListener('click', function(e) {
//         for(let j = 0; j < tipsContainer.length; j++){
//             tipsContainer[j].style.visibility = 'hidden';
//         }
//         body.style.overflow = 'visible';
// });
// }

for(let i = 0; i < tipsNext.length; i++){
    tipsNext[i].addEventListener('click', function(e) {
        for(let j = 0; j < tipsContainer.length; j++){
            if(tipsContainer[i].style.visibility == 'visible'){
                tipsContainer[i].style.visibility = 'hidden';
                tipsContainer[i+1].style.visibility = 'visible';
            }
        }
    });
}
