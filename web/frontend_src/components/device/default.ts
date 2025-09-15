import { DeviceState } from "../device-state/default";
import { DeviceStateFormatInterface } from "../device-state/serialization";

export const DeviceUI = function (applicationElement: HTMLElement, deviceState: DeviceState) {
    let self = this;

    this.applicationElement = applicationElement;

    const hygrostatButtonElement: HTMLElement = applicationElement.querySelector('.button.button_hygro') as HTMLInputElement;
    const powerButtonElement: HTMLElement = applicationElement.querySelector('.button.button_power') as HTMLInputElement;
    const dimmerButtonElement: HTMLElement = applicationElement.querySelector('.button.button_dimmer') as HTMLInputElement;
    const speedButtonElement: HTMLElement = applicationElement.querySelector('.button.button_speed') as HTMLInputElement;

    function updatePowerDisplay(): void {
        let powerClass = deviceState.power ? 'device_power_on' : 'device_power_off';

        applicationElement.classList.remove('device_power_on', 'device_power_off');
        applicationElement.classList.add(powerClass);

        applicationElement.classList.remove('device_no-water');
        if (!deviceState.water) {
            applicationElement.classList.add('device_no-water');
        }
    }

    function updateDimmerDisplay(): void {
        applicationElement.classList.remove('device_dimmer_1', 'device_dimmer_2');

        if (deviceState.power && deviceState.dimmer > 0) {
            applicationElement.classList.add(`device_dimmer_${deviceState.dimmer}`);
        }
    }

    function updateHygrostatDisplay(): void {
        for (let i = 0; i <= 5; ++i) {
            applicationElement.classList.remove(`device_hygro_${i}`)
        }

        if (!deviceState.power || !deviceState.water) {
            return;
        }

        if (deviceState.hygrostat === 5) {
            deviceState.fan = true;
            self.updateFanDisplay();
        }

        applicationElement.classList.add(`device_hygro_${deviceState.hygrostat}`);
        self.updateBlinkAnimation();
    }

    function updateSpeedDisplay(): void {
        applicationElement.classList.remove('device_speed_1', 'device_speed_2')

        if (!deviceState.power || !deviceState.water) {
            return;
        }

        applicationElement.classList.add(`device_speed_${deviceState.speed}`)
    }

    this.updateResetFilterDisplay = function(): void {
        applicationElement.classList.remove('device_filter-warning');

        if (!deviceState.power || !deviceState.water) {
            return;
        }

        if (!deviceState.filter) {
            applicationElement.classList.add('device_filter-warning');
            self.updateBlinkAnimation();
        }
    }

    this.updateFanDisplay = function (): void {
        applicationElement.classList.remove('device_power_pause');

        if (!deviceState.power || !deviceState.water) {
            return;
        }

        if (!deviceState.fan) {
            applicationElement.classList.add('device_power_pause');
        }
    }

    this.updateBlinkAnimation = function(): void {
        // ad-hoc to sync animation of leads
        if (deviceState.fan) {
            return;
        }

        applicationElement.classList.remove('device_power_pause', 'device_filter-warning')
        setTimeout(function () {
            if (!deviceState.filter) {
                applicationElement.classList.add('device_power_pause')
                applicationElement.classList.add('device_filter-warning')
            } else {
                applicationElement.classList.add('device_power_pause')
            }
        }, 50)
    }

    this.render = function (): void {
        updatePowerDisplay();
        updateDimmerDisplay();
        updateHygrostatDisplay();
        updateSpeedDisplay();
        self.updateResetFilterDisplay();
        self.updateFanDisplay();
    }

    powerButtonElement.addEventListener('click', (e: Event): void => {
        deviceState.power = !deviceState.power;
        self.render();
    });

    dimmerButtonElement.addEventListener('click', (e: Event): void => {
        // order: bright, dim, disabled
        deviceState.dimmer = (deviceState.dimmer + 2) % 3;
        updateDimmerDisplay();
    });

    hygrostatButtonElement.addEventListener('click', (e: Event): void => {
        deviceState.hygrostat = Math.max(1, (deviceState.hygrostat + 1) % 6);
        updateHygrostatDisplay();
    });

    speedButtonElement.addEventListener('click', (e: Event): void => {
        deviceState.speed = Math.max(1, (deviceState.speed + 1) % 3);
        updateSpeedDisplay();
    });
};

export const DeviceEventUI = function (deviceState: DeviceState, deviceUI) {
    const pauseEventButtonElement = deviceUI.applicationElement.querySelector('.button.button_event_pause');
    const filterEventButtonElement = deviceUI.applicationElement.querySelector('.button.button_event_filter');
    const waterEventElementButton = deviceUI.applicationElement.querySelector('.button.button_event_water');

    filterEventButtonElement.addEventListener('click', (e: Event): void => {
        // ... actually, requires 5 seconds push
        deviceState.filter = !deviceState.filter;
        deviceUI.updateResetFilterDisplay();
    });

    pauseEventButtonElement.addEventListener('click', (e: Event): void => {
        if (deviceState.hygrostat === 5) {
            return;
        }
        deviceState.fan = !deviceState.fan;
        deviceUI.updateFanDisplay();
        setTimeout(deviceUI.updateBlinkAnimation, 0);
    });

    waterEventElementButton.addEventListener('click', (e: Event): void => {
        if (!deviceState.power) {
            return;
        }
        deviceState.water = !deviceState.water;
        deviceState.fan = deviceState.water;
        deviceUI.render();
    });
}

export const DeviceStateUI = function (deviceState: DeviceState, deviceStateFormat: DeviceStateFormatInterface) {
    const self = this;
    const binInputElement: HTMLInputElement = document.querySelector('input[name=bin]') as HTMLInputElement;
    const htmlInputElement: HTMLInputElement = document.querySelector('input[name=hex]') as HTMLInputElement;
    const countFromLedsOptionInputElement: HTMLInputElement = document.querySelector('input[id=count-from-lead]') as HTMLInputElement;

    this.render = function (): void {
        let state = deviceStateFormat.toNumber(deviceState);

        if (deviceState.dimmer === 0 && countFromLedsOptionInputElement.checked) {
            state &= 0b111;
        }

        binInputElement.value = '0b' + state.toString(2).padStart(9, '0');
        htmlInputElement.value = '0x' + state.toString(16);
    }

    document.addEventListener('click', (e: Event): void => {
        setTimeout(self.render, 50);
    })
}
