import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export class Renderer
{
	canvas;
	scene;
	camera;
	renderer;
	
	controls;

	constructor( canvas )
	{
		this.canvas = canvas;

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( 75, this.canvas.width / this.canvas.height, 0.1, 2000 );
		this.camera.position.set( 5, 5, 5 );
		this.camera.lookAt( 0, 0, 0 );

		this.renderer = new THREE.WebGLRenderer( { canvas: this.canvas } );
		this.renderer.setSize( this.canvas.width, this.canvas.height );

		const axesHelper = new THREE.AxesHelper( 3 );
		this.scene.add( axesHelper );

		const geometry = new THREE.BoxGeometry( 1, 1, 1 );
		const material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe: true} );
		const cube = new THREE.Mesh( geometry, material );
		this.scene.add( cube );


		this.controls = new OrbitControls( this.camera, this.canvas );

		this.controls.update();
	}

	render( faceMeshResult )
	{
		this.controls.update();

		const texture = new THREE.CanvasTexture( faceMeshResult.image );
		this.scene.background = texture;

		if( faceMeshResult.multiFaceGeometry ){
			const faceGeo = faceMeshResult.multiFaceGeometry[0];
			const mat = faceGeo.getPoseTransformMatrix();
			// console.log( mat.getPackedDataList() );

			// TODO: Use THREE.js to draw and transform face geometry
		}

		this.renderer.render( this.scene, this.camera );
	}
}