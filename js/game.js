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

// Initialize actors
var actors = [];
actors.push({
    team: 1,
    color: 0x2fe02a,
    x: 200,
    y: 250,
    power: 100,
    level: 2,
    sprite: {}
},{
    team: 2,
    color: 0x2a88e0,
    x: 600,
    y: 450,
    power: 50,
    level: 1,
    sprite: {}
});

// Methods
var getSizeFromPower = function (power) {
    // The power is the area of a circle, so the size is the diameter
    return Math.sqrt(power / Math.PI) * 5;
}

// Initialize objects
for (var i = 0; i < actors.length; i++) {
    
    const diameter = getSizeFromPower(actors[i].power);
    
    const graphics = new PIXI.Graphics();
    const upscale = 1000;
    graphics.beginFill(actors[i].color);
    graphics.lineStyle(0);
    graphics.drawCircle(upscale, upscale, upscale);
    graphics.endFill();

    const texture = PIXI.RenderTexture.create(graphics.width, graphics.height);
    app.renderer.render(graphics, texture);

    actors[i].sprite = new PIXI.Sprite(texture);
    actors[i].sprite.x = actors[i].x;
    actors[i].sprite.y = actors[i].y;
    actors[i].sprite.anchor.set(0.5, 0.5);
    actors[i].sprite.interactive = true;
    actors[i].sprite.hitArea = new PIXI.Circle(0, 0, upscale);
    
    const sprite = actors[i].sprite;
    actors[i].sprite.pointerover = function() {
        sprite.alpha = .5;
    };
    actors[i].sprite.pointerout = function() {
        sprite.alpha = 1;
    };
    
    app.stage.addChild(actors[i].sprite);
}

// Game loop
app.ticker.add((delta) => {
    // Number of seconds since the last frame
    var seconds = app.ticker.elapsedMS / 1000;
    
    // Update strengths
    for (var i = 0; i < actors.length; i++) {
        actors[i].power += actors[i].level * seconds;
        var size = getSizeFromPower(actors[i].power);
        actors[i].sprite.width = size;
        actors[i].sprite.height = size;
    }
});



