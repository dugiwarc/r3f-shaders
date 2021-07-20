import * as THREE from "three"
import {useRef, Suspense} from "react"
import { Canvas, extend, useFrame, useLoader } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import glsl from "babel-plugin-glsl/macro";

import "./App.css";

const WaveShaderMaterial = shaderMaterial(
	// Uniform
	{
    uTime: 0,
    uTexture: new THREE.Texture(),
    uColor: new THREE.Color(0.0, 0.0, 0.0)
  },
	// Vertex
	glsl`
    precision mediump float;

    varying vec2 vUv;

    varying float vWave;

    uniform float uTime;

    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d);

    void main() {
      vUv = uv;

      vec3 pos = position;
      float noiseFreq = 0.5;
      float noiseAmp = 0.25;
      vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y, pos.z);
      pos.z += snoise3(noisePos) * noiseAmp;
      vWave = pos.z;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
	// Fragment
	glsl`
    precision mediump float;

    uniform vec3 uColor;
    uniform sampler2D uTexture;
    uniform float uTime;

    // gradient mods
    varying vec2 vUv;
    varying float vWave;

    void main() {
      float wave = vWave * 0.1;
      vec3 texture = texture2D(uTexture, vUv + wave).rgb;
      gl_FragColor = vec4(texture * uColor, 1.0);
      // gl_FragColor = vec4(sin(vUv.y + uTime) * uColor, 1.0);
    }
  `,
);

// use a shader material in jsx
// import extend to use this material as a jsx component
extend({ WaveShaderMaterial });

const Wave = () => {
  const ref = useRef();
  useFrame(({ clock }) => (ref.current.uTime = clock.getElapsedTime()));

  const [image] = useLoader(THREE.TextureLoader, ['logo512.png'])

  return (
			<mesh>
				<planeBufferGeometry args={[0.6, 0.6, 16, 16]} />
				{/* <meshStandardMaterial color="lightblue" /> */}
				<waveShaderMaterial uColor={"hotpink"} ref={ref} uTexture={image}/>
			</mesh>
  )
}

const Scene = () => {
	return (
		<Canvas camera={{fov:10, position: [0,0,5]}}>
      <Suspense fallback={null}>
        <Wave/>
      </Suspense>
		</Canvas>
	);
};

const App = () => {
	return <Scene />;
};

export default App;
