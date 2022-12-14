import type ResourcePath from '../../df/resource/path/path'
import { ResourcePathFromGamePath } from '../../df/resource/path/path-from'
import isObject from '../../utility/is-object'

import Panel from './panel/panel'
import Texture from './texture/texture'

class EditorMap {
  private readonly name: string = ''

  private readonly author: string = ''

  private readonly description: string = ''

  private readonly music: string = 'Standart.wad:D2DMUS\\ПРОСТОТА'

  private readonly sky: ResourcePath = ResourcePathFromGamePath(
    'Standart.wad:D2DSKY\\RSKY1'
  )

  private readonly size = { width: 0, height: 0 }

  private readonly bindings: Record<string, Texture> = {}

  private readonly panels: Panel[] = []

  private readonly textures: Texture[] = []

  public constructor(
    private readonly src: Readonly<Record<string, unknown>>,
    private readonly filename: string
  ) {
    const thisIsForLater: Record<string, unknown>[] = []
    for (const [k, v] of Object.entries(src)) {
      if (typeof v === 'string') {
        if (k === 'name') this.name = v
        else if (k === 'author') this.author = v
        else if (k === 'description') this.description = v
        else if (k === 'music') this.music = v
        else if (k === 'sky') this.sky = ResourcePathFromGamePath(v)
      } else if (
        k === 'size' &&
        Array.isArray(v) &&
        v.length === 2 &&
        typeof v[0] === 'number' &&
        typeof v[1] === 'number'
      ) {
        this.size.width = v[0]
        this.size.height = v[1]
      } else if (isObject(v)) {
        if (v._type !== 'undefined') {
          if (v._type === 'texture') {
            if (v.path === undefined || typeof v.path !== 'string')
              throw new Error('Invalid texture in parsed map!')
            const path = ResourcePathFromGamePath(v.path, this.filename)
            const animated = Boolean(v.animated ?? false)
            const texture = new Texture(path, animated)
            this.textures.push(texture)
            this.bindings[k.toLocaleLowerCase()] = texture
          } else if (v._type === 'panel') {
            thisIsForLater.push(v)
          }
        } else {
          continue
        }
      }
    }
    for (const [, v] of Object.entries(thisIsForLater)) {
      if (
        v.position === undefined ||
        v.size === undefined ||
        !Array.isArray(v.size) ||
        !Array.isArray(v.position) ||
        typeof v.size[0] !== 'number' ||
        typeof v.size[1] !== 'number' ||
        typeof v.position[0] !== 'number' ||
        typeof v.position[1] !== 'number' ||
        v.texture === undefined ||
        typeof v.texture !== 'string' ||
        v.type === undefined ||
        typeof v.type !== 'string'
      ) {
        throw new Error('Invalid panel in parsed map!')
      }
      let alpha = 0
      if (v.alpha !== undefined) {
        alpha = Number(v.alpha)
      }
      const moveSpeed: number[] = [0, 0]
      const sizeSpeed: number[] = [0, 0]
      const moveStart: number[] = [0, 0]
      const moveEnd: number[] = [0, 0]
      const sizeEnd: number[] = [0, 0]
      let moveActive = false
      let moveOnce = false
      const apply = (arr: unknown, srcArr: number[]) => {
        if (
          arr !== undefined &&
          Array.isArray(arr) &&
          typeof arr[0] === 'number' &&
          typeof arr[1] === 'number'
        ) {
          srcArr[0] = arr[0]
          srcArr[1] = arr[1]
        }
      }
      apply(v.move_speed, moveSpeed)
      apply(v.size_speed, sizeSpeed)
      apply(v.move_start, moveStart)
      apply(v.move_end, moveEnd)
      apply(v.size_end, sizeEnd)
      if (typeof v.move_active === 'boolean') moveActive = v.move_active
      if (typeof v.move_once === 'boolean') moveOnce = v.move_once
      const texture = this.bindings[v.texture.toLocaleLowerCase()]
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (texture === undefined)
        throw new Error("Invalid panel's texture in parsed map!")
      const panel = new Panel({
        position: { x: v.position[0], y: v.position[1] },
        dimensions: { width: v.size[0], height: v.size[1] },
        texture,
        type: v.type,
        flags: v.flags,
        alpha,
        moveSpeed,
        sizeSpeed,
        moveStart,
        moveEnd,
        sizeEnd,
        moveActive,
        moveOnce,
      })
      this.panels.push(panel)
    }
  }

  public giveMetaInfo() {
    return { width: this.size.width, height: this.size.height }
  }

  public givePanels() {
    return this.panels
  }

  public giveTextures() {
    return this.textures
  }
}

export default EditorMap
