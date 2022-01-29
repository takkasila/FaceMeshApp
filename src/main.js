import * as THREE from './three/build/three.module.js';

import './mediapipe/camera_utils/camera_utils.js';
import './mediapipe/control_utils/control_utils.js';
import './mediapipe/drawing_utils/drawing_utils.js';
import './mediapipe/face_mesh/face_mesh.js';

window.addEventListener('load', main);

function main() {

	console.log(FaceMesh);

	const videoElement = document.getElementsByClassName('input_video')[0];
	const canvasElement = document.getElementsByClassName('output_canvas')[0];

	const canvasElements = document.getElementsByClassName('output_canvas')[0];


	const canvasCtx = canvasElement.getContext('2d');

	function onResults(results) {
		canvasCtx.save();
		canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
		canvasCtx.drawImage(
			results.image, 0, 0, canvasElement.width, canvasElement.height);
		if (results.multiFaceLandmarks) {
			for (const landmarks of results.multiFaceLandmarks) {
				drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION,
					{ color: '#C0C0C070', lineWidth: 1 });
				drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, { color: '#FF3030' });
				drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, { color: '#FF3030' });
				drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, { color: '#FF3030' });
				drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, { color: '#30FF30' });
				drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, { color: '#30FF30' });
				drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, { color: '#30FF30' });
				drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, { color: '#E0E0E0' });
				drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, { color: '#E0E0E0' });
			}
		}
		canvasCtx.restore();
	}

	const faceMesh = new FaceMesh({
		locateFile: (file) => {
			return `./mediapipe/face_mesh/${file}`;
		}
	});

	faceMesh.setOptions({
		maxNumFaces: 1,
		refineLandmarks: true,
		minDetectionConfidence: 0.5,
		minTrackingConfidence: 0.5
	});
	faceMesh.onResults(onResults);

	const camera = new Camera(videoElement, {
		onFrame: async () => {
			await faceMesh.send({ image: videoElement });
		},
		width: 1280,
		height: 720
	});
	camera.start();

}
