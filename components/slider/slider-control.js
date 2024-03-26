import {getDeltaMouseMove} from '../../utils.js'

element('slider-control', function () {

    let color = '#ababab'
    let color2 = '#6e6e6e'
    // style
    // language=CSS
    this.setStyle(`
        slider-control {
            display: flex;
            align-items: center;
            gap: .5rem;
            max-width: 500px;
            margin: 0 auto;
            background: #fff;
            padding: 0px 10px;
            font-size: .8em;
        }

        input[type="range"] {
            -webkit-appearance: none;
            appearance: none;
            width: auto;
            cursor: pointer;
            outline: none;
            border-radius: 15px;
            height: 6px;
            background: ${color};
        }

        /* Thumb: webkit */
        input[type="range"]::-webkit-slider-thumb {
            /* removing default appearance */
            -webkit-appearance: none;
            appearance: none;
            /* creating a custom design */
            height: 15px;
            width: 15px;
            background-color: ${color};
            border-radius: 50%;
            border: none;

            transition: .2s ease-in-out;
        }

        /* Thumb: Firefox */
        input[type="range"]::-moz-range-thumb {
            height: 15px;
            width: 15px;
            background-color: ${color};
            border-radius: 50%;
            border: none;
            transition: .2s ease-in-out;
        }

        /* Hover, active & focus Thumb: Webkit */

        input[type="range"]::-webkit-slider-thumb:hover {
            box-shadow: 0 0 0 10px ${color + '20'}
        }

        input[type="range"]:active::-webkit-slider-thumb {
            box-shadow: 0 0 0 10px ${color + '33'}
        }

        input[type="range"]:focus::-webkit-slider-thumb {
            box-shadow: 0 0 0 10px ${color + '33'}
        }

        /* Hover, active & focus Thumb: Firfox */

        input[type="range"]::-moz-range-thumb:hover {
            box-shadow: 0 0 0 10px ${color + '20'}
        }

        input[type="range"]:active::-moz-range-thumb {
            box-shadow: 0 0 0 10px ${color + '33'}
        }

        input[type="range"]:focus::-moz-range-thumb {
            box-shadow: 0 0 0 10px ${color + '33'}
        }
    `);

    this.isMouseLeftPressHold = false;
    this.min = 0;
    this.max = 100;

    const update = (val) => {
        if (this.label) {
            let _value = parseFloat(+val || 0);
            let _min = parseFloat(+this._input.min || 0);
            let _max = parseFloat(+this._input.max || 0);
            this._val.textContent = this.label(_value, _min, _max);
        } else {
            this._val.textContent = val;
        }
        const progress = (val / this._input.max) * 100;
        this._input.style.background = `linear-gradient(to right, ${color2} ${progress}%, ${color} ${progress}%)`;

    };

    this.onConnected = () => {
        // debugger
        // language=JSX
        this.jsx = `<input type="range" max={this.max} min={this.min} step={this.step} _input/>
        <div _val>0</div>`;

        this._input.addEventListener("input", e => update(e.target.value));

        this.setValue(this.value);
        this._input.addEventListener('click', e => EventBus.dispatchEvent(this.dataEvent, this.dataValue));
        this._input.addEventListener('mousedown', e => this.isMouseLeftPressHold = true);
        this._input.addEventListener('mouseup', e => this.isMouseLeftPressHold = false);
        this._input.addEventListener('change', e => this.change && this.change(e.target.value))

    }

    this.setValue = (val = this._input.value) => {
        if (this.isMouseLeftPressHold === false) {
            this._input.value = val;
            update(val)
        }
    }
    this.setMax = (val) => {
        this._input.max = val
    }
    this.setMin = (val) => {
        this._input.min = val
    }
});