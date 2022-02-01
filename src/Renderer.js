import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OBJLoader2 } from 'wwobjloader2';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export const transformDict = {
	'position': {
		'x': 0
		, 'y': 0.007
		, 'z': -0.875
	},
	'scale': 1.479
}

export class Renderer
{
	canvas;
	scene;
	camera;
	renderer;
	faceModelMesh;
	glassesMesh;
	
	controls;

	glassesMesh_defaultPosition = new THREE.Vector3();
	glassesMesh_defaultQuarternion = new THREE.Quaternion();
	glassesMesh_defaultScale = new THREE.Vector3();

	constructor( canvas )
	{

		this.canvas = canvas;

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( 66, this.canvas.width / this.canvas.height, 0.1, 2000 );
		
		this.camera.position.set( 0, 0, 0 );
		this.camera.lookAt( 0, 0, -1 );

		// 	For OrbitControl view
		// this.camera.position.set( 5, 5, 5 );
		// this.camera.lookAt( 0, 0, 0 );


		this.renderer = new THREE.WebGLRenderer( { canvas: this.canvas } );
		this.renderer.setSize( this.canvas.width, this.canvas.height );

		// 	Scene
		const axesHelper = new THREE.AxesHelper( 3 );
		this.scene.add( axesHelper );


		// 	Instantiate the OBJLoader2
		const objLoader = new OBJLoader2();
		objLoader.setUseIndices(true);

		const thisObject = this;
		function onOBJLoaded( object )
		{
			// 	Add to scene
			thisObject.faceModelMesh = object.children[0];
			thisObject.scene.add( thisObject.faceModelMesh );
			
			const greenWireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true, visible:false } );
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

		// this.controls = new OrbitControls( this.camera, this.canvas );
		// this.controls.update();


		// Instantiate a loader
		const gltfLoader = new GLTFLoader();

		// Load a glTF resource
		gltfLoader.load(
			// resource URL
			'glasses.gltf',
			// called when the resource is loaded
			function ( gltf ) {

				// 	Get the glasses Object3D
				thisObject.glassesMesh = gltf.scene.children[0];

				// 	Copy default glasses' transform
				thisObject.glassesMesh_defaultPosition.copy( thisObject.glassesMesh.position );
				thisObject.glassesMesh_defaultQuarternion.copy( thisObject.glassesMesh.quaternion );
				thisObject.glassesMesh_defaultScale.copy( thisObject.glassesMesh.scale );
				
				// 	Add to the scene
				// thisObject.scene.add( thisObject.glassesMesh );
				thisObject.faceModelMesh.add( thisObject.glassesMesh );

				// 	Offset glasses' transform with default offset
				thisObject.updateGlassesOffsetPosition( transformDict );
				thisObject.updateGlassesOffsetScale( transformDict );
			},
			// called while loading is progressing
			function ( xhr ) {

				console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

			},
			// called when loading has errors
			function ( error ) {

				console.log( 'An error happened' );

			}
		);

		// 	Add scene lights
		const dirLight = new THREE.DirectionalLight( 0xF4E99B, 1 );
		dirLight.position.set( 1, 1, 1 );
		this.scene.add( dirLight );	

		const dirLight2 = new THREE.DirectionalLight( 0xFFFFFF, 0.5 );
		dirLight2.position.set( -1, 1, 0 );
		this.scene.add( dirLight2 );

		const dirLight3 = new THREE.DirectionalLight( 0xFFFFFF, 0.3 );
		dirLight3.position.set( 0, -1, 0 );
		this.scene.add( dirLight3 );	

		const ambientLight = new THREE.AmbientLight( 0xFFFFFF, 0.2 );
		this.scene.add( ambientLight );
	}

	render( faceMeshResult )
	{
		// this.controls.update();

		const texture = new THREE.CanvasTexture( faceMeshResult.image );
		this.scene.background = texture;

		if( faceMeshResult.multiFaceGeometry ){

			const faceGeometry = faceMeshResult.multiFaceGeometry[0];

			if( faceGeometry === undefined )
				return;

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
			}

			// 	Update mesh indicies
			for( let i = 0; i < 898; i++ )
			{
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


			// 	Get head transformation matrix. The result is in row-major
			const matrixArray = matrixDataToMatrix( faceGeometry.getPoseTransformMatrix() ).flat();
			const matrix = new THREE.Matrix4().fromArray( matrixArray ).transpose();

			// 	Copy the transformation matrix
			this.faceModelMesh.matrix.copy( matrix );
			this.faceModelMesh.matrixAutoUpdate = false;

		}

		this.renderer.render( this.scene, this.camera );

	}

	updateGlassesOffsetPosition( transformDict )
	{
		const newPosition = new THREE.Vector3().addVectors( this.glassesMesh_defaultPosition, new THREE.Vector3( transformDict.position.x, transformDict.position.y, transformDict.position.z ) );
		this.glassesMesh.position.copy( newPosition );
	}

	updateGlassesOffsetScale( transformDict )
	{
		const newScale = new THREE.Vector3().copy( this.glassesMesh_defaultScale ).multiplyScalar( transformDict.scale );
		this.glassesMesh.scale.copy( newScale );

	}
}