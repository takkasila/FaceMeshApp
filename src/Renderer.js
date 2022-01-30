import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OBJLoader2 } from 'wwobjloader2';

export class Renderer
{
	canvas;
	scene;
	camera;
	renderer;
	faceModelMesh;
	
	controls;

	constructor( canvas )
	{

		this.canvas = canvas;

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( 53, this.canvas.width / this.canvas.height, 0.1, 2000 );
		this.camera.position.set( 5, 5, 5 );
		this.camera.lookAt( 0, 0, 0 );

		this.renderer = new THREE.WebGLRenderer( { canvas: this.canvas } );
		this.renderer.setSize( this.canvas.width, this.canvas.height );

		// 	Scene
		const axesHelper = new THREE.AxesHelper( 3 );
		this.scene.add( axesHelper );

		const geometry = new THREE.BoxGeometry( 1, 1, 1 );
		const greenWireframeMaterial = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe: true} );
		const cube = new THREE.Mesh( geometry, greenWireframeMaterial );
		this.scene.add( cube );


		// 	Instantiate the OBJLoader2
		const objLoader = new OBJLoader2();
		objLoader.setUseIndices(true);

		const thisObject = this;
		function onOBJLoaded( object )
		{
			// 	Add to scene
			thisObject.faceModelMesh = object.children[0];
			thisObject.scene.add( thisObject.faceModelMesh );
			
			thisObject.faceModelMesh.material = greenWireframeMaterial;

			// 	Set BufferAttribute usage to THREE.StreamDrawUsage for increased performance.
			const positionAttr = thisObject.faceModelMesh.geometry.getAttribute( 'position' );
			positionAttr.usage = THREE.StreamDrawUsage;

			const indexAttr = thisObject.faceModelMesh.geometry.getIndex();
			indexAttr.usage = THREE.StreamDrawUsage;
		}
		
		// load the canonical FaceMesh model
		objLoader.load(
			// resource URL
			'canonical_face_model.obj',
			// called when resource is loaded
			onOBJLoaded,
			// called when loading is in progresses
			function ( xhr ) {
				console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded geometry' );
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened', error );
			}
		);


		this.controls = new OrbitControls( this.camera, this.canvas );

		this.controls.update();
	}

	render( faceMeshResult )
	{
		this.controls.update();

		const texture = new THREE.CanvasTexture( faceMeshResult.image );
		this.scene.background = texture;

		if( faceMeshResult.multiFaceGeometry ){

			const faceGeometry = faceMeshResult.multiFaceGeometry[0];

			if( faceGeometry === undefined )
				return;

			// 	Get head transformation matrix. The result is in row-major
			const transformMatrix = matrixDataToMatrix( faceGeometry.getPoseTransformMatrix() ).flat();

			const mesh = faceGeometry.getMesh();
			// 	5 * 468
			const verticies = mesh.getVertexBufferList();
			//  3 * 898
			const indicies = mesh.getIndexBufferList();

			// 	Get mesh BufferAttributes
			const positionAttr = this.faceModelMesh.geometry.getAttribute( 'position' );
			const indexAttr = this.faceModelMesh.geometry.getIndex();

			// 	Update mesh verticies
			for( let i = 0; i < 468; i++ )
			{
				// 	Position
				const x = verticies[ i * 5 ];
				const y = verticies[ i * 5 + 1 ];
				const z = verticies[ i * 5 + 2 ];
				
				positionAttr.array[ i * 3 ] = x;
				positionAttr.array[ i * 3 + 1 ] = y;
				positionAttr.array[ i * 3 + 2 ] = z;

				// 	Index
				const f1 = indicies[ i * 3 ];
				const f2 = indicies[ i * 3 + 1 ];
				const f3 = indicies[ i * 3 + 2 ];

				indexAttr.array[ i * 3 ] = f1;
				indexAttr.array[ i * 3 + 1 ] = f2;
				indexAttr.array[ i * 3 + 2 ] = f3;
			}

			// 	Set buffer update flag
			positionAttr.needsUpdate = true;
			indexAttr.needsUpdate = true;

			console.log(positionAttr.count);
			console.log(indexAttr.count);
		}

		this.renderer.render( this.scene, this.camera );
	}
}