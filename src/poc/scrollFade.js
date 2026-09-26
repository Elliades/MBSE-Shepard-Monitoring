const EDGE = 1

/**
 * @param {Pick<HTMLElement, 'scrollTop' | 'scrollLeft' | 'scrollHeight' | 'scrollWidth' | 'clientHeight' | 'clientWidth'>} el
 */
export function scrollOverflowFlags(el) {
  const {
    scrollTop,
    scrollLeft,
    scrollHeight,
    scrollWidth,
    clientHeight,
    clientWidth,
  } = el

  const canScrollY = scrollHeight > clientHeight + EDGE
  const canScrollX = scrollWidth > clientWidth + EDGE

  return {
    top: canScrollY && scrollTop > EDGE,
    bottom: canScrollY && scrollTop + clientHeight < scrollHeight - EDGE,
    left: canScrollX && scrollLeft > EDGE,
    right: canScrollX && scrollLeft + clientWidth < scrollWidth - EDGE,
  }
}

/**
 * @param {HTMLElement} el
 */
export function applyScrollFadeClasses(el) {
  const flags = scrollOverflowFlags(el)
  el.classList.toggle('scroll-more-top', flags.top)
  el.classList.toggle('scroll-more-bottom', flags.bottom)
  el.classList.toggle('scroll-more-left', flags.left)
  el.classList.toggle('scroll-more-right', flags.right)
}

/**
 * @param {HTMLElement} el
 * @returns {() => void}
 */
export function bindScrollFade(el) {
  if (!el) return () => {}

  el.classList.add('scroll-fade-host')

  const update = () => applyScrollFadeClasses(el)
  update()

  el.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update, { passive: true })

  const ro = new ResizeObserver(update)
  ro.observe(el)
  for (const child of el.children) {
    ro.observe(child)
  }

  return () => {
    el.removeEventListener('scroll', update)
    window.removeEventListener('resize', update)
    ro.disconnect()
    el.classList.remove(
      'scroll-fade-host',
      'scroll-more-top',
      'scroll-more-bottom',
      'scroll-more-left',
      'scroll-more-right',
    )
  }
}

/**
 * @param {ParentNode} root
 * @param {string} [selector='[data-scroll-fade]']
 * @returns {() => void}
 */
export function bindScrollFadeAll(root, selector = '[data-scroll-fade]') {
  if (!root) return () => {}
  const elements = root.querySelectorAll(selector)
  const cleanups = [...elements].map((el) => bindScrollFade(el))
  return () => cleanups.forEach((fn) => fn())
}
