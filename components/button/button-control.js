import '../../BaseHTMLElement/BaseHTMLElement.js'

element('button-control', function () {
    // style
    // language=CSS
    this.setStyle(`
        button-control {
            width: fit-content;
            min-width: 2em;
            min-height: 1.5em;
            display: flex;
            /*align-items: center;*/
            justify-content: center;
            background-color: #e7e7e7;

            border: 1px solid gray;
            border-radius: 4px;
            user-select: none;
            margin: 1px;
            padding: 0 0.4em;
        }

        button-control:hover {
            background-color: #bdbdbd;
        }

        button-control:active {
            box-shadow: inset 2px 2px 5px -1px black;
        }
    `);

    this.onConnected = () => {
        this.dataEvent && this.addEventListener('click', e => EventBus.dispatchEvent(this.dataEvent, this.dataValue))
    };
});