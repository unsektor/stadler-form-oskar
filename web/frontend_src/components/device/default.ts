import {DeviceState} from "../device-state/default";
import {DeviceStateFormatInterface} from "../device-state/serialization";

export class DeviceUI {
    private hygrostatButtonElement: HTMLElement;
    private powerButtonElement: HTMLElement;
    private dimmerButtonElement: HTMLElement;
    private speedButtonElement: HTMLElement;

    constructor(
        public readonly applicationElement: HTMLElement,
        private deviceState: DeviceState
    ) {
        this.hygrostatButtonElement = applicationElement.querySelector('.button.button_hygro') as HTMLInputElement;
        this.powerButtonElement = applicationElement.querySelector('.button.button_power') as HTMLInputElement;
        this.dimmerButtonElement = applicationElement.querySelector('.button.button_dimmer') as HTMLInputElement;
        this.speedButtonElement = applicationElement.querySelector('.button.button_speed') as HTMLInputElement;

        this.powerButtonElement.addEventListener('click', (e: Event): void => {
            deviceState.power = !deviceState.power;
            this.render();
        });

        this.dimmerButtonElement.addEventListener('click', (e: Event): void => {
            // order: bright, dim, disabled
            deviceState.dimmer = (deviceState.dimmer + 2) % 3;
            this.updateDimmerDisplay();
        });

        this.hygrostatButtonElement.addEventListener('click', (e: Event): void => {
            deviceState.hygrostat = Math.max(1, (deviceState.hygrostat + 1) % 6);
            this.updateHygrostatDisplay();
        });

        this.speedButtonElement.addEventListener('click', (e: Event): void => {
            deviceState.speed = Math.max(1, (deviceState.speed + 1) % 3);
            this.updateSpeedDisplay();
        });
    }

    private updatePowerDisplay(): void {
        let powerClass = this.deviceState.power ? 'device_power_on' : 'device_power_off';

        this.applicationElement.classList.remove('device_power_on', 'device_power_off');
        this.applicationElement.classList.add(powerClass);

        this.applicationElement.classList.remove('device_no-water');
        if (!this.deviceState.water) {
            this.applicationElement.classList.add('device_no-water');
        }
    }

    private updateDimmerDisplay(): void {
        this.applicationElement.classList.remove('device_dimmer_1', 'device_dimmer_2');

        if (this.deviceState.power && this.deviceState.dimmer > 0) {
            this.applicationElement.classList.add(`device_dimmer_${this.deviceState.dimmer}`);
        }
    }

    private updateHygrostatDisplay(): void {
        for (let i = 0; i <= 5; ++i) {
            this.applicationElement.classList.remove(`device_hygro_${i}`)
        }

        if (!this.deviceState.power || !this.deviceState.water) {
            return;
        }

        if (this.deviceState.hygrostat === 5) {
            this.deviceState.fan = true;
            this.updateFanDisplay();
        }

        this.applicationElement.classList.add(`device_hygro_${this.deviceState.hygrostat}`);
        this.updateBlinkAnimation();
    }

    private updateSpeedDisplay(): void {
        this.applicationElement.classList.remove('device_speed_1', 'device_speed_2')

        if (!this.deviceState.power || !this.deviceState.water) {
            return;
        }

        this.applicationElement.classList.add(`device_speed_${this.deviceState.speed}`)
    }

    public updateResetFilterDisplay(): void {
        this.applicationElement.classList.remove('device_filter-warning');

        if (!this.deviceState.power || !this.deviceState.water) {
            return;
        }

        if (!this.deviceState.filter) {
            this.applicationElement.classList.add('device_filter-warning');
            this.updateBlinkAnimation();
        }
    }

    public updateFanDisplay(): void {
        this.applicationElement.classList.remove('device_power_pause');

        if (!this.deviceState.power || !this.deviceState.water) {
            return;
        }

        if (!this.deviceState.fan) {
            this.applicationElement.classList.add('device_power_pause');
        }
    }

    public updateBlinkAnimation(): void {
        // ad-hoc to sync animation of leads
        if (this.deviceState.fan) {
            return;
        }

        this.applicationElement.classList.remove('device_power_pause', 'device_filter-warning')

        setTimeout((): void => {
            if (!this.deviceState.filter) {
                this.applicationElement.classList.add('device_power_pause')
                this.applicationElement.classList.add('device_filter-warning')
            } else {
                this.applicationElement.classList.add('device_power_pause')
            }
        }, 50)
    }

    public render(): void {
        this.updatePowerDisplay();
        this.updateDimmerDisplay();
        this.updateHygrostatDisplay();
        this.updateSpeedDisplay();
        this.updateResetFilterDisplay();
        this.updateFanDisplay();
    }
}

export class DeviceEventUI {
    private pauseEventButtonElement: HTMLElement;
    private filterEventButtonElement: HTMLElement;
    private waterEventElementButton: HTMLElement;

    constructor(deviceState: DeviceState, deviceUI: DeviceUI) {
        this.pauseEventButtonElement = deviceUI.applicationElement.querySelector('.button.button_event_pause') as HTMLElement;
        this.filterEventButtonElement = deviceUI.applicationElement.querySelector('.button.button_event_filter') as HTMLElement;
        this.waterEventElementButton = deviceUI.applicationElement.querySelector('.button.button_event_water') as HTMLElement;

        this.filterEventButtonElement.addEventListener('click', (e: Event): void => {
            // ... actually, requires 5 seconds push
            deviceState.filter = !deviceState.filter;
            deviceUI.updateResetFilterDisplay();
        });

        this.pauseEventButtonElement.addEventListener('click', (e: Event): void => {
            if (deviceState.hygrostat === 5) {
                return;
            }
            deviceState.fan = !deviceState.fan;
            deviceUI.updateFanDisplay();
            setTimeout((): void => deviceUI.updateBlinkAnimation(), 0);
        });

        this.waterEventElementButton.addEventListener('click', (e: Event): void => {
            if (!deviceState.power) {
                return;
            }
            deviceState.water = !deviceState.water;
            deviceState.fan = deviceState.water;
            deviceUI.render();
        });
    }
}

export class DeviceStateUI {
    private binInputElement: HTMLInputElement;
    private htmlInputElement: HTMLInputElement;
    private countFromLedsOptionInputElement: HTMLInputElement;
    private deviceState: DeviceState;
    private deviceStateFormat: DeviceStateFormatInterface;

    constructor(
        deviceState: DeviceState,
        deviceStateFormat: DeviceStateFormatInterface
    ) {
        this.deviceState = deviceState;
        this.deviceStateFormat = deviceStateFormat;
        const self = this;
        this.binInputElement = document.querySelector('input[name=bin]') as HTMLInputElement;
        this.htmlInputElement = document.querySelector('input[name=hex]') as HTMLInputElement;
        this.countFromLedsOptionInputElement = document.querySelector('input[id=count-from-lead]') as HTMLInputElement;

        document.addEventListener('click', (e: Event): void => {
            setTimeout(() => self.render(), 50);
        })
    }

    render(): void {
        let state = this.deviceStateFormat.toNumber(this.deviceState);

        if (this.deviceState.dimmer === 0 && this.countFromLedsOptionInputElement.checked) {
            state &= 0b111;
        }

        this.binInputElement.value = '0b' + state.toString(2).padStart(9, '0');
        this.htmlInputElement.value = '0x' + state.toString(16);
    }
}
