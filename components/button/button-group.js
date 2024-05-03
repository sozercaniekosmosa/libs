import '../../BaseHTMLElement/BaseHTMLElement.js'

element('button-group', function () {
    // style
    // language=CSS
    this.setStyle(`
        button-group {
            display: flex;
        }

        button-group > * {
            cursor: pointer; /* Pointer/hand icon */
        }

        button-group > *:first-child:not(:last-child) {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
            margin-right: 0;
        }

        button-group > *:last-child:not(:first-child){
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            border-left: 0;
            margin-left: 0;
        }

        button-group > *:not(:first-child):not(:last-child) {
            margin-right: 0;
            margin-left: 0;
            border-left: 0;
            border-radius: 0;
        }
    `);

    this.onConnected = () => {
        this.dataEvent && this.addEventListener('click', e => EventBus.dispatchEvent(this.dataEvent, this.dataValue))
    };
});