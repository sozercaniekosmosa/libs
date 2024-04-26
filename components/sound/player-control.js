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
            font-size: 1em;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            width: 500px;
            height: 100px;
            flex-wrap: nowrap;
            justify-content: space-between;
            background-color: #dbdbdb;
            padding: 0.5em;
        }

        .player-control-tempo {
            font-size: inherit;
            font-family: inherit;
            color: inherit;
            width: 5em;
            border: none;
            background-color: #efefef;
            border-radius: 1em;
            padding: 0 0.8em;
            height: 2em;
            text-align: center;
        }

        .player-control-seeker {
            height: 2em;
            padding: 0 0.8em;
            border: none;
            background-color: #efefef;
            border-radius: 1em;
        }

        .player-control-top {
            width: ${'-webkit-fill-available'};
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            flex-wrap: nowrap;
        }

        .player-control-top button-control {
            align-items: center;
        }

        .player-control-mid {
            display: flex;
            width: ${'-webkit-fill-available'};
            /* flex: 1 1 auto; */
            flex-direction: row;
        }

        .player-control-bottom {
            display: flex;
            flex-direction: row;
        }

        @font-face {
            font-family: Segment7;
            src: url(${"libs/components/sound/auxiliary/segment7-font/Segment7-4Gml.otf"}) format("opentype");
        }

        .segment-font {
            font-family: Segment7;
        }
    `);

    Object.assign(this, new Synthesizer());

    this.lastIsPlaying = false;
    this.range = range;
    this.indexSF2 = 0;//2;
    this.indexMidi = 0;//56;
    const path = './libs/components/sound/';

    this.setSources = ({arrUrlSF2, arrUrlMidi, pathSF2 = path + 'sf2/', pathMidi = path + 'mid/'}) => {
        this.arrUrlSF2 = arrUrlSF2;
        this.arrUrlMidi = arrUrlMidi;
        this.pathSF2 = pathSF2;
        this.pathMidi = pathMidi;

        render();
    }

    const render = () => {
        this.innerHTML = '';
        // language=JSX
        this.jsx = `
            <div class="player-control-top">
                <button-control onclick={async e => this.play()}>►</button-control>
                <button-control onclick={e => this.stop()}>Х</button-control>
                <slider-control class="segment-font" change={val => this.volume(val)} value="0" max="10" step=".1" _gain/>
                <input type="number" onchange={({target}) => this.temp(target.value)} value="0" max="500" step="10"
                       class="player-control-tempo segment-font" _tempo/>
            </div>
            <div class="player-control-mid">
                <slider-control class="player-control-seeker" change={val => this.seek(val)}
                                label={(val, min, max) => ((min + max === 0) ? 0 : Math.trunc(this.range(min, max, 0, 100, val))) + '%'}
                                value="0" _seeker/>
            </div>
            <div class="player-control-bottom">
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
        if (!this.lastIsPlaying && this.isPlaying()) {
            this._tempo.value = await this.getBpm();
        }
        if (!this.isPlaying()) return
        this._gain.setValue(Math.trunc(await this.getGain() * 10) / 10);
        this._seeker.setValue(await this.getCurrentTick());
        this._seeker.setMax(await this.getTotalTicks());
        this.lastIsPlaying = this.isPlaying()
    };
    this.update();

});