import './mediapipe/face_mesh/face_mesh.js';
import './mediapipe/camera_utils/camera_utils.js';
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'
import { DEFAULT_FOV, Renderer, GlassesTransformDict, RenderOptions } from './Renderer.js';


window.addEventListener('load', main);

function main() {

	const videoElement = document.getElementById('input_video');
	// 	Hide input video
	// videoElement.style.display = 'none';

	const outputCanvas = document.getElementById('output_canvas');
	// 	Construct the Renderer

	// 	FPS Stats
	const stats = Stats()
	document.body.appendChild( stats.dom )
	
	// 	Initialize MediaPipe FaceMesh
	const faceMesh = new FaceMesh({
		locateFile: (file) => {
			return `./mediapipe/face_mesh/${file}`;
		}
	});

	// 	Set FaceMesh options
	

	// 	Set callback on FaceMesh output result
	

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
	// 		Camera
	const cameraFolder = gui.addFolder( 'Camera' )
	
	// 		Glasses Offset
	const glassesTransformDict = GlassesTransformDict;
	
	// 		Render Mode
	const renderOptionFolder = gui.addFolder( 'RenderOptions' );
}
