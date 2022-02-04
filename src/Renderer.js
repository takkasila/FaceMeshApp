import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OBJLoader2 } from 'wwobjloader2';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter';

import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

import 'file-saver';

export const GlassesTransformDict = {
	'position': {
		'x': 0
		, 'y': -0.691
		, 'z': -0.875
	},
	'scale': 1.479
}

export const RenderOptions = {
	'isOrbitalView': false,
	'isGlasses': true,
	'isFaceTexture': true
};

export class Renderer
{
	// 
	// 	PUBLIC MEMBERS
	// 
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

	faceBaseMeshGLTF;

	renderOptions;

	constructor( canvas )
	{
		this.renderOptions = RenderOptions;

		this.canvas = canvas;

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( 66, this.canvas.width / this.canvas.height, 0.1, 2000 );
		
		this.camera.position.set( 0, 0, 0 );
		this.camera.lookAt( 0, 0, -1 );

		// 	For OrbitControl view
		// this.camera.position.set( 5, 5, 5 );
		// this.camera.lookAt( 0, 0, 0 );
		
		// this.controls = new OrbitControls( this.camera, this.canvas );
		// this.controls.update();

		this.renderer = new THREE.WebGLRenderer( { canvas: this.canvas, antialias : true } );
		this.renderer.setSize( this.canvas.width, this.canvas.height );

		// 	Scene
		const axesHelper = new THREE.AxesHelper( 3 );
		this.scene.add( axesHelper );


		// 	Instantiate the OBJLoader2
		const objLoader = new OBJLoader2();
		objLoader.setUseIndices(true);

		// 	Load a custom face texture
		this.faceTexture = new THREE.TextureLoader().load( 'face_effect_texture_1.png' );
		this.faceTexture.flipY = false;

		// Instantiate a GLTFLoader
		const gltfLoader = new GLTFLoader();

		// 	Call back for setting up the base FaceMesh (this.faceModelMesh)
		const thisObject = this;
		function onFaceBaseLoaded( gltf )
		{
			// 	Add to scene
			thisObject.faceModelMesh = gltf.scene.children[0];

			thisObject.scene.add( thisObject.faceModelMesh );

			const greenWireframeMaterial = new THREE.MeshBasicMaterial( { 
				color: 0xffffff,
				map: thisObject.faceTexture,
				transparent: true
			} );
			thisObject.faceModelMesh.material = greenWireframeMaterial;

			// 	Set BufferAttribute usage to THREE.StreamDrawUsage for increased performance.
			const positionAttr = thisObject.faceModelMesh.geometry.getAttribute( 'position' );
			positionAttr.usage = THREE.StreamDrawUsage;

			const indexAttr = thisObject.faceModelMesh.geometry.getIndex();
			indexAttr.usage = THREE.StreamDrawUsage;
		}
		
		// 	Load a base mesh
		gltfLoader.load(
			// resource URL
			'face_base.gltf',
			// called when the resource is loaded
			onFaceBaseLoaded,
			// called while loading is progressing
			( xhr )=>{
				console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
			},
			// called when loading has errors
			( error )=>{
				console.log( error );
			}
		);

		// Load a Glasses Model
		gltfLoader.load(
			// resource URL
			'glasses.gltf',
			// called when the resource is loaded
			( gltf )=>{

				// 	Get the glasses Object3D
				thisObject.glassesMesh = gltf.scene.children[0];

				// 	Copy default glasses' transform
				thisObject.glassesMesh_defaultPosition.copy( thisObject.glassesMesh.position );
				thisObject.glassesMesh_defaultQuarternion.copy( thisObject.glassesMesh.quaternion );
				thisObject.glassesMesh_defaultScale.copy( thisObject.glassesMesh.scale );
				
				// 	Add to the scene
				thisObject.faceModelMesh.add( thisObject.glassesMesh );

				// 	Offset glasses' transform with default offset
				thisObject.updateGlassesOffsetPosition( GlassesTransformDict );
				thisObject.updateGlassesOffsetScale( GlassesTransformDict );
			},
			// called while loading is progressing
			( xhr )=>{
				console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
			},
			// called when loading has errors
			( error )=>{
				console.log( error );
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


		// setTimeout( ()=>{ this.exportToOBJ() }, 5000);
		// setTimeout( ()=>{ this.exportToJSON() }, 5000);
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
			const uvAttr = this.faceModelMesh.geometry.getAttribute('uv');
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


			// 	Set buffer update flag
			positionAttr.needsUpdate = true;

			// 	Needs to update vertex normals since our vertex is updated
			this.faceModelMesh.geometry.computeVertexNormals();

			// 	Get head transformation matrix. The result is in row-major
			const matrixArray = matrixDataToMatrix( faceGeometry.getPoseTransformMatrix() ).flat();
			const matrix = new THREE.Matrix4().fromArray( matrixArray ).transpose();

			// 	Copy the transformation matrix
			this.faceModelMesh.matrix.copy( matrix );
			this.faceModelMesh.matrixAutoUpdate = false;
		}

		// 	Update scene according to rendering option
		this.updateSceneRenderOption();
		
		// 	Finally render the scene
		this.renderer.render( this.scene, this.camera );
	}

	updateSceneRenderOption()
	{
		// 	TODO:
		if( this.renderOptions.isOrbitalView )
		{

		}
		else
		{
			
		}
		
		if( this.glassesMesh !== undefined )
		{
			this.glassesMesh.visible = this.renderOptions.isGlasses;
		}

		if( this.faceModelMesh !== undefined )
		{
			this.faceModelMesh.material.visible = this.renderOptions.isFaceTexture;
		}
	}

	updateGlassesOffsetPosition( transformDict )
	{
		// 	newPosition = defaultPosition + offsetPosition
		const newPosition = new THREE.Vector3().addVectors( this.glassesMesh_defaultPosition, new THREE.Vector3( transformDict.position.x, transformDict.position.y, transformDict.position.z ) );
		this.glassesMesh.position.copy( newPosition );
	}

	updateGlassesOffsetScale( transformDict )
	{
		// 	newScale = defaultScale * offsetScale
		const newScale = new THREE.Vector3().copy( this.glassesMesh_defaultScale ).multiplyScalar( transformDict.scale );
		this.glassesMesh.scale.copy( newScale );

	}

	exportToOBJ()
	{
		// Instantiate a exporter
		const exporter = new OBJExporter();
		// Parse the faceModelMesh
		const res = exporter.parse( this.faceModelMesh );

		// Save the file
		const blob = new Blob( [res], { type: "text/plain;charset=utf-8" } );
		saveAs(blob, "face_save.obj");
	}

	exportToJSON()
	{
		// Instantiate a exporter
		const exporter = new GLTFExporter();

		// Parse the input and generate the glTF output
		exporter.parse(
			this.faceModelMesh,
			// called when the gltf has been generated
			( gltf )=>{

				// Convert JSON to Blob
				const blob = new Blob( [[JSON.stringify(gltf)]], { type: "text/plain;charset=utf-8" } );
				// Save the file
				saveAs(blob, "face_save.gltf");

			},
			// called when there is an error in the generation
			( error )=>{
				console.log( 'An error happened' );
			},
			// options
			{}
		);
	}
}