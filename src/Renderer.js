import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OBJLoader2 } from 'wwobjloader2';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter';

import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

import 'file-saver';

export const DEFAULT_FOV = 66;

export const GlassesTransformDict = {
	'position': {
		'x': 0
		, 'y': -0.691
		, 'z': -0.875
	},
	'scale': 1.479
}

export const RenderOptions = {
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
	
	orbitControls;
	isOrbitalView = false;

	renderOptions = RenderOptions;

	glassesMesh_defaultPosition = new THREE.Vector3();
	glassesMesh_defaultQuarternion = new THREE.Quaternion();
	glassesMesh_defaultScale = new THREE.Vector3();

	// 
	// 	CONSTRUCTOR
	// 
	constructor( canvas )
	{
		this.canvas = canvas;

		// 	Create a THREE Scene and WebGL Renderer

		
		// 	Create a Perspective Camera
		
		
		// 	Scene AxesHelper


		// 	Orbital View Controller


		// Instantiate a GLTFLoader
		const gltfLoader = new GLTFLoader();

		const thisObject = this;
		// 	Load a base mesh
		gltfLoader.load(

			// resource URL
			'face_base.gltf',

			// called when the resource is loaded
			( gltf )=>{
				// 	Get the mesh and add to mesh scene

				// 	Create a new textured material with transparent: true

				// 	Optional: Set BufferAttribute(s) usage to THREE.StreamDrawUsage for increased performance.
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

		// Load a Glasses Model
		gltfLoader.load(
			// resource URL
			'glasses.gltf',
			// called when the resource is loaded
			( gltf )=>{

				// 	Get the glasses Object3D


				// 	Copy default glasses' transform for future transform manipulation

				
				// 	Add to the scene


				// 	Offset glasses' transform with default offset

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
		// 		Main directional light


		// 		Support lights


		// 		Ambientl ight

		// 	Saving Mesh to file. For Debugging
		// setTimeout( ()=>{ this.exportToOBJ() }, 5000);
		// setTimeout( ()=>{ this.exportToJSON() }, 5000);
	}

	// 
	// 	PUBLIC MEMBER FUNCTIONS
	// 
	render( faceMeshResult )
	{
		// 	Retrieve the background texture from FaceMesh result
		// 	and create a THREE.CanvasTexture
		

		// 	Get FaceGeometry result from the FaceMesh result
		// 	to update the this.faceModelMesh vertex buffer, normals, and transformation matrix


		// 	Update scene according to rendering option
		
		
		// 	Finally render the scene

	}

	updateSceneRenderOption()
	{

	}

	updateGlassesOffsetPosition( transformDict )
	{
		// 	newPosition = defaultPosition + offsetPosition
	}

	updateGlassesOffsetScale( transformDict )
	{
		// 	newScale = defaultScale * offsetScale
	}

	// 
	// 	UTILITY FUNCTIONS
	// 
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