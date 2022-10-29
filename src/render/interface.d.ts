import type Dispatch from "../dispatch/dispatch"

interface RenderOptions {
  alpha?: number,
  tint?: number,
  x?: number,
  y?: number,
  w?: number,
  h?: number,
  entity: number,
  imgKey?: string,
}

interface Renderer {
  init(): void
  saveImage(key: string, src: HTMLImageElement): Promise<void>
  registerEntity(n: number, imgKey: string): Promise<void>
  deleteEntity(n: number): void
  render(options: RenderOptions): void
  update(): void
  clear(): void
  resize(width: number, height: number): void
  lastMousePosition(): { x: number, y: number }
  deregisterAll(): void
  addDispatch(dispatch: Dispatch): void
}

export { Renderer, RenderOptions }
