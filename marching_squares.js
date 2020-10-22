const CANVAS_WIDTH  = 750;
const CANVAS_HEIGHT = 700;
const Space_Between = 10;
const HORIZONTAL_RESOLUTION = CANVAS_WIDTH / Space_Between + 1;
const VERTICLE_RESOLUTION  = CANVAS_HEIGHT / Space_Between + 1;
generate_noise.seed(Math.random())

const box = document.querySelector('#container');
const slider_pos = document.querySelector('#slider').getBoundingClientRect()

function getNoise(x, y) {
    d = new Date();
    return generate_noise.perlin3(x/12,y/12, d.getTime() / 3000)+1
}

function setup() {
    // Create Slider For some interactivity
    slider = createSlider(800, 1250, 950);
    slider.position(slider_pos.left, slider_pos.top)
    slider.style('width', '200px');

    // Set Up canvas
    canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.parent('container')
    frameRate(30);
    noLoop();

    // p5 will draw circles at the corner unless specified
    ellipseMode(CENTER);
}

// Create a 2D array to hold every point we will use for our algorithm
scalar_array = Array(HORIZONTAL_RESOLUTION).fill(0).map(() => Array(VERTICLE_RESOLUTION).fill(0))

function draw() {
    let bias = (slider.value()/1000) ** 3
    clear();

    // Main Loop
    for(let y = 0; y < VERTICLE_RESOLUTION; y++){
        for(let x = 0; x < HORIZONTAL_RESOLUTION; x++){
            // Create a point object for entry in the array
            // TODO: This could be done a lot more efficiently
            scalar_array[x][y] = {
                data: Math.floor(getNoise(x,y) * bias),
                xpos: x * Space_Between,
                ypos: y * Space_Between,
                x: x,
                y: y,
            }

            // If point is active draw a circle
            if(scalar_array[x][y].data !== 0){
                ellipse(scalar_array[x][y].xpos, scalar_array[x][y].ypos, 2)
            }

            // If the point isn't on the left or top border, compare it to the points left and above it.
            if(x > 0 && y > 0){
                let current_square = [scalar_array[x-1][y-1], scalar_array[x][y-1], scalar_array[x][y], scalar_array[x-1][y]]
                let active_corners = current_square.filter(point => point.data >= 1)
                if     (active_corners.length === 1){onePointActive(active_corners[0], x, y)}
                else if(active_corners.length === 2){twoPointsActive(active_corners, x, y)}
                else if(active_corners.length === 3){
                    let array_diff = current_square.filter(point => !active_corners.includes(point))
                    onePointActive(array_diff[0], x, y)
                }
            }
        }
    }
    // If window scrolls away from the Canvas. Pause the Animation
    if(!isInViewport(box)){
        noLoop();
    }
}

function mousePressed() {
    loop();
}

function onePointActive(point, x, y){
    noFill()
    stroke(color(0,0,0))
    let xval = point.x - x
    let yval = point.y - y
    let line_vector = {
        x1: x*Space_Between - Space_Between/2,
        y1: (y + yval) * Space_Between,
        x2: (x + xval) * Space_Between,
        y2: y*Space_Between - Space_Between/2,
    }
    line(line_vector.x1, line_vector.y1, line_vector.x2, line_vector.y2)
}

function twoPointsActive(active_corners, x, y){
    // If points are complements treat them both as solo points
    if(active_corners[0].y !== active_corners[1].y && active_corners[0].x !== active_corners[1].x){
        onePointActive(active_corners[0], x, y)
        onePointActive(active_corners[1], x, y)
    }
    else if (active_corners[0].x === active_corners[1].x){
        xval = x * Space_Between - Space_Between/2
        line(xval, y * Space_Between, xval, (y - 1) * Space_Between)
    }
    else if (active_corners[0].y === active_corners[1].y){
        yval = y * Space_Between - Space_Between/2
        line(x * Space_Between, yval, (x - 1) * Space_Between, yval)
    }
}

function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)

    );
}