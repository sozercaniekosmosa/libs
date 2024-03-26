element('slider-checkbox', function () {
    // style
    // language=CSS
    this.setStyle(`
        /* Slide 5 */
        .slider {
            display: flex;
            align-items: center;
            width: fit-content;
        }

        .slider .text {
            margin: 0 5px;
        }

        .slider-checkbox {
            width: 3em;
            height: 1.5em;
            margin: 20px auto;
            pointer-events: none;
        }

        .slider-checkbox * {
            transition: 250ms;
            box-sizing: border-box;
        }

        .slider-checkbox input[type="checkbox"] {
            display: none;
        }

        .slider-checkbox label {
            display: inline-block;
            width: 100%;
            height: 95%;
            background: #00a6ff;
            border-radius: 0.7em;
            padding-top: 0.2em;
            padding-left: 0.2em;
        }

        .slider-checkbox span {
            display: inline-block;
            width: 1em;
            height: 1em;
            background: #FFF;
            border: none;
            border-radius: 2em;;
        }

        .slider-checkbox input[type="checkbox"]:checked ~ label {
            background: #00ba70;
            padding-left: 1.7em;
        }
    `);

    this.onConnected = () => {
        // language=JSX
        this.innerHTML = `<section class="slider">
            <div class="text">разработка</div>
            <div class="slider-checkbox">
                <input id="ch1e2c3k-box" type="checkbox"/>
                <label for="ch1e2c3k-box">
                    <span id="ball"></span>
                </label>
            </div>
            <div class="text">тестирование</div>
        </section>`

        this._checkbox = this.querySelector('#ch1e2c3k-box');

        const update = () => {
            this._checkbox.checked = !this._checkbox.checked
            EventBus.dispatchEvent('mode-change', this._checkbox.checked)
        }

        // this._checkbox.addEventListener('change', e => update())
        EventBus.addEventListener('evb-key', ({event, combine, nodeFocus}) => combine('space') && update())
        this.addEventListener('click', e => update())
    };
});