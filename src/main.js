import './mediapipe/face_mesh/face_mesh.js';
import './mediapipe/camera_utils/camera_utils.js';
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'
import { Renderer } from './Renderer.js';


window.addEventListener('load', main);

function main() {

	const videoElement = document.getElementById('input_video');
	// 	Hide input video
	videoElement.style.display = 'none';

	const outputCanvas = document.getElementById('output_canvas');
	// 	Construct the Renderer
	const renderer = new Renderer( outputCanvas );

	// 	FPS Stats
	const stats = Stats()
	document.body.appendChild( stats.dom )
	
	// 	Initialize MediaPipe FaceMesh
	const faceMesh = new FaceMesh({
		locateFile: (file) => {
			return `./mediapipe/face_mesh/${file}`;
		}
	});

	faceMesh.setOptions({
		cameraNear: 1,
		cameraFar: 2000,
		cameraVerticalFovDegrees: 66,
		enableFaceGeometry: true,
		selfieMode: true,
		maxNumFaces: 1,
		refineLandmarks: false,
		minDetectionConfidence: 0.5,
		minTrackingConfidence: 0.5,
	});

	// 	Set callback on FaceMesh output result
	faceMesh.onResults( ( faceMeshResults ) => {
		
		renderer.render( faceMeshResults );
		
		stats.update();
	} );

	// 	Construct camera input
	const camera = new Camera(videoElement, {
		onFrame: async () => {
			await faceMesh.send({ image: videoElement });
		},
		width: outputCanvas.width,
		height: outputCanvas.height
	});
	camera.start();

	// 	GUI
	const gui = new GUI()
	const cameraFolder = gui.addFolder('Camera')
	cameraFolder.add( renderer.camera, 'fov', 10, 100 ).onChange( ()=>{
		renderer.camera.updateProjectionMatrix();
	} )
	// cameraFolder.open()
}
