import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import Rocket from './physics/rocket'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { PlaneBufferGeometry } from "three";
import vector from './physics/vector'
import World from './physics/world'
import RocketModel from "./rocket_model";
import Particle from "./smoke";
// Canvas
const canvas = document.querySelector('canvas.app')

// Scene
const scene = new THREE.Scene()
    //GUI
const gui = new dat.GUI({
    width: 400,

});
gui.hide()
    /*
        Loaders
    */
const loadingBar = document.querySelector(".loadingBar");
const loadingManger = new THREE.LoadingManager(
    () => {
        gsap.delayedCall(0.5, () => {
            gsap.to(overlay.material.uniforms.uAlpha, { duration: 3, value: 0 });
            loadingBar.classList.add("ended");
            loadingBar.style.transform = "";
            const script = document.createElement('script');
            script.onload = function() {
                const stats = new Stats();
                document.body.appendChild(stats.dom);
                requestAnimationFrame(function loop() {
                    stats.update();
                    requestAnimationFrame(loop)
                });
            };
            script.src = 'stats.min.js';
            document.head.appendChild(script);
            text2.hidden = false;
            gui.show()
            gui.close()
            bgSound.play()
        });
    },
    (itemUrl, itemsLoaded, itemsTotal) => {
        loadingBar.style.transform = "scaleX(" + itemsLoaded / itemsTotal + ")";
    }
);
const loader = new GLTFLoader(loadingManger);
const textureLoader = new THREE.TextureLoader(loadingManger);

// sound
const listener = new THREE.AudioListener()

const audioLoader = new THREE.AudioLoader()
const bgSound = new THREE.Audio(listener)
audioLoader.load('../static/sounds/nuclear_alarm.mp3', function(buffer) {
    bgSound.setBuffer(buffer);
    bgSound.setVolume(0.1);
    bgSound.duration = 14;
    // bgSound.play();
});
const rocketSound = new THREE.Audio(listener)
audioLoader.load('../static/sounds/rocket.mp3', function(buffer) {
    rocketSound.setBuffer(buffer);
    rocketSound.setVolume(1.0);
});

// light
const light = new THREE.AmbientLight(0xffffff, 1.3);
light.position.set(0, 8000000, 100000000)
scene.add(light)

const light3 = new THREE.DirectionalLight(0xffffff, 1.5);
light3.position.set(0, 8000, 10000000)
    //scene.add(light3)

//fog

//space
const space = new THREE.Group()

/*
textures
*/
//earth
const earth = textureLoader.load('static/images/2_no_clouds_4k.jpg')
const earthbump = textureLoader.load('static/images/elev_bump_4k.jpg')
const water = textureLoader.load('static/images/water_4k.png')
    //stars
const texturestars = textureLoader.load('static/images/galaxy_starfield.png')
    //sun
const texturesun = textureLoader.load('static/textures copy/high/sun.jpg')
const specularsun = textureLoader.load('static/textures copy/mid/sun.png')
    //moon
const texturemoon = textureLoader.load('static/textures copy/high/moon.jpg')
const specularmoon = textureLoader.load('static/textures copy/high/moon-normal.png')
    //mars
const texturemars = textureLoader.load('static/textures copy/high/mars.jpg')
const specularmars = textureLoader.load('static/textures copy/high/mars-normal.png')
    // mercury
const texturemercury = textureLoader.load('static/textures copy/high/mercury.jpg')
const specularmercury = textureLoader.load('static/textures copy/high/mercury-normal.png')
    //venus
const texturevenus = textureLoader.load('static/textures copy/high/venus.jpg')
const specularvenus = textureLoader.load('static/textures copy/high/venus-normal.png')


const segments = 100;
let sphere = new THREE.Mesh(
    new THREE.SphereGeometry(World.earthRaduis, segments, segments),
    new THREE.MeshPhongMaterial({
        map: earth,
        bumpMap: earthbump,
        specularMap: water,
        specular: new THREE.Color('grey')
    })
);

sphere.rotation.x = 100
space.add(sphere)

const stars = new THREE.Mesh(
    new THREE.SphereGeometry(100000000, segments, segments),
    new THREE.MeshBasicMaterial({
        map: texturestars,
        side: THREE.BackSide
    })
);
scene.add(stars);

//sun
const sun = new THREE.Mesh(
    new THREE.SphereGeometry(69634000, segments, segments),
    new THREE.MeshPhongMaterial({
        map: texturesun,
        specularMap: specularsun,
    })
);
sun.position.z = -4031900;
sun.position.y = 8000;
space.add(sun)

//moon
const moon = new THREE.Mesh(
    new THREE.SphereGeometry(173740, segments, segments),
    new THREE.MeshPhongMaterial({
        map: texturemoon,
        specularMap: specularmoon,
    })
);
space.add(moon)
moon.position.z = -554400;
moon.position.y = 554400;
moon.position.x = 554400;

//mars
const mars = new THREE.Mesh(
    new THREE.SphereGeometry(338950, segments, segments),
    new THREE.MeshPhongMaterial({
        map: texturemars,
        specularMap: specularmars,
    })
);
space.add(mars)
mars.position.z = 3163200;
mars.position.y = 8000;
mars.position.x = 800;

//metcury
const mercury = new THREE.Mesh(
    new THREE.SphereGeometry(243970, segments, segments),
    new THREE.MeshPhongMaterial({
        map: texturemercury,
        specularMap: specularmercury,
    })
);
space.add(mercury)
mercury.position.z = -12302000;
mercury.position.y = 8000;
mercury.position.x = 80000;

//Venus
const venus = new THREE.Mesh(
    new THREE.SphereGeometry(605180, segments, segments),
    new THREE.MeshPhongMaterial({
        map: texturevenus,
        specularMap: specularvenus,
    })
);
space.add(venus)
venus.position.z = -21450000;
venus.position.y = 8000;
venus.position.x = -80000;
scene.add(space)

//earth
const ground = new THREE.Group()
    //models
const dracoLoader = new DRACOLoader()
loader.setDRACOLoader(dracoLoader)

//mountain
let mountains = []
loader.load(
    'static/mountineone/scene.gltf',
    (gltf) => {

        mountains[1] = gltf.scene.clone()
        mountains[2] = gltf.scene.clone()

        mountains[1].children[0]
        mountains[1].scale.set(1, 1.5, 0.5)
        mountains[1].rotateY((-Math.PI / 2) - 0.04)
        mountains[1].position.set(17000, -2600, 0)

        mountains[2].children[0]
        mountains[2].scale.set(1, 1.5, 0.5)
        mountains[2].rotateY((-Math.PI / 2) - 0.04)
        mountains[2].position.set(-18000, -2600, 0)

        ground.add(mountains[2])
        ground.add(mountains[1])
    }
)

// fence
let fence = []
loader.load(
        'static/barbed-wire_fence/scene.gltf',
        (gltf) => {

            for (let i = 0; i < 12; i++) {
                fence[i] = gltf.scene.clone()
            }
            for (let i = 1; i <= 3; i++) {
                fence[i - 1].children[0]
                fence[i - 1].scale.set(3, 1, 3)
                fence[i - 1].rotateY(-Math.PI)
                fence[i - 1].position.set(500 - i * 190, 0, 250)
            }

            for (let i = 1; i <= 3; i++) {
                fence[i + 2].children[0]
                fence[i + 2].scale.set(3, 1, 3)
                fence[i + 2].position.set(305 - i * 190, 0, -320)
            }
            for (let i = 1; i <= 3; i++) {
                fence[i + 5].children[0]
                fence[i + 5].scale.set(3, 1, 3)
                fence[i + 5].rotateY(-(Math.PI / 2))
                fence[i + 5].position.set(306, 0, 250 - i * 190)
            }
            for (let i = 1; i <= 3; i++) {
                fence[i + 8].children[0]
                fence[i + 8].scale.set(3, 1, 3)
                fence[i + 8].rotateY((Math.PI / 2))
                fence[i + 8].position.set(-261, 0, 446 - i * 190)

            }
            for (let i = 0; i < 12; i++) {
                ground.add(fence[i])
            }
        }
    )
    //tree
let tree = []
loader.load('static/lowpoly_tree_model/scene.gltf',
        (gltf) => {
            tree[1] = gltf.scene.clone()
            tree[2] = gltf.scene.clone()
            tree[3] = gltf.scene.clone()
            tree[4] = gltf.scene.clone()


            tree[1].children[0]
            tree[1].scale.set(1, 1, 1)
            tree[1].position.set(2000, 0, 4000)
            ground.add(tree[1])

            tree[2].children[0]
            tree[2].scale.set(1, 1, 1)
            tree[2].position.set(-2000, 0, 4000)
            ground.add(tree[2])

            tree[3].children[0]
            tree[3].scale.set(1, 1, 1)
            tree[3].position.set(2000, 0, -4000)
            ground.add(tree[3])

            tree[4].children[0]
            tree[4].scale.set(1, 1, 1)
            tree[4].position.set(-2000, 0, -4000)
            ground.add(tree[4])
        }
    )
    //textures
const floorTexture = textureLoader.load('static/ocean.jpg')
const sphereTexture = textureLoader.load('static/skybox.png')

//grass
const grassColorTexture = textureLoader.load("static/land/color.png");
const grassMetalnessTexture = textureLoader.load("static/land/metalness.png");
const grassAmbientOcclusionTexture = textureLoader.load("static/land/ambientOcclusion.png");
const grassNormalTexture = textureLoader.load("static/land/normal.png");
const grassRoughnessTexture = textureLoader.load("static/land/roughness.png");
const grassHeightTexture = textureLoader.load("static/land/height.png");

grassColorTexture.repeat.set(150, 150);
grassAmbientOcclusionTexture.repeat.set(150, 150);
grassNormalTexture.repeat.set(150, 150);
grassRoughnessTexture.repeat.set(150, 150);
grassHeightTexture.repeat.set(150, 150);
grassMetalnessTexture.repeat.set(150, 150);

grassColorTexture.wrapS = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;
grassHeightTexture.wrapS = THREE.RepeatWrapping;
grassMetalnessTexture.wrapS = THREE.RepeatWrapping;

grassColorTexture.wrapT = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;
grassHeightTexture.wrapT = THREE.RepeatWrapping;
grassMetalnessTexture.wrapT = THREE.RepeatWrapping;

const floor = new THREE.Mesh(
    new THREE.CircleBufferGeometry(635675.22, 100),
    new THREE.MeshStandardMaterial({
        map: floorTexture
    }))
floor.position.y = -100
floor.rotation.x = -Math.PI * 0.5

ground.add(floor)

sphere = new THREE.Mesh(
    new THREE.SphereGeometry(635675.22, 100, 100),
    new THREE.MeshPhongMaterial({
        map: sphereTexture,
        side: THREE.BackSide
    })
);
ground.add(sphere)

//land one
const land = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(90000, 90000, 100, 100),
    new THREE.MeshStandardMaterial({
        map: grassColorTexture,
        aoMap: grassAmbientOcclusionTexture,
        displacementMap: grassHeightTexture,
        metalnessMap: grassMetalnessTexture,
        displacementScale: 2,
        normalMap: grassNormalTexture,
        roughnessMap: grassRoughnessTexture,

    })
);
land.material.roughness = 0.05;
land.geometry.setAttribute("uv2",
    new THREE.Float32BufferAttribute(land.geometry.attributes.uv.array, 2)
);
land.rotation.x = -Math.PI / 2;
ground.add(land);

scene.add(ground)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// rocket model
let rocket1 = new RocketModel();
const rocketW = new THREE.Group();
rocketW.position.set(0, 200, 0)
    // rocket1.mesh.rotateY(1.5)
ground.add(rocketW)
rocketW.add(rocket1.mesh)

// particle system
const createSmoke = () => {
    let p = getParticle();
    dropParticle(p);
};

const particleArray = [];

const getParticle = () => {
    let p;
    if (particleArray.length) {
        p = particleArray.pop();
    } else {
        p = new Particle();
    }
    return p;
};
const smoke = new THREE.Group();
ground.add(smoke)
const dropParticle = (particle) => {
    smoke.add(particle.mesh);
    const s = Math.random() + parameters.nozzleRaduis;
    particle.mesh.material.opacity = 1;
    particle.mesh.scale.set(s * 0.4 * parameters.nozzleRaduis, s * parameters.rocketHeight, s * 0.4 * parameters.nozzleRaduis);
    particle.mesh.position.x = rocketW.position.x;
    particle.mesh.position.y = rocketW.position.y - 350 * p.rocketHeight;
    particle.mesh.position.z = rocketW.position.z;

    // p.mesh.scale.set(s * 0.015, s * 0.015, s * 0.015);
    // p.mesh.position.x = 2.5;
    // p.mesh.position.y = -2.2;
    // p.mesh.position.z = 0;

    gsap.to(particle.mesh.scale, {
        duration: 1,
        x: s * parameters.nozzleRaduis,
        y: s * 0.8,
        z: s * parameters.nozzleRaduis,
        ease: "power3.inOut",
        onComplete: recycleParticle,
        onCompleteParams: [particle],
    });
    gsap.to(
        particle.mesh.position, {
            duration: 1,
            z: 1,
            y: rocketW.position.y - parameters.rocketHeight,
            ease: "none",
        }
        //{
        //   duration: 1,
        //   y: -5,
        //   ease: "none",
        // }
    );
    gsap.to(
        particle.mesh.rotation, {
            duration: 1,
            z: angle,

        }
    );
    gsap.to(particle.mesh.material, {
        duration: 1,
        opacity: 0,
        ease: "none",
    });
};

const recycleParticle = (p) => {
    p.mesh.rotation.x = Math.random() * Math.PI * 2;
    p.mesh.rotation.y = Math.random() * Math.PI * 2;
    p.mesh.rotation.z = Math.random() * Math.PI * 2;
    particleArray.push(p);
};

//

let i = 0;
let angle = 0

function moveCamera(event) {
    switch (event.keyCode) {
        case 39:
            i += 0.1
            break;
        case 37:
            i -= 0.1
            break;
        case 32:
            if (go) {
                isLunch = true;
                go = false;
                gui.hide()
                rocketSound.play();
            }
            break;
        case 65:
            if (isLunch) {
                if (10.0 > angle)
                    angle += 1
                console.log(angle)

            }
            break;
        case 68:
            if (isLunch) {
                if (angle > -10.0)
                    angle -= 1
                console.log(angle)
            }
            break;
    }
}

let go = true;
let isLunch = false;

document.addEventListener('keydown', moveCamera, false)


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100000000)
camera.position.z = 500
camera.position.y = 50
camera.lookAt(rocketW.position)
camera.add(listener)
scene.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * parameter
 */
const parameters = {
    rocketMass: 20000,
    fuelMass: 10000,
    rocketHeight: 0.5,
    rocketRadius: 0.5,
    engineType: 1,
    temperature: 30,
    headType: 1,
    nozzleRaduis: 1.5,
    dTime: 1,
    engine_1: () => {
        parameters.engineType = 1;
        console.log("engineType = 1")
    },
    engine_2: () => {
        parameters.engineType = 2;
        console.log("engineType = 2")

    },
    engine_3: () => {
        parameters.engineType = 3;
        console.log("engineType = 3")

    },
    head_1: () => {
        parameters.headType = 1;
        rocket1.headCone()
    },
    head_2: () => {
        parameters.headType = 2;
        rocket1.headHemisphere()
    },
    head_3: () => {
        parameters.headType = 3;
        rocket1.headCylinder()
    }

}

const rocket = gui.addFolder('Rocket');
const head = gui.addFolder('Head');
const forces = gui.addFolder('Forces');
const engines = gui.addFolder('Engines');
// const settings = gui.addFolder('Settings');
rocket.open()
head.open()
forces.open()
engines.open()
    // settings.open()
rocket.add(parameters, 'rocketMass', 10000, 10000000).step(2).name('Mass (kg)')
rocket.add(parameters, 'fuelMass', 1, 500000).step(10).name('Fuel Mass');
rocket.add(parameters, 'rocketHeight', 0.2, 2).step(0.001).name('Height');
rocket.add(parameters, 'rocketRadius', 0.2, 2).step(0.001).name('Radius');
rocket.add(parameters, 'nozzleRaduis', 0.2, 2).step(0.001).name('Nozzle Raduis');
head.add(parameters, 'head_1').name('Cone');
head.add(parameters, 'head_2').name('Half Sphere');
head.add(parameters, 'head_3').name('Short Cylinder');
// settings.add(parameters, 'dTime').name('Time Difference');
forces.add(parameters, 'temperature', -50, 50).step(1).name('Temperature');
engines.add(parameters, 'engine_1').name('Rocketdyne F-1');
engines.add(parameters, 'engine_2').name('Aerojet M-1');
engines.add(parameters, 'engine_3').name('RD-170');

let dTime = 0.009;
let p = new Rocket(
    vector.create(
        rocketW.position.x,
        rocketW.scale.y * 200
    ),
    100000,
    10000,
    100,
    5,
    1,
    1,
    30,
    4
);
let xx = 0;
let yy = 0;


/**
 * Display The Values on the Screen
 */
const text2 = document.createElement('div');
text2.style.position = 'absolute';
text2.style.width = "100";
text2.style.height = "100";
text2.style.backgroundColor = "white";
text2.style.top = "50" + 'px';
text2.style.left = "50" + 'px';
text2.style.fontSize = "20px";
text2.hidden = true;
document.body.appendChild(text2);
let generateTextOnScreen = () => {
    let text = 'Rocket fuel mass: ' + p.fuelMass.toFixed(2) + '/' + parameters.fuelMass.toFixed(2).toString();
    text += '<br>';
    text += 'Rocket speed x: ' + p.vilocity.getX().toFixed(2);
    text += '<br>';
    text += 'Rocket speed y: ' + p.vilocity.getY().toFixed(2);
    text += '<br>';
    text += 'Rocket height: ' + (p.position.getY() - (p.rocketHeight / 2)).toFixed(2);
    text += '<br>';
    text += 'Gravity: ' + p.gravity;
    text += '<br>';
    text2.innerHTML = text;
}
const text3 = document.createElement('div');
text3.style.position = 'absolute';
text3.style.textAlign = 'center'
text3.style.width = "5000";
text3.style.height = "5000";
text3.style.backgroundColor = "black";
text3.style.top = "0" + 'px';
text3.style.left = "0" + 'px';
text3.style.bottom = "0" + 'px';
text3.style.right = "0" + 'px';
text3.style.fontSize = "90px";
text3.style.color = 'red'
text3.hidden = true;
document.body.appendChild(text3);
let generateTextOnScreen2 = () => {
        let text = '<br>' + '<br>' + '<br>';
        text += 'The End ';
        text += '<br>';
        text3.innerHTML = text;
    }
    /**
     * Animate
     */
const clock = new THREE.Clock()
let collisionFactor = rocketW.scale.y * 400;
let oldVilocity = p.vilocity;
const tick = () => {
    clock.getElapsedTime();
    // Update GUI
    gui.updateDisplay()
        //move rocket
    if (isLunch === false) {
        p.position._y = rocketW.scale.y * 400
        if (go) {
            p.rocketMass = parameters.rocketMass
            p.fuelMass = parameters.fuelMass
            p.temperature = parameters.temperature
            p.setEngineType(parameters.engineType)
            p.rocketHeight = parameters.rocketHeight
            p.rocketRadius = parameters.rocketRadius
            p.setHeadType(parameters.headType)
            p.nozzleRaduis = parameters.nozzleRaduis
            p.dTime = parameters.dTime
            let m = p.maximumVelocity(parameters.fuelMass)
                // console.log('m', m)
            p.maxVelocity = m
        }
    }

    if (p.isOutAthomspere()) {
        text3.hidden = false;
    }

    xx = p.position._x;
    yy = p.position._y;
    camera.position.y = yy;
    if (isLunch) {
        if (p.fuelMass !== 0) {
            createSmoke();
        }
        rocketW.rotation.z = angle / 10;
        smoke.position.x = 18 * angle
        smoke.position.y = 8 * Math.abs(angle)
        rocket1.mesh.rotation.y += Math.sin(1) * 0.02;
        p.update(dTime, oldVilocity, angle, collisionFactor);
        oldVilocity = p.vilocity;
        // console.log("Position", p.position)
    }
    if (p.checkCollision() || p.position.getY() === collisionFactor) {
        isLunch = false;
    }
    rocketW.position.set(
        xx,
        yy,
        0
    )
    rocketW.scale.set(parameters.rocketRadius, parameters.rocketHeight, parameters.rocketRadius)
    rocket1.base.scale.x = parameters.nozzleRaduis
    rocket1.base.scale.z = parameters.nozzleRaduis
    camera.position.x = p.position.getX() + 500 * Math.sin(i)
    camera.position.z = 500 * Math.cos(i)
    camera.lookAt(rocketW.position)
        // Render
    renderer.render(scene, camera)
    generateTextOnScreen();
    generateTextOnScreen2();
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()


/*
    Overlay
*/
const overlay = new THREE.Mesh(
    new PlaneBufferGeometry(2, 2, 1, 1),
    new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
            uAlpha: { value: 1 },
        },
        vertexShader: `
          void main()
          {
              gl_Position =  vec4(position ,1.0);
          }
          `,
        fragmentShader: `
          uniform float uAlpha;
          void main() 
          {
              gl_FragColor = vec4(0.0 , 0.0 , 0.0 , uAlpha);
          }
          `,
    })
);
scene.add(overlay);