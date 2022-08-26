/* @flow */

import { isRegExp, remove } from 'shared/util'
import { getFirstComponentChild } from 'core/vdom/helpers/index'

type CacheEntry = {
  name: ?string;
  tag: ?string;
  componentInstance: Component;
};

type CacheEntryMap = { [key: string]: ?CacheEntry };

function getComponentName (opts: ?VNodeComponentOptions): ?string {
  return opts && (opts.Ctor.options.name || opts.tag)
}

function matches (pattern: string | RegExp | Array<string>, name: string): boolean {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else if (isRegExp(pattern)) {
    return pattern.test(name)
  }
  /* istanbul ignore next */
  return false
}

function pruneCache (keepAliveInstance: any, filter: Function) {
  const { cache, keys, _vnode } = keepAliveInstance
  for (const key in cache) {
    const entry: ?CacheEntry = cache[key]
    if (entry) {
      const name: ?string = entry.name
      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode)
      }
    }
  }
}

function pruneCacheEntry (
  cache: CacheEntryMap,
  key: string,
  keys: Array<string>,
  current?: VNode
) {
  const entry: ?CacheEntry = cache[key]
  if (entry && (!current || entry.tag !== current.tag)) {
    entry.componentInstance.$destroy()
  }
  cache[key] = null
  remove(keys, key)
}

const patternTypes: Array<Function> = [String, RegExp, Array]

export default {
  name: 'keep-alive',
  abstract: true, // 抽象组件，不会被记录到 $parent $children

  props: {
    include: patternTypes, // 可以缓存哪些组件 ['a','b']
    exclude: patternTypes, // 可以排除哪些组件 ['a','b']
    max: [String, Number] // 最大缓存个数
  },

  methods: {
    cacheVNode() {
      const { cache, keys, vnodeToCache, keyToCache } = this
      if (vnodeToCache) {
        const { tag, componentInstance, componentOptions } = vnodeToCache
        cache[keyToCache] = {
          name: getComponentName(componentOptions),
          tag,
          componentInstance, // 组件实例渲染之后会有 $el，下次可以复用
        }
        keys.push(keyToCache)
        // prune oldest entry
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode)
        }
        this.vnodeToCache = null
      }
    }
  },

  created () {
    this.cache = Object.create(null) // 缓存区
    this.keys = [] // 缓存组件的名字
  },

  destroyed () {
    for (const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },

  mounted () {
    this.cacheVNode()
    this.$watch('include', val => {
      pruneCache(this, name => matches(val, name))
    })
    this.$watch('exclude', val => {
      pruneCache(this, name => !matches(val, name))
    })
  },

  updated () {
    this.cacheVNode()
  },

  render () {
    const slot = this.$slots.default // 取默认插槽
    const vnode: VNode = getFirstComponentChild(slot) // 获取插槽中的第一个虚拟节点
    const componentOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions // { Ctor, propsData, listeners, tag, children }
    if (componentOptions) {
      // check pattern
      const name: ?string = getComponentName(componentOptions) // 获取组件名
      const { include, exclude } = this
      // 不复用的逻辑
      if (
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        return vnode
      }

      const { cache, keys } = this
      const key: ?string = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
        : vnode.key // 生成一个唯一 key
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance // 获取缓存的组件实例
        // make current key freshest LRU 策略
        remove(keys, key)
        keys.push(key)
      } else {
        // delay setting the cache until update
        this.vnodeToCache = vnode // 缓存当前的 vnode
        this.keyToCache = key // key 也需要被缓存
      }

      vnode.data.keepAlive = true // 给当前 vnode 增加一个标识
    }
    // 虚拟节点存在 componentInstance 和 data.keepAlive 时说明是被缓存的
    return vnode || (slot && slot[0])
  }
}
