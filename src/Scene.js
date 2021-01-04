import React, { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { vertex } from "./shaders/vertex";
import { fragment } from "./shaders/fragment";
import fontfile from './img/font.json'
class Font extends Component {
  constructor(props) {
    super(props);

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.animate = this.animate.bind(this);
  }
  componentDidMount() {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({});

    this.width = this.mount.clientWidth;
    this.height = this.mount.clientHeight;
    this.renderer.setClearColor(0xeeeeee, 1);
    this.renderer.setSize(this.width, this.height);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container = document.getElementById("scene");

    this.mount.appendChild(this.renderer.domElement);

    /* this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      0.001,
      1000
    ); */

    var frustumSize = 3;
    this.aspect = window.innerWidth / window.innerHeight;

    this.camera = new THREE.OrthographicCamera(
      (frustumSize * this.aspect) / -2,
      (frustumSize * this.aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      -1000
    );

    this.camera.position.set(0, 0, 2);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.mouse = new THREE.Vector2(0, 0);
    this.mouseTarget = new THREE.Vector2(0, 0);
    this.time = 0;
    this.mouseEvents();
    this.setupResize();
    this.addObjects();
    this.animate();

    this.resize();
this.addText()
  }

  addText() {
    let that = this;
    let loader = new THREE.FontLoader();

    loader.load( "https://threejs.org/examples/fonts/droid/droid_sans_bold.typeface.json", function ( font ) {
    
      const geometry = new THREE.TextGeometry( 'Boo!', {
        font: font,
        size: 0.9,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: false,
       /*  bevelThickn ess: 10,
        bevelSize: 8,
        bevelOffset: 0,
        bevelSegments: 5 */
      } );
      geometry.translate(-1.5,-0.5,-0.2)
      that.textmesh = new THREE.Mesh(geometry, that.material);

      that.textmesh.position.z = 0.5
      //textmesh.position.x = -2
      that.scene.add(that.textmesh)


    } );

  
  }
 
  mouseEvents() {
    document.addEventListener("mousemove", (e) => {
      //console.log(e)

      this.mouse.x = 2 * (e.pageX / this.width - 0.5);
      this.mouse.y = 2 * (e.pageY / this.height - 0.5);
    });
  }
  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        lineWidth: { type: "f", value: 0 },
        rotation: { type: "f", value: 0 },
        repeat: { type: "f", value: 0 },
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1),
        },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });

   /*  this.geometry = new THREE.PlaneGeometry(
      3 * this.aspect - 0.2 * this.aspect,
      2.8,
      1,
      1
    ); */

    this.geometry = new THREE.PlaneGeometry(
      10,
      10,
      1,
      1
    );

    this.plane = new THREE.Mesh(this.geometry, this.material);

    this.scene.add(this.plane);

    this.box = new THREE.Mesh(
      new THREE.BoxBufferGeometry(1, 1, 0.1).translate(0, 0, -0.5),
      this.material
    );

   // this.scene.add(this.box);
    this.box.position.z = 1.2;
  }

  setupResize = () => {
    window.addEventListener("resize", this.resize);
  };

  resize = () => {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    console.log("resize");

    this.imageAspect = 853 / 1280;

    let a1;
    let a2;

    if (this.height / this.width > this.imageAspect) {
      a1 = (this.width / this.height) * this.imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = this.height / this.width / this.imageAspect;
    }

    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = 1;
    this.material.uniforms.resolution.value.w = 1;
    /* 
    const dist = this.camera.position.z;
    const height = 1;
    this.camera.fov = 2* (180/Math.PI) * Math.atan(height/(2*dist));

    if (this.width / this.height > 1) {
      this.plane.scale.x = this.camera.aspect;
    } else {
      this.plane.scale.y = 1 / this.camera.aspect;
    }  */

    this.camera.updateProjectionMatrix();
    console.log(this.camera);
  };

  componentWillUnmount() {
    this.stop();
    this.mount.removeChild(this.renderer.domElement);
  }

  start() {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  }

  stop() {
    cancelAnimationFrame(this.frameId);
  }

  animate() {
    this.time += 0.05;
    let rotation = Math.PI / 4;
    let lineWidth = 0.4;
    let repeat = 10;

    this.mouseTarget.x -= 0.1 * (this.mouseTarget.x - this.mouse.x)
    this.mouseTarget.y -= 0.1 * (this.mouseTarget.y - this.mouse.y)

    if (this.textmesh) {
      this.textmesh.rotation.y = this.mouseTarget.x / 2;
      this.textmesh.rotation.x = this.mouseTarget.y / 2;
    }

    this.material.uniforms.time.value = this.time;
    this.material.uniforms.rotation.value = rotation;
    this.material.uniforms.lineWidth.value = lineWidth;
    this.material.uniforms.repeat.value = repeat;

    this.frameId = requestAnimationFrame(this.animate);

    this.renderScene();
  }

  renderScene() {
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <div
        id="scene"
        ref={(mount) => {
          this.mount = mount;
        }}
      />
    );
  }
}

export default Font;
