import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Color } from 'src/app/enums/color.enum';
import * as THREE from "three";
import { BoxGeometry, Line, Material, WireframeGeometry } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Board2D, Board3D, boardFactory, Players } from '../game';

interface Point {
  x: number,
  y: number,
  z: number
}

export type Shape = Line<WireframeGeometry<BoxGeometry>, Material> | THREE.Mesh<THREE.TorusGeometry | THREE.SphereGeometry, THREE.MeshBasicMaterial>

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements AfterViewInit {
  @Input() board: Board2D | Board3D = boardFactory(3, 3);
  @Input() player = Players.P1;
  @Input() playerTurn = Players.P1;
  @Output() move = new EventEmitter<[number, number]|[number, number, number]>()
  @ViewChild('canvas') private readonly canvasRef!: ElementRef<HTMLCanvasElement>;
  private readonly GRID_SIZE = 10;
  private readonly boardSize = this.getBoardSize(this.board);
  private readonly boardDimension = this.getBoardDimension(this.board) as 2 | 3;
  private readonly boardMap = new Map<Shape, [number, number, number]>();
  private readonly reverseMap = new Map<[number, number, number], Shape>();

  getBoardSize(board: any[]): number {
    return board.length;
  }

  getBoardDimension(board: any[], dimension = 1): number {
    if(typeof board[0] === 'number'){
      return dimension;
    }
    dimension ++;
    return this.getBoardDimension(board[0], dimension)
  }

  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(5 * this.GRID_SIZE, window.innerWidth / window.innerHeight, this.GRID_SIZE * 0.1, 50 * this.GRID_SIZE );
  private renderer!: THREE.WebGLRenderer;
  private readonly lines = this.createLines(Color.Blue, this.boardDimension, this.boardSize);
  private controls!: OrbitControls;
  private readonly raycaster = new THREE.Raycaster();
  private readonly mouse = new THREE.Vector2();
  private lastHoveredCube: Line<WireframeGeometry<BoxGeometry>, Material> | undefined;

  ngAfterViewInit(): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement
    });
    this.setScene();
    this.setCamera();
    this.addToScene(...this.lines);
    this.addShapes(this.board, this.boardDimension);
    this.animate();
  }

  private setScene(){
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    window.addEventListener('click', this.onClick);
    window.addEventListener('pointermove', this.onMouseMove);
  }

  private setCamera(){
    this.camera.position.set(0, 0, 10 * this.GRID_SIZE );
  }

  private setRayCaster(){
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, false);
    const object = intersects[0]?.object as Line<WireframeGeometry<BoxGeometry>, Material>;
    if(object && object.type === 'cube'){
      if(this.lastHoveredCube?.material && object !== this.lastHoveredCube){
        (this.lastHoveredCube.material as any).color.set( Color.Green );
      }
      this.lastHoveredCube = object as Line<WireframeGeometry<BoxGeometry>, Material>;
      (this.lastHoveredCube.material as any).color.set( Color.Red );
      return
    }
    if(this.lastHoveredCube){
      (this.lastHoveredCube.material as any).color.set( Color.Green );
      this.lastHoveredCube = undefined;
    }
  }

  private createSphere(color: Color) : THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> {
    const geometry = new THREE.SphereGeometry(this.GRID_SIZE / 4);
    const material = new THREE.MeshBasicMaterial( { color } );
    return new THREE.Mesh( geometry, material );
  }

  private createTorus(color: Color) : THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial> {
    const geometry = new THREE.TorusGeometry(this.GRID_SIZE / 4, 1, 2, 100);
    const material = new THREE.MeshBasicMaterial( { color } );
    return new THREE.Mesh( geometry, material );
  }

  private createCube(color: Color, size = this.GRID_SIZE / 2): Line<WireframeGeometry<BoxGeometry>, Material>{
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial( { color } );
    const wireframe = new THREE.WireframeGeometry( geometry );
    const cube = new THREE.LineSegments( wireframe, material ) as Line<WireframeGeometry<BoxGeometry>, Material> ;
    cube.material.opacity = 0.25;
    cube.type = 'cube';

    return cube;
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
      const startY = this.transformPoint({
        x: i,
        y: 0,
        z,
      }, size)
      const endY = this.transformPoint({
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

  private addShapes(board: Board2D| Board3D, dimension: number){
    if(dimension === 2){
      for(let x=0; x < board.length; x++){
        for(let y=0; y < board.length; y++){
          const cube = this.createCube(Color.Green);
          this.setShapePosition(cube, board.length, x, y);
          this.addToScene(cube);
          this.boardMap.set(cube, [x,y,0]);
          this.reverseMap.set([x,y,0], cube);
        }
      }
    } else {
      for(let x=0; x < board.length; x++){
        for(let y=0; y < board.length; y++){
          for(let z=0; z < board.length; z++){
            const cube = this.createCube(Color.Green);
            this.setShapePosition(cube, board.length, x, y,z);
            this.addToScene(cube);
            this.boardMap.set(cube, [x,y,z]);
            this.reverseMap.set([x,y,z], cube);
          }
        }
      }
    }
  }

  private setShapePosition(shape: Shape, boardLength: number, x: number, y: number, z = 0){
      shape.position.x = this.transformCoordinateForShape(x, boardLength),
      shape.position.y = this.transformCoordinateForShape(y, boardLength),
      shape.position.z = this.transformCoordinateForShape(z, boardLength)
  }

  private transformCoordinateForShape(coordinate: number, size: number){
    return coordinate * this.GRID_SIZE - ((size - 1) / 2 * this.GRID_SIZE);
  }

  private animate() {
    setInterval(()=>{
      this.controls.update();
      this.setRayCaster();
      this.renderer.render( this.scene, this.camera );
    }, 100)
  }

  private onClick = (event: MouseEvent) => {  
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    this.selectItem();
  }

  selectItem(){
    if(this.lastHoveredCube){
      const cubeIndex = this.boardMap.get(this.lastHoveredCube);
      if(cubeIndex){
        const [x,y,z] = cubeIndex;
        console.log(x,y,z);
        if(this.boardDimension === 2){
          (this.board as Board2D)[x][y] = this.playerTurn;
          this.move.emit([x,y]);
        } else {
          (this.board as Board3D)[x][y][z] = this.playerTurn;
          this.move.emit([x,y,z]);
        }
        this.scene.remove(this.lastHoveredCube);
        this.lastHoveredCube = undefined;
        this.addPlayersChip(x, y, z);
        this.changePlayerTurn();
      }
    }
  }

  private addPlayersChip(x: number, y:number, z=0){
    if(this.playerTurn === Players.P2){
      this.addSphere(x,y,z);
    } else {
      this.addTorus(x,y,z);
    }
  }

  addSphere(x: number, y: number, z = 0){
    const sphere = this.createSphere(Color.Blue);
    this.setShapePosition(sphere, this.board.length, x, y,z);
    this.addToScene(sphere);
  }

  addTorus(x: number, y: number, z = 0){
    const torus = this.createTorus(Color.Pink);
    this.setShapePosition(torus, this.board.length, x, y,z);
    this.addToScene(torus);
  }

  private onMouseMove = (event: MouseEvent) => {
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }

  private changePlayerTurn(){
    console.log(this.board);
    this.playerTurn = this.playerTurn === Players.P1 ? Players.P2 : Players.P1;
  }

}
