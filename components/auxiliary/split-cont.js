let tar = false;
let nodeParent = false;
let nodePrev = false;
let nodeNext = false;

let h_drag = false;
let v_drag = false;

let mouse = {
    leftButton: false, over: false, dx: 0, dy: 0, x: 0, y: 0,
    sx: 0, sy: 0, ex: 0, ey: 0, left: 0, top: 0, right: 0, bottom: 0
};

const mouseHandler = ({clientX, clientY, target, type}) => {
    if (type === 'mousedown') mouse = {
        ...mouse, ...{
            leftButton: true,
            overUp: false, overDown: target,
            sx: clientX, sy: clientY,
        },
    };
    if (type === 'mouseup') mouse = {
        ...mouse, ...{
            leftButton: false,
            overUp: target,
            overDown: false,
            ex: clientX, ey: clientY,
        },
    };
    if (type === 'mousemove') mouse = {
        ...mouse, ...{
            x: clientX, y: clientY,
            dx: clientX - mouse.x, dy: clientY - mouse.y,
            left: mouse.sx, top: mouse.sy, right: mouse.x, bottom: mouse.y,
        },
    };
}

const update = (node, isHoriz) => {
    let arr = [];
    const arrNode = node.querySelectorAll(isHoriz ? '.split-h__sub' : '.split-v__sub');
    const field = isHoriz ? 'offsetWidth' : 'offsetHeight';
    arrNode.forEach(it => it.offsetParent && arr.push(it[field]));
    arrNode.forEach((it, i) => it.style.flex = arr[i]);
};

function eventHandler(e) {
    mouseHandler(e);

    if (e.type === 'mousedown') {
        tar = e.target;

        const classes = tar.classList;

        h_drag = classes.contains('split-h__bar');
        v_drag = classes.contains('split-v__bar');

        if (!h_drag && !v_drag) return;
        update(tar.parentNode, h_drag);

        tar.classList.add(h_drag ? 'bar-h--mov' : 'bar-v--mov');

        nodeParent = tar.parentNode;
        nodeParent.classList.add(h_drag ? 'split-h--mov' : 'split-v--mov');

        nodePrev = tar.previousElementSibling;
        nodeNext = tar.nextElementSibling;

        const field = h_drag ? 'offsetWidth' : 'offsetHeight';
        nodePrev.style.flex = nodePrev[field];
        nodeNext.style.flex = nodeNext[field];
    }
    if (e.type === 'mouseup') {
        h_drag = false;
        v_drag = false;
        if (!tar) return;
        tar.classList.remove('bar-h--mov');
        tar.classList.remove('bar-v--mov');
        if (!nodeParent) return;
        nodeParent.classList.remove('split-h--mov');
        nodeParent.classList.remove('split-v--mov');
    }
    if (e.type === 'mousemove') {
        if (!h_drag && !v_drag) return;
        const wa = parseInt(nodePrev.style.flexGrow);
        const wb = parseInt(nodeNext.style.flexGrow);
        const off = h_drag ? mouse.dx : mouse.dy;
        let [waoff, wboff] = [wa + off, wb - off];
        if (waoff < 0 || wboff < 0) return;
        nodePrev.style.flexGrow = waoff;
        nodeNext.style.flexGrow = wboff;
    }
}

function fillBars() {
    // const arr = this.querySelectorAll('.' + className);
    let className = '';
    // debugger
    // if (this.h) this.setAttribute('h', '')
    // if (this.v) this.setAttribute('v', '')
    // if (this.hasAttribute('h')) className = 'split-h'
    // if (this.hasAttribute('v')) className = 'split-v'

    if (this.tagName.toLocaleLowerCase() === 'split-cont-h') className = 'split-h'
    if (this.tagName.toLocaleLowerCase() === 'split-cont-v') className = 'split-v'

    const arr = [this];//.classList.contains('split-h');
    const classBar = className + '__bar';
    for (let i = 0; i < arr.length; i++) {
        const arrCont = Array.from(arr[i].children);
        const len = arrCont.length;
        if (len < 2) return;
        arrCont[0].classList.add(className + '__sub');
        for (let j = 1; j < len; j++) {
            arrCont[j].classList.add(className + '__sub');
            const barNode = getHtmlStr(`<div class="${classBar} unselectable"/>`)[0];
            barNode.addEventListener('click', this.eventHandler);
            arrCont[j].before(barNode);
        }
    }
}

function getHtmlStr(html) {
    const template = document.createElement('template'), content = template.content;
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return content.childNodes.length ? content.childNodes : [content.firstChild];
}

document.addEventListener('mousedown', (e) => eventHandler(e));
document.addEventListener('mouseup', (e) => eventHandler(e));
document.addEventListener('mousemove', (e) => eventHandler(e));

element('split-cont-h', function () {
    // style
    // language=CSS
    this.setStyle(`
        split-cont-h {
            display: flex;
            width: 100%;
            height: 100%;
            flex-direction: row;
            flex-wrap: nowrap;
        }

        split-cont-v {
            display: flex;
            width: 100%;
            height: 100%;
            flex-direction: column;
            flex-wrap: nowrap;
        }

        .split-h__sub {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .split-h__bar {
            width: 8px;
            min-width: 8px;
            height: auto;
            cursor: col-resize;
        }

        .split-h--mov {
            cursor: col-resize;
        }

        .split-v__sub {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            height: 50%;
        }

        .split-v__bar {
            height: 8px;
            min-width: 8px;
            width: auto;
            cursor: row-resize;
        }

        .split-v--mov {
            cursor: row-resize;
        }

        .bar-h--mov, .bar-v--mov {
            background: #00000020;
        }

        .split-h__bar, .split-v__bar {
            outline: 1px solid #00000033;
            outline-offset: -4px;
        }
    `);


    fillBars.call(this);
    update(document, true);
    update(document, false);

    //behavior
    this.someMethod = () => true;

    //life cycle
    this.onConnected = () => true;
    this.onDisconnected = () => true;
    this.onAdopted = () => true;
    this.onAttribute = () => true;
    this.onVisible = () => true;
    this.onHidden = () => true;
    this.onHideDelayed = () => true;

    //render
    // this.jsx = `<div></div>`;
});
element('split-cont-v', function () {
    // style
    // language=CSS
    this.setStyle(`
        split-cont-h {
            display: flex;
            width: 100%;
            height: 100%;
            flex-direction: row;
            flex-wrap: nowrap;
        }

        split-cont-v {
            display: flex;
            width: 100%;
            height: 100%;
            flex-direction: column;
            flex-wrap: nowrap;
        }

        .split-h__sub {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .split-h__bar {
            width: 8px;
            min-width: 8px;
            height: auto;
            cursor: col-resize;
        }

        .split-h--mov {
            cursor: col-resize;
        }

        .split-v__sub {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            height: 50%;
        }

        .split-v__bar {
            height: 8px;
            min-width: 8px;
            width: auto;
            cursor: row-resize;
        }

        .split-v--mov {
            cursor: row-resize;
        }

        .bar-h--mov, .bar-v--mov {
            background: #00000020;
        }

        .split-h__bar, .split-v__bar {
            outline: 1px solid #00000033;
            outline-offset: -4px;
        }
    `);


    fillBars.call(this);
    update(document, true);
    update(document, false);

    //behavior
    this.someMethod = () => true;

    //life cycle
    this.onConnected = () => true;
    this.onDisconnected = () => true;
    this.onAdopted = () => true;
    this.onAttribute = () => true;
    this.onVisible = () => true;
    this.onHidden = () => true;
    this.onHideDelayed = () => true;

    //render
    // this.jsx = `<div></div>`;
});