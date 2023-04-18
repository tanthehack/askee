/************************** COOKIES **************************/

const body = document.body;
const downloadBtn = document.getElementById("save-btn");
const tabSwitchTgl = document.getElementById("new-tab-switch");
const tipsSwitchTgl = document.getElementById("tips-switch");
const tipsStartupChk = document.getElementsByClassName("tips-startup-checkbox")[0];
const shade1Opt = document.getElementById("shade1");
const shade2Opt = document.getElementById("shade2");

let density;
let open_tips_startup;
let open_new_tab;

// default values if no cookies
density = shade1Opt.value;
shade1Opt.checked = true;

open_tips_startup = true;
tipsSwitchTgl.checked = true;
tipsStartupChk.checked = true;

tabSwitchTgl.checked = false;
open_new_tab = false;

// check cookie values, repaint UI and set globals accordingly
function getCookieVal() {
    let cookieArr = document.cookie.split(";");

    for (let i = 0; i < cookieArr.length; i++) {
        const cookiePair = cookieArr[i].split("=");

        let key = cookiePair[0].trim();
        let val = cookiePair[1];

        switch (key) {
            case 'shading':
                if (val === '1') {
                    density = shade1Opt.value;
                    shade1Opt.checked = true;
                } else if (val === '2') {
                    density = shade2Opt.value;
                    shade2Opt.checked = true;
                }
                break;

            case 'new_tab':
                if (val === '0') {
                    open_new_tab = false;
                    tabSwitchTgl.checked = false;
                } else if (val === '1') {
                    open_new_tab = true;
                    tabSwitchTgl.checked = true;
                }
                break;

            case 'tips':
                if (val === '0') {
                    open_tips_startup = false;
                    tipsStartupChk.checked = false;
                    tipsSwitchTgl.checked = false;
                } else if (val === '1') {
                    open_tips_startup = true;
                    tipsStartupChk.checked = true;
                    tipsSwitchTgl.checked = true;
                }
                break;

            default:
                break;
        }
    }
}

getCookieVal(); // repaint on document load
if (open_tips_startup) {
    open_tips()
}

// ↓ modify new tab setting from tips dialog

for (let i = 0; i < tipsClose.length; i++) { // close buttons
    tipsClose[i].addEventListener('click', (e) => {
        if (tipsStartupChk.checked) {
            document.cookie = 'tips=1; Secure; SameSite=None';
        } else {
            document.cookie = 'tips=0; Secure; SameSite=None';
        }

        getCookieVal();
    });
}

tipsNext[0].addEventListener('click', (e) => { // 1st next button
    if (tipsStartupChk.checked) {
        document.cookie = 'tips=1; Secure; SameSite=None';
    } else {
        document.cookie = 'tips=0; Secure; SameSite=None';
    }

    getCookieVal();
});

// TODO: move to animations.js
// reveal/close the shading dropdown on button click
$("#shading-dropdwn").click(() => {
    var is_on = $(".dropdown").attr("aria-expanded");
    if (is_on === 'true') {
        $(".dropdown").attr("aria-expanded", "false");
    } else {
        $(".dropdown").attr("aria-expanded", "true");
    }
});

// ↓ modify settings from settings dialog

// save to cookies
const saveShadingVal = () => {
    if (shade1Opt.checked) {
        document.cookie = 'shading=1; Secure; SameSite=None';
    } else if (shade2Opt.checked) {
        document.cookie = 'shading=2; Secure; SameSite=None';
    }
};

const saveNewTab = () => {
    if (tabSwitchTgl.checked) {
        document.cookie = 'new_tab=1; Secure; SameSite=None';
    } else {
        document.cookie = 'new_tab=0; Secure; SameSite=None';
    }
};

const saveTipsVal = () => {
    if (tipsSwitchTgl.checked) {
        document.cookie = 'tips=1; Secure; SameSite=None';
    } else {
        document.cookie = 'tips=0; Secure; SameSite=None';
    }
};

// check if cookies disagree with settings inputs
function is_cookie_changed() {
    let cookieArr = document.cookie.split(";");

    if (cookieArr.length !== 3) { // because new cookies
        return true;
    }

    for (let i = 0; i < cookieArr.length; i++) {
        const cookiePair = cookieArr[i].split("=");

        let key = cookiePair[0].trim();
        let val = cookiePair[1];

        switch (key) {
            case 'shading':
                if ((shade1Opt.checked && val == 2) || (shade2Opt.checked && val == 1)) {
                    return true;
                }
                break;
            default:
                break;
        }
    }

    return false;
}

// check if cookies have changed and reveal dialog if necessary
$("#close-settings-btn").click(() => {
    var is_dropdown_on = $(".dropdown").attr("aria-expanded");
    if (is_dropdown_on === 'true') {
        $(".dropdown").attr("aria-expanded", "false");
    }

    if (is_cookie_changed()) {
        // open dialog
        open_save_settings();
    } else {
        // close directly
        saveNewTab();
        saveTipsVal();

        getCookieVal();
        close_settings();
    }
})

$("#confirm-save-settings-btn").click(() => {
    saveNewTab();
    saveTipsVal();
    saveShadingVal();

    location.reload();
})

/*************************************************************/

/************************** IMAGE **************************/

const fileInput = document.querySelector('input[type="file"]');

const canvas = document.createElement('canvas');
const canvas_ctx = canvas.getContext('2d');

const image = new Image();
let image_data;
let preview_image;

const MAXIMUM_WIDTH = 500;
const MAXIMUM_HEIGHT = 500;

// basic unit of life
class Cell {
    constructor(x, y, char) {
        this.x = x;
        this.y = y;
        this.char = char;
    }

    draw() {
        canvas_ctx.fillStyle = 'white';
        canvas_ctx.textAlign = "center";
        canvas_ctx.font = "Courier";
        canvas_ctx.fillText(this.char, this.x, this.y);
    }
}

// takes a pixel buffer and writes the ASCII version to a canvas
class convertToAscii {
    ctx;
    width;
    height;
    pixels = [];
    cellArray = [];

    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.ctx.drawImage(image, 0, 0, this.width, this.height);

        this.pixels = this.ctx.getImageData(0, 0, this.width, this.height);
    }

    // magic
    map(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }

    // iterate through pixels and convert to cells
    scanImage(cellSize) {
        for (let y = 0; y < this.pixels.height; y += cellSize) {
            for (let x = 0; x < this.pixels.width; x += cellSize) {
                const posX = x * 4;
                const posY = y * 4;
                const pos = (posY * this.pixels.width) + posX;

                if (this.pixels.data[pos + 3] > 128) {
                    const r = this.pixels.data[pos];
                    const g = this.pixels.data[pos + 1];
                    const b = this.pixels.data[pos + 2];
                    const total = r + g + b;
                    const avg = total / 3;
                    const len = density.length;
                    const charIndex = Math.floor(this.map(avg, 0, 255, 0, len)); // len or len - 1?
                    const c = density.charAt(charIndex);

                    this.cellArray.push(new Cell(x, y, c));
                }
            }
        }
    }

    // plot the cells on the canvas
    draw(x) {
        this.scanImage(x);
        this.ctx.clearRect(0, 0, this.width, this.height);
        for (let i = 0; i < this.cellArray.length; i++) {
            this.cellArray[i].draw(this.ctx);
        }
    }
}

// scales image to fit in a window of specified size
const clampDimensions = (width, height) => {
    if (width > height) { // landscape
        if (width > MAXIMUM_WIDTH) {
            aspect = width / height;
            height = MAXIMUM_HEIGHT / aspect;
            width = MAXIMUM_WIDTH;
        }
    }
    else if (width < height) { // portrait
        if (height > MAXIMUM_HEIGHT) {
            aspect = width / height;
            width = MAXIMUM_WIDTH * aspect;
            height = MAXIMUM_HEIGHT;
        }
    }
    else { // square
        if (height > 500) {
            width = MAXIMUM_WIDTH;
            height = MAXIMUM_HEIGHT;
        }
    }

    return [width, height]
};

// weird down-to-up FileReader thing
fileInput.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = event => {
        image.onload = () => {
            // convert to canvas
            canvas.width = image.width;
            canvas.height = image.height;

            n = new convertToAscii(canvas_ctx, canvas.width, canvas.height);
            n.draw(6);

            // convert canvas image to base64 data
            image_data = canvas.toDataURL("image/png", 1.0);

            // create downscaled preview
            const [width, height] = clampDimensions(image.width, image.height);

            preview_image = document.createElement('img');
            preview_image.setAttribute('width', width);
            preview_image.setAttribute('height', height);
            preview_image.src = image_data;

            // paint preview image on screen
            document.getElementsByClassName("preview-container")[0].replaceChildren(preview_image);
        }

        image.src = event.target.result;
    }

    reader.readAsDataURL(file);
}

// on save button click
document.getElementById("save-btn").addEventListener('click', function (e) {
    if (image_data == undefined) { // if no image selected
        document.getElementById("error").textContent = "No Image Selected";
        return;
    }

    const link = document.createElement('a');
    link.href = image_data;

    if (open_new_tab) {
        link.target = "_blank";
    } else {
        link.download = "my-ascii-image.png";
    }

    link.click();
    link.remove();
});

/*************************************************************/
