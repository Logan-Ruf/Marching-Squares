/* Created By Logan Ruf @ ckcollab.com
 * Live demo and explanation available at [INSERT BLOG LINK]
 *
 *
 * Perlin Noise code credit goes to Joseph Gentle https://github.com/josephg/noisejs
 *
 *
 * This code was placed in the public domain by its original author,
 * Logan Ruf. You may use it as you see fit, but
 * attribution is appreciated.
 *
 */
var CANVAS_HEIGHT;
var CANVAS_WIDTH;
var CANVAS_RATIO_WIDTH = .7
var CANVAS_RATIO_HEIGHT = .8
var scalar_array;
var SPACE_BETWEEN = 10;


const box = document.querySelector('#container');
var slider_parent = document.querySelector('#slider');

//Initialize Perlin Noise
generate_noise.seed(Math.random())
function getNoise(x, y) {
    let d = new Date();
    return generate_noise.perlin3(x/12,y/12, d.getTime() / 3000)+1
}

function setup() {
    // Create Slider For some interactivity
    slider = createSlider(800, 1250, 950);
    slider.parent('slider')

    // Set Up canvas
    canvas = createCanvas(0, 0);
    changeCanvasSize()
    canvas.parent('container')
    frameRate(30);
    loop();
}

function draw() {
    // If window scrolls away from the Canvas, do not render animation
    if(!isInViewport(box)){
        return
    }
    let bias = (slider.value()/1000) ** 3
    clear();
    background(0);
    let square_size = Math.floor(SPACE_BETWEEN/3)

    // Main Loop
    for(let x = 0; x < scalar_array.length; x++){
        for(let y = 0; y < scalar_array[x].length; y++){
            // Create a point object for entry in the array
            // TODO: This could be done a lot more efficiently
            scalar_array[x][y] = {
                data: Math.floor(getNoise(x,y) * bias),
                xpos: x * SPACE_BETWEEN,
                ypos: y * SPACE_BETWEEN,
                x: x,
                y: y,
            }

            // If point is active draw a square
            fill(0, 255, 0)
            if(scalar_array[x][y].data !== 0){
                square(scalar_array[x][y].xpos - square_size/2, scalar_array[x][y].ypos -square_size/2, square_size)
            }

            // If the point isn't on the left or top border, compare it to the points left and above it.
            if(x > 0 && y > 0){
                let current_square = [scalar_array[x-1][y-1], scalar_array[x][y-1], scalar_array[x][y], scalar_array[x-1][y]]
                let active_corners = current_square.filter(point => point.data >= 1)
                if     (active_corners.length === 1){onePointActive(active_corners[0], x, y)}
                else if(active_corners.length === 2){twoPointsActive(active_corners, x, y)}
                else if(active_corners.length === 3){
                    let inactive_corners = current_square.filter(point => point.data < 1)
                    onePointActive(inactive_corners[0], x, y)
                }
            }
        }
    }
}

function windowResized(){
    changeCanvasSize()
}

function onePointActive(point, x, y){
    noFill()
    stroke(color(0,255,0))
    let xval = point.x - x
    let yval = point.y - y
    let line_vector = {
        x1: x*SPACE_BETWEEN - SPACE_BETWEEN/2,
        y1: (y + yval) * SPACE_BETWEEN,
        x2: (x + xval) * SPACE_BETWEEN,
        y2: y*SPACE_BETWEEN - SPACE_BETWEEN/2,
    }
    line(line_vector.x1, line_vector.y1, line_vector.x2, line_vector.y2)
}

function twoPointsActive(active_corners, x, y){
    noFill()
    stroke(color(0,255,0))
    // If points are complements treat them both as solo points
    if (active_corners[0].x === active_corners[1].x){
        xval = x * SPACE_BETWEEN - SPACE_BETWEEN/2
        line(xval, y * SPACE_BETWEEN, xval, (y - 1) * SPACE_BETWEEN)
    }
    else if (active_corners[0].y === active_corners[1].y){
        yval = y * SPACE_BETWEEN - SPACE_BETWEEN/2
        line(x * SPACE_BETWEEN, yval, (x - 1) * SPACE_BETWEEN, yval)
    }
    else {
        onePointActive(active_corners[0], x, y)
        onePointActive(active_corners[1], x, y)
    }
}

function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
    )
}

function changeCanvasSize() {
    CANVAS_HEIGHT = Math.floor(window.innerHeight * CANVAS_RATIO_HEIGHT)
    CANVAS_HEIGHT -= CANVAS_HEIGHT % SPACE_BETWEEN
    // CANVAS_WIDTH = Math.floor(window.innerWidth * CANVAS_RATIO_WIDTH)
    if(window.innerWidth > 672){
        CANVAS_WIDTH = Math.min(window.innerWidth - 128, 832)
    } else {
        CANVAS_WIDTH = window.innerWidth - 32
    }
    CANVAS_WIDTH -= CANVAS_WIDTH % SPACE_BETWEEN
    scalar_array = Array(CANVAS_WIDTH/SPACE_BETWEEN + 1).fill(0).map(() => Array(CANVAS_HEIGHT/SPACE_BETWEEN + 1).fill(0))
    resizeCanvas(CANVAS_WIDTH, CANVAS_HEIGHT, false)
    slider_parent.firstChild.style.width = CANVAS_WIDTH.toString() + "px"
}
