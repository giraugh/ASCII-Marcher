const container = document.querySelector('#container')
const size = 64
const chars = `#@$%?*+;:,'`.split('')
const nchars = chars.length

const vec = (x, y, z) => [x, y, z] 
const vadd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const vmul = (a, m) => [m * a[0], m * a[1], m * a[2]]
const vsub = (a, b) => vadd(a, vmul(b, -1))
const vlen = (a) => Math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2)
const vnorm = (a) => vmul(a, 1/vlen(a))
const vdot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

const SURF_DIST = 0.01
const MAX_STEPS = 50
const MAX_DIST = 1000

let time = 0

const map = (p) => {
    const pd = p[1]
    const sd = vlen(vsub(p, vec(0, 1 + .5 * (1 + Math.sin(time / 20))/2, 6))) - 1
    return Math.min(pd, sd)
}

const march = (ro, rd) => {
    let d = 0
    for (let i = 0; i < MAX_STEPS; i++) {
        p = vadd(ro, vmul(rd, d))
        d_ = map(p)
        d += d_
        if (d_ < SURF_DIST || d > MAX_DIST) break;
    }
    return d
}

const normal = (p) => {
    const dp = .01
    const pm = map(p)
    const n = vec(
        pm - map(vsub(p, vec(dp, 0, 0))),
        pm - map(vsub(p, vec(0, dp, 0))),
        pm - map(vsub(p, vec(0, 0, dp))),
    )
    return vnorm(n)
}

const light = (p, lp) => {
    const n = normal(p)
    const l = vnorm(vsub(lp, p))
    const diff = Math.max(0, vdot(l, n))
    const pa = vadd(p, vmul(l, SURF_DIST * 30))
    const ldist = march(pa, l)
    if (ldist < vlen(vsub(pa, lp))) { return 0 }
    return diff
}

const calcPixel = (x, y) => {
    const uv = vec((x - (size/2))/size, (y-(size/2))/size, 0)
    const ro = vec(0, 1, 0)
    const rd = vnorm(vec(uv[0], uv[1], 1))
    const dist = march(ro, rd)
    const hp = vadd(ro, vmul(rd, dist))
    const diff = light(hp, vec(4 * Math.cos(time / 10), 4, 6 + 4 * Math.sin(time / 10)))
    
    return Math.floor(diff * nchars)
}


const draw = () => {
    let text = ''
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
           const pixel = calcPixel(j, size - i)
           const c = chars[chars.length - 1 - pixel % nchars]
           text += c + ' '
        }
        text += '\n'
    }
    container.innerText = text
}

const cdraw = () => {
    const canvas = document.querySelector('canvas')
    const ctx = canvas.getContext('2d')
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const pixel = calcPixel(i, size - j) / nchars * 256
            ctx.fillStyle = `rgb(${pixel}, ${pixel}, ${pixel})`
            ctx.fillRect(i * 10, j * 10, 10, 10)     
        }
    }   
}

const loop = () => {
    draw()

    time++
    setTimeout(loop, 10)
}

loop()
