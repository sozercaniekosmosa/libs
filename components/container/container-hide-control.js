element('container-hide-control', function () {
    // style
    // language=CSS
    this.setStyle(`
        container-hide-control {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
        }

        .container-hide-control__open {
            display: flex;
            width: 1em;
            height: 1em;
            padding: 0;
            cursor: pointer;
            user-select: none;
            box-shadow: inset -1px -1px 3px -2px #000000;
            border-radius: 0.2em;
            border: 1px solid gray;
            text-decoration: none;
            color: inherit;
            justify-content: center;
            line-height: 0.8em;

        }

        .container-hide-control__element {
            display: flex;
            /*font-size: 0.8em;*/
            border-width: 0 0 0 1px !important;
            border: solid #c0c0c0;
            padding: .1em .1em .1em .2em ;
            margin: -.2em 0 0 .2em;
            flex-direction: column;
            flex-wrap: nowrap;
            /*line-height: 0.95em;*/
        }

        .modal-dialog--hide {
            height: 1.4em !important;
            border-color: #00000000;
            overflow: hidden;
        }

        .container-hide-control__open:hover {
            background-color: #d9d9d9;
        }

        .container-hide-control__open:active {
            box-shadow: inset 1px 1px 2px -1px black;
        }
    `);

    this.update = () => {
        this._title.textContent = this._switchModal.classList.contains('modal-dialog--hide') ? '+' : '-'
    }

    this.onSwitchModal = e => {
        this._switchModal.classList.toggle('modal-dialog--hide');
        this.update();
    }

    this.onConnected = () => {
        //language=JSX
        this.jsx = `
            <div class="unselectable container-hide-control__open" onclick={this.onSwitchModal} _title></div>
            <div class="unselectable container-hide-control__element ${this.hide ? 'modal-dialog--hide' : ''}"
                 _switchModal destination/>`
        this.update();
    };
});