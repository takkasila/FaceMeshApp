import './mediapipe/face_mesh/face_mesh.js';
import './mediapipe/camera_utils/camera_utils.js';

import { Renderer } from './Renderer.js';


window.addEventListener('load', main);

function main() {

	const videoElement = document.getElementById('input_video');
	// 	Hide input video
	videoElement.style.display = 'none';

	const outputCanvas = document.getElementById('output_canvas');
	// 	Construct the Renderer
	const renderer = new Renderer( outputCanvas );

	// 	Initialize MediaPipe FaceMesh
	const faceMesh = new FaceMesh({
		locateFile: (file) => {
			return `./mediapipe/face_mesh/${file}`;
		}
	});

	faceMesh.setOptions({
		cameraNear: 1,
		cameraFar: 2000,
		cameraVerticalFovDegrees: 53,
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
	} );

	// 	Construct camera input
	const camera = new Camera(videoElement, {
		onFrame: async () => {
			await faceMesh.send({ image: videoElement });
		},
		width: 640,
		height: 480
	});
	camera.start();

}
