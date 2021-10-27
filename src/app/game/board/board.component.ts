import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Color } from 'src/app/enums/color.enum';
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Board2D, Board3D } from '../game';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements AfterViewInit {
  @Input() board: Board2D | Board3D | undefined;
  @ViewChild('canvas') private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  constructor(){}

  ngAfterViewInit(): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement
    });
    this.setScene();
    this.setCamera();
    this.setRayCaster();
    this.addToScene(this.circle, this.lines);
    this.animate();
  }

  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 500 );
  private renderer!: THREE.WebGLRenderer;
  private readonly circle = this.createCircle(Color.Blue);
  private readonly lines = this.createLine(Color.Blue);
  private controls!: OrbitControls;
  private readonly raycaster = new THREE.Raycaster();
  private readonly mouse = new THREE.Vector2();

  private setScene(){
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    window.addEventListener('mousemove', this.onMouseMove, false );
    window.addEventListener('click', this.onClick, false );
  }

  private setCamera(){
    this.camera.position.set( 0, 0, 100 );
  }

  private setRayCaster(){
    this.raycaster.setFromCamera(this.mouse, this.camera);
  }

  private createCircle(color: Color) : THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial> {
    const geometry = new THREE.TorusGeometry(8, 2, 16, 8);
    const material = new THREE.MeshBasicMaterial( { color } );
    return new THREE.Mesh( geometry, material );
  }

  private createLine(color: Color): THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial> {
    const material = new THREE.LineBasicMaterial( { color } );
    const points = [];
    points.push( new THREE.Vector3( - 10, -10, 0 ) );
    points.push( new THREE.Vector3( -10, 10, 0 ) );
    points.push( new THREE.Vector3( 10, 10, 0 ) );
    points.push( new THREE.Vector3( 10, -10, 0 ) );
    points.push( new THREE.Vector3( -10, -10, 0 ) );
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    return new THREE.Line( geometry, material );
  }

  private addToScene(...items: THREE.Object3D<THREE.Event>[]){
    this.scene.add( ...items )
  }

  private animate() {
    setInterval(()=>{
      this.rotateItems(this.circle);
      this.controls.update();
      const intersects = this.raycaster.intersectObjects( this.scene.children );
      for ( let i = 0; i < intersects.length; i ++ ) {
        // console.log(intersects[i]);
        // intersects[ i ].object.material.color.set( 0xff0000 );
      }
      this.renderer.render( this.scene, this.camera );
    }, 100)
  }

  private rotateItems(...items: THREE.Mesh[]) {
    items.forEach((item)=>{
      item.rotation.x += 0.1;
      item.rotation.y += 0.1;
    })
  }

  private onMouseMove(event: MouseEvent): void {  
    // this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    // this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }

  private onClick(event: MouseEvent): void { 
    console.log(event); 
    // this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    // this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }

}
