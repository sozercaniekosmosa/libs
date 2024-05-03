import {formatDateTime} from "../../utils.js";

element('log-message', function () {
    // style
    // language=CSS
    this.setStyle(`
        @keyframes slide-up {
            0% {
                transform: translateY(0px);
            }
            100% {
                transform: translateY(100px);
            }
        }

        .log-message__error {
            background: #ffdbe7;
            color: #2c2c2c;
        }

        .log-message__warning {
            background: #ffc400;
            color: black;
        }

        log-message {
            padding: 10px;
        }

        .log-message > span {
            /*width: inherit;*/
            /*padding: 0 1em;*/
        }

        .log-message > span:hover {
            background-color: lightgray;
            color: #414141;
            cursor: default;
        }

        .log-message {
            overflow-y: scroll;
            height: inherit;
            font-family: monospace;
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
        }
    `);

    //behavior
    this.onConnected = () => {
        //language=JSX
        this.jsx = `<div class="log-message" _message></div>`;

    };

    let nodeMessage;
    const log = (message, type = '') => {
        this._message.innerHTML += `<span class="${type}"><i>${formatDateTime() + ': '}</i>${message}</span>`;
        if (this._message.children.length > 50) this._message.children[0].remove();

        nodeMessage = this._message;

        let height = this._message.getBoundingClientRect().height;
        let off = this._message.scrollHeight - this._message.scrollTop - height;
        if (off < height / 2) setTimeout(() => [...this._message.children].at(-1).scrollIntoView({behavior: "smooth"}), 500);

        // console.log([...this._message.children].at(-1))
    }

    window.xlog = this.log = (message) => {
        log(message);
    }
    window.xwarn = this.warn = (message) => {
        log(message, 'log-message__warn');
    }
    window.xerr = this.err = (message) => {
        log(message, 'log-message__error');
    }

    EventBus.addEventListener('evb-key', ({event, combine, nodeFocus}) => {
        if (combine('ControlLeft KeyL')) {
            nodeMessage.innerHTML = '';
            event.stopPropagation()
            event.preventDefault()
        }
        // if (combine('f12')) return;

        return false
    });

    // if (keys['control'] && keyCodes['keyl']) {
    //     this.innerHTML = '';
    // }
});