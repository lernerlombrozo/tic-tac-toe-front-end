import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Color } from 'src/app/enums/color.enum';
import * as THREE from "three";
import { BoxGeometry, Line, Material, WireframeGeometry } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Board2D, Board3D, boardFactory, BoardMap1D, BoardMap2D, BoardMap3D, MapTypes } from '../game';

interface Point {
  x: number,
  y: number,
  z: number
}

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements AfterViewInit {
  @Input() board: Board2D | Board3D = boardFactory(3, 3);
  @ViewChild('canvas') private readonly canvasRef!: ElementRef<HTMLCanvasElement>;
  private readonly GRID_SIZE = 10;
  private readonly boardSize = this.getBoardSize(this.board);
  private readonly boardDimension = this.getBoardDimension(this.board) as 2 | 3;
  private readonly boardMap = this.boardMapFactory(this.boardDimension, this.boardSize);

  getBoardSize(board: any[]): number {
    return board.length;
  }

  getBoardDimension(board: any[], dimension = 2): number {
    if(typeof board[0] === 'number'){
      return dimension;
    }
    dimension ++;
    return this.getBoardDimension(board[0],dimension)
  }

  ngAfterViewInit(): void {
    console.log(this.boardSize)
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement
    });
    this.setScene();
    this.setCamera();
    this.setRayCaster();
    this.addToScene(...this.lines);
    this.addShapes(this.boardMap, this.boardDimension);
    this.animate();
  }

  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(5 * this.GRID_SIZE, window.innerWidth / window.innerHeight, this.GRID_SIZE * 0.1, 50 * this.GRID_SIZE );
  private renderer!: THREE.WebGLRenderer;
  private readonly circle = this.createCircle(Color.Blue);
  private readonly lines = this.createLines(Color.Blue, this.boardDimension, this.boardSize);
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
    this.camera.position.set(0, 0, 10 * this.GRID_SIZE );
  }

  private setRayCaster(){
    this.raycaster.setFromCamera(this.mouse, this.camera);
  }

  private createCircle(color: Color) : THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial> {
    const geometry = new THREE.TorusGeometry(this.GRID_SIZE, 2, 16, 100);
    const material = new THREE.MeshBasicMaterial( { color } );
    return new THREE.Mesh( geometry, material );
  }

  private createCube(color: Color, size = this.GRID_SIZE / 2): Line<WireframeGeometry<BoxGeometry>, Material>{
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial( { color } );
    const wireframe = new THREE.WireframeGeometry( geometry );

    const line = new THREE.LineSegments( wireframe, material ) as Line<WireframeGeometry<BoxGeometry>, Material> ;
    // line.material.depthTest = false;
    line.material.opacity = 0.25;
    // line.material.transparent = true;
    return line;
  }

  private createLines(color: Color, dimension: number, size: number): THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>[] {
    if(dimension === 2){
      return this.createVertical2DBoard(color, size);
    }
    return this.create3DBoard(color, size);
  }

  private create3DBoard(color:Color, size:number): THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>[] {
    const lines : THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>[] = [];
    for(let i = 1; i < size ; i++) {
      lines.push(...this.createVertical2DBoard(color, size, i));
      lines.push(...this.createHorizontal2DBoard(color, size, i));
    }
    return lines;
  }

  private createVertical2DBoard(color:Color, size:number, z = 0): THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>[] {
    const lines : THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>[] = [];
    for(let i = 1; i < size ; i++) {
      const start = this.transformPoint({
        x: 0,
        y: i,
        z,
      }, size)
      const end = this.transformPoint({
        x: size,
        y: i,
        z,
      }, size)
      console.log(start, end)
      const startY = this.transformPoint({
        x: i,
        y: 0,
        z,
      }, size)
      const endY= this.transformPoint({
        x: i,
        y: size,
        z,
      }, size)
      lines.push(this.createLine(color, start, end))
      lines.push(this.createLine(color, startY, endY))
    }
    return lines;
  }

  private createHorizontal2DBoard(color:Color, size:number, y = 0): THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>[] {
    const lines : THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>[] = [];
    for(let i = 1; i < size ; i++) {
      const start = this.transformPoint({
        x: 0,
        y,
        z: i,
      }, size);
      const end = this.transformPoint({
        x: size,
        y,
        z:i,
      }, size)
      const startY = this.transformPoint({
        x: i,
        y,
        z: 0,
      }, size)
      const endY = this.transformPoint({
        x: i,
        y,
        z: size,
      }, size)
      lines.push(this.createLine(color, start, end))
      lines.push(this.createLine(color, startY, endY))
    }
    return lines;
  }

  private transformPoint(point: Point, size: number):Point {
    const {x, y, z} = point;
    return {
      x: this.transformCoordinateForLine(x, size),
      y: this.transformCoordinateForLine(y, size),
      z: this.transformCoordinateForLine(z, size),
    }
  }

  private transformCoordinateForLine(coordinate: number, size: number){
    return (coordinate - size / 2) * this.GRID_SIZE;
  }

  private createLine(color: Color, start: Point, end: Point): THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial> {
    const material = new THREE.LineBasicMaterial( { color } );
    const points = [];
    points.push( new THREE.Vector3( start.x, start.y, start.z ) );
    points.push( new THREE.Vector3( end.x, end.y, end.z ) );
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    return new THREE.Line( geometry, material );
  }

  private addToScene(...items: THREE.Object3D<THREE.Event>[]){
    this.scene.add(...items )
  }

  private addShapes(boardMap: BoardMap2D| BoardMap3D, dimension: number){
    console.log(boardMap, dimension);
    if(dimension === 2){
      for(let x=0; x < boardMap.length; x++){
        for(let y=0; y < boardMap.length; y++){
          const cubeHash = boardMap[x][y] as MapTypes;
          cubeHash.position.x = this.transformCoordinateForShape(x, boardMap.length);
          cubeHash.position.y = this.transformCoordinateForShape(y, boardMap.length);
          this.addToScene(cubeHash);
        }
      }
    } else {
      for(let x=0; x < boardMap.length; x++){
        for(let y=0; y < boardMap.length; y++){
          for(let z=0; z < boardMap.length; z++){
            const cubeHash = (boardMap[x][y] as BoardMap1D)[z];
            cubeHash.position.x = this.transformCoordinateForShape(x, boardMap.length);
            cubeHash.position.y = this.transformCoordinateForShape(y, boardMap.length);
            cubeHash.position.z = this.transformCoordinateForShape(z, boardMap.length);
            this.addToScene(cubeHash);
          }
        }
      }
    }
  }

  private transformCoordinateForShape(coordinate: number, size: number){
    return coordinate * this.GRID_SIZE - ((size - 1) / 2 * this.GRID_SIZE);
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

  private boardMapFactory(dimension: 2 | 3, size = 3) {
    const row: BoardMap1D = [];
    for (let x = 0; x < size; x++){
      const cube = this.createCube(Color.Green);
      row.push(cube);
    }
    const board2D: BoardMap2D = [];
    for(let y = 0; y < size; y++){
      board2D.push(row);
    }
    if(dimension === 2){
      return board2D;
    }
    const board3D: BoardMap3D = [];
    for(let z = 0; z < size; z++){
      board3D.push(board2D);
    } 
    return board3D;
  }

}
