import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'

import { GUI } from 'dat.gui'

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(-50, 90, 150);
camera.lookAt(0, 0, 0)

const orbitControls = new OrbitControls(camera, renderer.domElement)

const texLoader = new THREE.TextureLoader()

const sunTex = texLoader.load('sun.jpg')
const earthTex = texLoader.load('earth.jpg')
const marsTex = texLoader.load('mars.jpg')
const mercuryTex = texLoader.load('mercury.jpg')
const neptuneTex = texLoader.load('neptune.jpg')
const plutoTex = texLoader.load('pluto.jpg')
const saturnTex = texLoader.load('saturn.jpg')
const saturnRingTex = texLoader.load('saturn_ring.png')
const uranusTex = texLoader.load('uranus.jpg')
const venusTex = texLoader.load('venus.jpg')
const jupiterTex = texLoader.load('jupiter.jpg')
const uranusRingTex = texLoader.load('uranus_ring.png')


const cubeTexLoader = new THREE.CubeTextureLoader()
const cubeTex = cubeTexLoader.load([
	'stars.jpg',
	'stars.jpg',
	'stars.jpg',
	'stars.jpg',
	'stars.jpg',
	'stars.jpg'
])
scene.background = cubeTex

// const light = new THREE.PointLight(0xffffff, 15000, 0)
const light = new THREE.PointLight(0xffffff, 4, 300, 0)
scene.add(light)

const bigLight = new THREE.AmbientLight(0xffffff, 0)
scene.add(bigLight)

// const lightHelper = new THREE.PointLightHelper(light, 0.2)
// scene.add(lightHelper)

const orbits = []
function createOrbit(radius) {
	const points = [];

	for (let i = 0; i <= 100; i++) {
		const angle = (i / 100) * Math.PI * 2;
		const x = radius * Math.cos(angle);
		const z = radius * Math.sin(angle);
		points.push(x, 0, z);
	}

	const orbitGeo = new THREE.BufferGeometry()
	orbitGeo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))


	const orbit = new THREE.Line(
		orbitGeo,
		new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
	)
	scene.add(orbit)
	orbits.push(orbit)
}

function createPlanet(size, tex, x, ring) {
	const planetObj = new THREE.Object3D()

	const planet = new THREE.Mesh(
		new THREE.SphereGeometry(size, 50, 50),
		new THREE.MeshStandardMaterial({ map: tex })
	)
	planet.position.x = x

	// the ring around uranus and saturn
	if (ring) {
		const ringGeo = new THREE.RingGeometry(
			ring.innerRadius,
			ring.outerRadius,
			32
		);
		const ringMat = new THREE.MeshBasicMaterial({
			map: ring.ringmat,
			side: THREE.DoubleSide,
		});
		const ringMesh = new THREE.Mesh(ringGeo, ringMat);
		planetObj.add(ringMesh);
		ringMesh.position.set(x, 0, 0);
		ringMesh.rotation.x = -0.5 * Math.PI;
	}

	scene.add(planetObj)

	planetObj.add(planet)
	createOrbit(x)

	return {
		planetObj,
		planet
	}
}

const sun = new THREE.Mesh(
	new THREE.SphereGeometry(15, 50, 50),
	new THREE.MeshBasicMaterial({ map: sunTex })
)
scene.add(sun)

const planets = [
  {
    ...createPlanet(3.2, mercuryTex, 28),
    rotaing_speed_around_sun: 0.004,
    self_rotation_speed: 0.004,
  },
  {
    ...createPlanet(5.8, venusTex, 44),
    rotaing_speed_around_sun: 0.015,
    self_rotation_speed: 0.002,
  },
  {
    ...createPlanet(6, earthTex, 62),
    rotaing_speed_around_sun: 0.01,
    self_rotation_speed: 0.02,
  },
  {
    ...createPlanet(4, marsTex, 78),
    rotaing_speed_around_sun: 0.008,
    self_rotation_speed: 0.018,
  },
  {
    ...createPlanet(12, jupiterTex, 100),
    rotaing_speed_around_sun: 0.002,
    self_rotation_speed: 0.04,
  },
  {
    ...createPlanet(10, saturnTex, 138, {
      innerRadius: 10,
      outerRadius: 20,
      ringmat: saturnRingTex,
    }),
    rotaing_speed_around_sun: 0.0009,
    self_rotation_speed: 0.038,
  },
  {
    ...createPlanet(7, uranusTex, 176, {
      innerRadius: 7,
      outerRadius: 12,
      ringmat: uranusRingTex,
    }),
    rotaing_speed_around_sun: 0.0004,
    self_rotation_speed: 0.03,
  },
  {
    ...createPlanet(7, neptuneTex, 200),
    rotaing_speed_around_sun: 0.0001,
    self_rotation_speed: 0.032,
  },
  {
    ...createPlanet(2.8, plutoTex, 216),
    rotaing_speed_around_sun: 0.0007,
    self_rotation_speed: 0.008,
  },
];

const gui = new GUI()
const options = {
	"real view": true,
	"show path": true,
	speed: 1
}
gui.add(options, "real view").onChange(e => {
	bigLight.intensity = e ? 0 : 0.5
})
gui.add(options, 'show path').onChange(e => {
	orbits.forEach(o => {
		o.visible = e
	})
})
gui.add(options, 'speed', 0, 20)

function animate() {
	renderer.render(scene, camera)

	sun.rotateY(options.speed * 0.004)

	planets.forEach(planet => {
		planet.planetObj.rotateY(options.speed * planet.rotaing_speed_around_sun)
		planet.planet.rotateY(options.speed * planet.self_rotation_speed)
	})
}

window.onresize = () => {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
}

renderer.setAnimationLoop(animate)