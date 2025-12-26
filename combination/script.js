let { pinyin } = pinyinPro

const I = [
    'b',
    'c',
    'ch',
    'd',
    'f',
    'g',
    'h',
    'j',
    'k',
    'l',
    'm',
    'n',
    'p',
    'q',
    'r',
    's',
    'sh',
    't',
    'w',
    'x',
    'y',
    'z',
    'zh',
]
const FH = ['i', 'u', 'v']
const FB = ['a', 'ai', 'ao', 'e', 'ei', 'er', 'i', 'o', 'ou', 'u', 'ui', 'v', 've']
const FT = ['n', 'ng']

function getIndex(i, a) {
    if (i === undefined) {
        return a.length
    }
    i = i.replace('ü', 'v')
    let r = a.indexOf(i)
    return r === -1 ? a.length : r
}
const START = 0xe000
function toUnicode(a, b, c, d) {
    let w1 = (FH.length + 1) * (FB.length + 1) * (FT.length + 1)
    let w2 = (FB.length + 1) * (FT.length + 1)
    let w3 = FT.length + 1
    let w4 = 1
    return START + a * w1 + b * w2 + c * w3 + d * w4
}

function chooseIndex(array) {
    return Math.floor(Math.random() * array.length)
}

$('#ran').click(function () {
    let count = parseInt($('#ran_count').val()) ?? 0
    function* gen(count) {
        for (let _ = 0; _ < count; _++) {
            yield String.fromCodePoint(
                toUnicode(chooseIndex(I), chooseIndex(FH), chooseIndex(FB), chooseIndex(FT))
            )
        }
    }
    let mapped = Array.from(gen(count))
    console.log(mapped)
    $('#container').html(mapped)
})

$('#gen').click(function () {
    let input = $('#inputbox').val()
    let output = pinyin(input, {
        pattern: 'pinyin',
        toneType: 'none',
        type: 'all',
        v: true,
    })

    let mapped = output.map(item => {
        if (item.isZh) {
            let a = getIndex(item.initial, I)
            let head = item.finalHead
            let body = item.finalBody
            if (head && head === 'u' && body === 'e') {
                head = undefined
                body = 've'
            }
            let b = getIndex(head, FH)
            let tail = item.finalTail
            if (tail && ['e', 'u', 'o', 'i'].indexOf(tail) != -1) {
                body = body + tail
                tail = undefined
            }
            let c = getIndex(body, FB)
            let d = getIndex(tail, FT)
            let unicode = toUnicode(a, b, c, d)
            console.log(item.origin, a, b, c, d, unicode)
            return String.fromCodePoint([unicode])
        } else {
            return item.origin
        }
    })
    $('#pinyinbox').val(
        output
            .map(item =>
                item.isZh
                    ? [item.initial, item.finalHead, item.finalBody, item.finalTail]
                    : item.origin
            )
            .join(' ')
    )

    $('#container').html(mapped.join(''))
})

$('#copy').click(function () {
    navigator.clipboard.writeText($('#container').html())
})

$('#render').click(function () {
    html2canvas(document.querySelector('#container'), {
        backgroundColor: null,
    }).then(canvas => {
        Canvas2Image.saveAsPNG(canvas, undefined, undefined, 'rendered')
    })
})
