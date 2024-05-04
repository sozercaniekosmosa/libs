const NAME_ELEMENT = 'tab-cont'

element(NAME_ELEMENT, function () {
    // style
    // language=CSS
    this.setStyle(`
        tab-cont {
            height: 100%;
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
        }

        .tab__caption {
            display: flex;
            overflow-x: hidden;
            overflow-y: hidden;
            width: 100%;
            height: 1.7em;
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        .tab--top > * {
            border-radius: 2px 2px 0 0;
            border-bottom: 1px solid hsl(0, 0%, 75%);
        }

        .tab__border-bfr {
            min-width: 3px;
        }

        .tab__border-aft {
            width: inherit;
        }

        .tab__button:nth-of-type(2) {
            border-width: 1px;
        }

        .tab__button {
            width: auto;
            height: auto;
            border-width: 1px 1px 1px 0;
            border-color: hsl(0, 0%, 75%);
            border-style: solid;
            padding: 2px 4px 2px 3px;
            background: rgba(0, 0, 0, 0.1);
            outline: none;
        }

        .tab--top > .tab__select {
            border-bottom-color: #00000000;
            background: none;
        }

        .tab__item {
            flex: 1;
            height: 100%;
            /* height: 1%; */
            /*border: 1px solid red;*/
        }

        .tab__content {
            order: 0;
            flex: 1 1 auto;
            align-self: stretch;
        }

        .tab--bottom > * {
            borderRadius: 0 0 2px 2px;
            borderTop: 1px solid hsl(0, 0%, 75%);
        }

        .tab__button > button {
            fontSize: 0.8rem;
            width: 0.9em;
            height: 1em;
            border: none;
            padding: 0;
            background: #00000000;
            color: #a1a1a1;
            paddingLeft: 0.4em;
            outline: none;
        }

        .tab__button > button:hover {
            color: #000;
        }

        .tab__button > button:active {
            fontWeight: bold;
        }
    `);

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

    this.wheelTab = ({target, type, deltaY}) => {
        let classes = target.classList;
        const is = (className) => target ? classes.contains(className) : false;

        if (this.scrollLeft === false) this._caption.scrollLeft = this.scrollLeft;

        // прокрутка вкладок колесиком
        if (type === 'wheel' && is('tab__button')) {
            const delta = Math.sign(deltaY);
            this.currIndex += delta;
            let k = this._caption.clientWidth * 5 / this._caption.childElementCount;
            this._caption.scrollLeft += delta * k;
        }
    }
    this.switchTab = ({target}) => {
        this.querySelectorAll('.tab__item').forEach(node => node.classList.add('hide'));
        this.arrTab[target.index].classList.remove('hide')
        // console.log(this.arrTab[target.index])

        this.querySelectorAll('.tab__button').forEach(button => button.classList.remove('tab__select'));
        // this.querySelectorAll('.tab__item').forEach(tabIt => tabIt.classList.add('hide'));
        target.classList.add('tab__select')
        target.scrollIntoView();
        target.focus();
    };

    this.arrTab = [];

    //render
    this.jsx = `
        <div class='tab__caption tab--top' _caption onClick={this.switchTab} onWheel={this.wheelTab}>
            <span class="tab__border-bfr"/>
            ${[...this.children].map((it, i) => `<span class='tab__button' index=${i}>${it['tab-name']}</span>`).join('')}
            <span class="tab__border-aft"/>
        </div>
        <div class='tab__content' destination={(node,i) => {
            this.arrTab[i] = node;
            node.classList.add('tab__item', 'hide')
        }}/>`;

    if (this._caption.childElementCount) this._caption.children[1].click();
});