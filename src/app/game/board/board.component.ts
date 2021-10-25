import { Component, Input, OnInit } from '@angular/core';
import { Color } from 'src/app/enums/color.enum';
import * as THREE from "three";
import { Board2D, Board3D } from '../game';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  @Input() board: Board2D | Board3D | undefined;

  ngOnInit(): void {
    this.setScene();
    this.setCamera();
    this.addToScene(this.circle, this.line);
    this.animate();
  }

  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
  // private readonly camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  private readonly renderer = new THREE.WebGLRenderer();
  private readonly circle = this.createCircle(Color.Blue);
  private readonly line = this.createLine(Color.Blue);

  private setScene(){
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );
  }

  private setCamera(){
    // this.camera.position.set( 0, 0, 5 );
    // this.camera.lookAt( 0, 0, 0 );
    this.camera.position.set( 0, 0, 100 );
    this.camera.lookAt( 0, 0, 0 );
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
      this.circle.rotation.x += 0.1;
      this.circle.rotation.y += 0.1;
      this.renderer.render( this.scene, this.camera );
    }, 100)
  }

}
