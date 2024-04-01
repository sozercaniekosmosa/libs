import {range} from "../../utils.js";
import Synthesizer from "./synthesizer.js";
import "../drop/drop-list.js";
import "../button/button-control.js";
import "../slider/slider-control.js";


element('player-control', function () {

    // style
    // language=CSS
    this.setStyle(`
        player-control {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
        }
    `);

    Object.assign(this, new Synthesizer());

    this.range = range;


    this.setSources = ({arrUrlSF2, arrUrlMidi, pathSF2 = './libs/components/sound/sf2/', pathMidi = './libs/components/sound/mid/'}) => {
        this.arrUrlSF2 = arrUrlSF2;
        this.arrUrlMidi = arrUrlMidi;
        this.pathSF2 = pathSF2;
        this.pathMidi = pathMidi;

        render();
    }

    const render = () => {
        this.innerHTML = ''
        // language=JSX
        this.jsx = `
            <drop-list data={this.arrUrlSF2 ?? []} index="0" onchange={async e => {
                const index = e.target.selectedIndex - 1
                if (~index) await this.loadResource({urlSF: this.pathSF2 + this.arrUrlSF2[index]});
            }}/>
            <drop-list data={this.arrUrlMidi ?? []} index="26" onchange={async e => {
                const index = e.target.selectedIndex - 1
                if (~index) await this.loadResource({urlMel: this.pathMidi + this.arrUrlMidi[index]});
            }}/>
            <button-control onclick={async e => {
                this.play();
                this.update();
            }}>►</button-control>
            <button-control onclick={e => this.stop()}>Х</button-control>
            <slider-control change={val => this.seek(val)}
                            label={(val, min, max) => ((min + max === 0) ? 0 : Math.trunc(this.range(min, max, 0, 100, val))) + '%'}
                            value="0" _seeker/>
            <slider-control change={val => this.temp(val)} value="0" max="500" step="10" _tempo/>
            <slider-control change={val => this.volume(val)} value="0" max="10" step=".1" _gain/>
            <slider-control change={val => this.pitch(0, val)}
                            label={(val, min, max) => (Math.trunc(this.range(min, max, -100, 100, val))) + '%'}
                            max="16384" min="0" value="8192"
                            step="1638.4" _pitch/>`;
    };

    this.onConnected = async () => {
        this.innerHTML = '<spinner-process/>'
    };

    this.update = async () => {
        this._gain.setValue(await this.getGain());
        this._tempo.setValue(await this.getBpm());
        this._seeker.setValue(await this.getCurrentTick());
        this._seeker.setMax(await this.getTotalTicks());

        setTimeout(this.update, 200);
    };

});