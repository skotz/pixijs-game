//
// Scott Clayton 2019
//

// Initialize app
var app = new PIXI.Application({ 
    autoResize: true,
    resolution: devicePixelRatio,
    backgroundColor: 0xEEEEEE,
    antialias: true,
    resolution: 2
});
document.body.appendChild(app.view);

// Resize app to window size
window.addEventListener('resize', resize);
function resize() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    //rect.position.set(app.screen.width, app.screen.height);
}
resize();

// Settings
const growthFactor = 2.0;

// Initialize planets
var planets = [];
planets.push({
    team: 1,
    color: 0x2fe02a,
    x: 300,
    y: 250,
    power: 100,
    level: 2,
    sprite: {},
    ships: []
},{
    team: 2,
    color: 0x2a88e0,
    x: 700,
    y: 450,
    power: 50,
    level: 1,
    sprite: {},
    ships: []
},{
    team: 2,
    color: 0xe02a63,
    x: 500,
    y: 650,
    power: 10,
    level: 5,
    sprite: {},
    ships: []
});

// Get the size of a circle based on it's power level
var getSizeFromPower = function (power) {
    // The power is the area of a circle, so the size is the diameter
    return Math.sqrt(power / Math.PI) * 10;
}

// Create a ship for a given player
var createShip = function (actor, dx, dy) {
    const graphics = new PIXI.Graphics();
    const size = 2;
    graphics.beginFill(actor.color);
    graphics.lineStyle(0);
    graphics.drawCircle(size, size, size);
    graphics.endFill();

    const texture = PIXI.RenderTexture.create(graphics.width, graphics.height);
    app.renderer.render(graphics, texture);

    const sprite = new PIXI.Sprite(texture);
    sprite.x = actor.x + dx;
    sprite.y = actor.y + dy;
    sprite.anchor.set(0.5, 0.5);
    
    return sprite;
}

// Initialize objects
for (var i = 0; i < planets.length; i++) {
    
    const diameter = getSizeFromPower(planets[i].power);
    
    const graphics = new PIXI.Graphics();
    const upscale = 1000;
    graphics.beginFill(planets[i].color);
    graphics.lineStyle(0);
    graphics.drawCircle(upscale, upscale, upscale);
    graphics.endFill();

    const texture = PIXI.RenderTexture.create(graphics.width, graphics.height);
    app.renderer.render(graphics, texture);

    planets[i].sprite = new PIXI.Sprite(texture);
    planets[i].sprite.x = planets[i].x;
    planets[i].sprite.y = planets[i].y;
    planets[i].sprite.anchor.set(0.5, 0.5);
    planets[i].sprite.interactive = true;
    planets[i].sprite.hitArea = new PIXI.Circle(0, 0, upscale);
    
    const sprite = planets[i].sprite;
    planets[i].sprite.pointerover = function() {
        sprite.alpha = .5;
    };
    planets[i].sprite.pointerout = function() {
        sprite.alpha = 1;
    };
    
    // for (var s = 0; s < planets[i].power; s++) {
        // var dx = Math.random() * 100 - 50;
        // var dy = Math.random() * 100 - 50;
        // const ship = createShip(planets[i], dx, dy);
        // planets[i].ships.push(ship);
        // app.stage.addChild(ship);
    // }
    
    app.stage.addChild(planets[i].sprite);
}

// Game loop
app.ticker.add((delta) => {
    // Number of seconds since the last frame
    var seconds = app.ticker.elapsedMS / 1000;
    
    for (var i = 0; i < planets.length; i++) {        
        // Update strengths
        planets[i].power += planets[i].level * seconds * growthFactor;
        var size = getSizeFromPower(planets[i].power);
        planets[i].sprite.width = size;
        planets[i].sprite.height = size;
        
        // Add more ships
        while (planets[i].ships.length < planets[i].power) {
            var dx = Math.random() * 100 - 50;
            var dy = Math.random() * 100 - 50;
            const ship = createShip(planets[i], dx, dy);
            planets[i].ships.push(ship);
            app.stage.addChild(ship);
        }
        
        // Update the ships
        for (var s = 0; s < planets[i].ships.length; s++) {            
            // Random movement
            var range = 4;
            var dx = Math.random() * range - range / 2;
            var dy = Math.random() * range - range / 2;
            
            // Keep them somewhat close to the planet
            var distx = planets[i].sprite.x - planets[i].ships[s].x;
            var disty = planets[i].sprite.y - planets[i].ships[s].y;
            var dist = Math.sqrt(distx * distx + disty * disty);
            if (dist > size) {
                dx += distx * 0.001;
                dy += disty * 0.001;
            }
            if (dist < size) {
                dx -= distx * 0.001;
                dy -= disty * 0.001;
            }
            
            // Update ship location
            planets[i].ships[s].x += dx;
            planets[i].ships[s].y += dy;
        }
    }
});



