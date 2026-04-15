# Progressive Blur Notes

Reference: https://kennethnym.com/blog/progressive-blur-in-css/

## Core Pattern

Use a container with stacked full-size layers:

1. `7x .blur-filter` elements
2. `1x .gradient` element

Each `blur-filter` gets:

- a different `backdrop-filter: blur(...)` value (low to high)
- a `mask-image: linear-gradient(...)` that defines where that blur layer is visible
- slight overlap with adjacent layers so transitions are smooth

This is what makes blur progressive. A single blur + gradient tint is not progressive blur.

## Practical Setup

- `position: absolute` container
- `pointer-events: none`
- all child layers `position: absolute; inset: 0`
- separate presets per context:
  - hero bottom fade (`.progressive-blur-hero`)
  - top nav fade (`.progressive-blur-nav`)

## Tuning Knobs

- Layer count: start at `7`
- Blur sequence: start around `1,2,4,8,16,32,48`
- Mask stops:
  - hero: strongest toward bottom
  - nav: strongest toward top
- `gradient` layer:
  - hides artifacts and adds color tint
  - should not replace layered blur

## Regression Check

If effect looks flat, verify:

1. all `.blur-filter` nodes are present in markup
2. `nth-child` rules are applying
3. each layer has different blur + mask stops
4. not relying on only pseudo-elements for blur
