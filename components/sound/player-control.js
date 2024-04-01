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

    this.currTick = 0;
    this.isPlay = false;
    this.range = range;
    this.indexSF2 = 0;
    this.indexMidi = 0;
    const path = './libs/components/sound/';

    this.setSources = ({arrUrlSF2, arrUrlMidi, pathSF2 = path + 'sf2/', pathMidi = path + 'mid/'}) => {
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
            <div class="player-control-top">
                <button-control onclick={async e => {
                    this.play();
                    this.isPlay = true;
                }}>►
                </button-control>
                <button-control onclick={e => {
                    this.stop()
                    this.isPlay = false;
                }}>Х
                </button-control>
                <slider-control change={val => this.seek(val)}
                                label={(val, min, max) => ((min + max === 0) ? 0 : Math.trunc(this.range(min, max, 0, 100, val))) + '%'}
                                value="0" _seeker/>
            </div>
            <div class="player-control-mid">
                <slider-control change={val => this.temp(val)} value="0" max="500" step="10" _tempo/>
                <slider-control change={val => this.volume(val)} value="0" max="10" step=".1" _gain/>
            </div>
            <div class="player-control-mid">
                <drop-list data={this.arrUrlSF2 ?? []} index={this.indexSF2} onchange={async e => {
                    const index = e.target.selectedIndex - 1
                    if (~index) await this.loadResource({urlSF: this.pathSF2 + this.arrUrlSF2[index]});
                }}/>
                <drop-list data={this.arrUrlMidi ?? []} index={this.indexMidi} onchange={async e => {
                    const index = e.target.selectedIndex - 1
                    if (~index) await this.loadResource({urlMel: this.pathMidi + this.arrUrlMidi[index]});
                }}/>
            </div>
        `;
    };

    this.onConnected = async () => {
        this.innerHTML = '<spinner-process/>'
    };

    this.update = async () => {
        setTimeout(this.update, 100);
        if (!this.isPlaying()) return
        this._gain.setValue(await this.getGain());
        this._tempo.setValue(await this.getBpm());
        this._seeker.setValue(await this.getCurrentTick());
        this._seeker.setMax(await this.getTotalTicks());
    };
    this.update();

});