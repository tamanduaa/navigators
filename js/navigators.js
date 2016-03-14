
var game = new Phaser.Game(1300, 700, Phaser.CANVAS, 'gameContainer');

var map;
var tileset;
var layer;
var pathfinder;

var cursors;
var sprite;
var marker;
var blocked = false;
var delay = 0;
var agents = [];



var mainState = {
    preload: function(){
        game.load.tilemap('test', 'assets/img/test.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tiles', 'assets/img/terrain_atlas.png');
        game.load.image('redsquare', 'assets/img/red.png');
        game.load.image('purplesquare', 'assets/img/purple.png');
        game.load.image('greensquare', 'assets/img/green.png');
    },


   
    create: function(){
        game.physics.startSystem(Phaser.Physics.ARCADE);

        map = game.add.tilemap('test');
        map.addTilesetImage('terrain_atlas', 'tiles');
        currentTile = map.getTile(2, 3);
        layer = map.createLayer('floor');
        map.setCollisionBetween(1, 100000, true, 'floor');
        layer.resizeWorld();

        var walkables = [30];

        pathfinder = game.plugins.add(Phaser.Plugin.PathFinderPlugin);
        pathfinder.setGrid(map.layers[0].data, walkables);

        sprite = game.add.sprite(450, 80, 'redsquare');
        sprite.anchor.setTo(0.5, 0.5);

        game.physics.enable(sprite);

        game.camera.follow(sprite);

        cursors = game.input.keyboard.createCursorKeys();
        marker = game.add.graphics();
        marker.lineStyle(2, 0x000000, 1);
        marker.drawRect(0, 0, 32, 32);

        setupAgents(agentPaths.length);
        agentPaths.forEach(function(agentPath, index){
            findAgentPath(agentPath.start, agentPath.end, agents[index]);
            advanceTween(agents[index]);
        })

    },
    update: function() {
        game.physics.arcade.collide(sprite, layer);

        sprite.body.velocity.x = 0;
        sprite.body.velocity.y = 0;
        sprite.body.angularVelocity = 0;

        if (cursors.left.isDown)
        {
            sprite.body.angularVelocity = -200;
        }
        else if (cursors.right.isDown)
        {
            sprite.body.angularVelocity = 200;
        }

        if (cursors.up.isDown)
        {
            sprite.body.velocity.copyFrom(game.physics.arcade.velocityFromAngle(sprite.angle, 300));
        }

        marker.x = layer.getTileX(game.input.activePointer.worldX) * 32;
        marker.y = layer.getTileY(game.input.activePointer.worldY) * 32;

        if (game.input.mousePointer.isDown)
        {
            blocked = true;
            findPathTo(layer.getTileX(marker.x), layer.getTileY(marker.y));
        }

        // march agents along
        // if(delay++ % 5 == 0){
        //     agents.forEach(function(agent){
        //         //update the position of agent
        //         agent.sprite.x = agent.steps[agent.stepsIndex].x * 32;
        //         agent.sprite.y = agent.steps[agent.stepsIndex].y * 32;
        //         ++agent.stepsIndex;
        //         agent.stepsIndex %= agent.steps.length;
        //     });
        // }
    },
    render: function(){

    }
}


function findPathTo(tilex, tiley) {
    pathfinder.setCallbackFunction(function(path) {
        path = path || [];
        for(var i = 0, ilen = path.length; i < ilen; i++) {
            map.putTile(46, path[i].x, path[i].y);
        }
        blocked = false;
    });

    pathfinder.preparePathCalculation([0,0], [tilex,tiley]);
    pathfinder.calculatePath();
}

function setupAgents(count){
     
    for(var i = 0; i < count; i++){
        var agentTypes = [ 'redsquare', 'purplesquare', 'greensquare' ];
        randomSprite = agentTypes[
        Math.floor(Math.random() * agentTypes.length)
    ];
        agents.push({
            steps: [],
            stepsIndex: 0,
            sprite: game.add.sprite(0, 0, randomSprite)
        });
    }
}

function findAgentPath(start, end, agent){
    pathfinder.setCallbackFunction(function(path) {
        path = path || [];
        for(var i = 0, ilen = path.length; i < ilen; i++) {
           agent.steps.push({
                x: path[i].x * 32,
                y: path[i].y * 32
           });
        }
        blocked = false;
    });

    pathfinder.preparePathCalculation([start.x, start.y], [end.x,end.y]);
    pathfinder.calculatePath();
}

function advanceTween(agent){
    agent.stepsIndex++;
    agent.stepsIndex %= agent.steps.length;
    if(agent.stepsIndex == 0){
        //reset to starting position
        agent.sprite.x = agent.steps[agent.stepsIndex].x;
        agent.sprite.y = agent.steps[agent.stepsIndex].y;
        advanceTween(agent);
    }else{
        agent.tween = game.add.tween(agent.sprite);
        agent.tween.to(agent.steps[agent.stepsIndex], 100, Phaser.Easing.Linear.None);
        agent.tween.onComplete.add(function(){
            advanceTween(agent);
        }, this);
        agent.tween.start();
    }
}

game.state.add('main', mainState);
game.state.start('main');
