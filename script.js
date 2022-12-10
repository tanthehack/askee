const canvas = document.getElementById("preview");
const fileInput = document.querySelector('input[type="file"');
const context = canvas.getContext("2d");
const div = document.querySelector("#error-container");

const downloadBtn = document.getElementById("save-btn");

const c = document.createElement('canvas');
const ctx = c.getContext('2d');

var imageWidth;
var imageHeight;


//const density = "_.,-=+:;cba!?0123456789$W#@Ñ";
const density = '       .:-i|=+%O#@'

const image = new Image();

class Cell {
    constructor(x, y, char){
        this.x = x;
        this.y = y;
        this.char = char;
    }

    draw(){
        context.fillStyle = 'white';
        context.textAlign = "center";
        context.font = "Courier";
        context.fillText(this.char, this.x, this.y);

        ctx.fillStyle = 'white';
        ctx.textAlign = "center";
        ctx.font = "Courier";
        ctx.fillText(this.char, this.x, this.y);
    }
}

class convertToAscii {
    ctx;
    width;
    height;
    pixels = [];
    cellArray = [];

    constructor(ctx, width, height){
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.ctx.drawImage(image, 0, 0, this.width, this.height);

        this.pixels = this.ctx.getImageData(0, 0, this.width, this.height);
    }

    map(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }


    scanImage(cellSize){
        for (let y = 0; y < this.pixels.height; y+=cellSize){
            for (let x = 0; x < this.pixels.width; x+=cellSize){
                const posX = x * 4;
                const posY = y * 4;
                const pos = (posY * this.pixels.width) + posX;
    
                if(this.pixels.data[pos + 3] > 128){
                    const r = this.pixels.data[pos];
                    const g = this.pixels.data[pos + 1];
                    const b = this.pixels.data[pos + 2];
                    const total = r + g + b;
                    const avg = total/3;
                    const len = density.length;
                    const charIndex = Math.floor(this.map(avg, 0, 255, 0, len));
                    const c = density.charAt(charIndex);

                    this.cellArray.push(new Cell(x, y, c));
                }
            }
        }
    }

    draw(c){
        this.scanImage(c);
        this.ctx.clearRect(0, 0, this.width, this.height);
        for (let i = 0; i < this.cellArray.length; i++){
            this.cellArray[i].draw(this.ctx);
        }
    }
}


const MAXIMUM_WIDTH = 500;
const MAXIMUM_HEIGHT = 500;


const clampDimensions = (width, height) => {
    if (width > height) {
        if (width > MAXIMUM_WIDTH) {
            aspect = width / height;
            height = MAXIMUM_HEIGHT / aspect;
            width = MAXIMUM_WIDTH;
        }
    }
    else if(width < height) {
        if (height > MAXIMUM_HEIGHT) {
            aspect = width / height;
            width = MAXIMUM_WIDTH * aspect;
            height = MAXIMUM_HEIGHT;
        }
    }
    else {
        if(height < 500){
            return[MAXIMUM_WIDTH, MAXIMUM_HEIGHT];
        }
    }
    return [width, height]

};


let effect;
fileInput.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    

    reader.onload = event => {
        image.onload = () => {
            imageWidth = image.width;
            imageHeight = image.height;
            const [width, height] = clampDimensions(image.width, image.height);

            canvas.width = width;
            canvas.height = height;
            effect =  new convertToAscii(context, width, height);
            effect.draw(10);
            div.style.display = 'none';
        }
        image.src = event.target.result;
    }

    reader.readAsDataURL(file);
}

document.getElementById("save-btn").addEventListener('click', function(e) {
    c.width = imageWidth;
    c.height = imageHeight;
    n = new convertToAscii(ctx, c.width, c.height);
    n.draw(10);

    let image = c.toDataURL("image/png", 1.0);
    const link = document.createElement('a');
    link.href = image;
    link.download = "my-ascii-image.png";
    link.click();
    link.remove();
});
