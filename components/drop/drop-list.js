import {range} from "../../utils.js";

element('drop-list', function () {

    // style
    // language=CSS
    this.setStyle(`
        drop-list {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;

            border: 1px solid #00000000;
            background-color: #00000000;
        }
    `);

    this.index ??= 0;
    this._data = [];
    Object.defineProperty(this, "data", {
        set: val => {
            this._data = val;
            this.render();
        }, get: () => this._data,
    });

    this.render = () => {
        this.jsx = `<select class="drop-list" destination _sel>
            <option value="0" ${this.index === 0 ? 'selected' : ''}></option>
            ${this._data.length ? this._data.map((val, i) => `<option value="${i + 1}" ${this.index === i + 1 ? 'selected' : ''}>${val}</option>`).join('') : ''}
        </select>`;

        if (this.index !== 0) {
            this._sel.value = +this.index + 1
            this.eventHandler.change({target: this._sel})
        }
    };

    this.onConnected = () => {
        const index = +this.getAttribute('index') || '';
        this.render(index);
    }

});