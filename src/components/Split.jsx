import { Fragment } from 'react'

/**
 * Renders text split into lines → masked words → characters so GSAP can
 * stagger `.split-char` / `.split-word` up from behind a clipping mask.
 * Every word carries its own mask, so reveals stay hidden even when a
 * headline wraps onto extra lines on small screens.
 * `lines` may be a string (one line) or an array of strings.
 */
export default function Split({ lines, as: Tag = 'span', mode = 'chars', className = '', lineClassName = '' }) {
  const arr = Array.isArray(lines) ? lines : [lines]
  const label = arr.join(' ')
  return (
    <Tag className={className} aria-label={label}>
      {arr.map((line, li) => (
        <span key={li} className={`split-line ${lineClassName}`} aria-hidden="true">
          {line.split(' ').map((word, wi, words) => (
            <Fragment key={wi}>
              <span className="split-mask">
                <span className="split-word">
                  {mode === 'chars'
                    ? [...word].map((ch, ci) => (
                        <span key={ci} className="split-char">
                          {ch}
                        </span>
                      ))
                    : word}
                </span>
              </span>
              {wi < words.length - 1 ? ' ' : null}
            </Fragment>
          ))}
        </span>
      ))}
    </Tag>
  )
}
