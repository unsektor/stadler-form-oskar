import {DeviceState, defaultDeviceState} from './components/device-state/default'
import {NineBitsDeviceStateFormat} from './components/device-state/serialization'
import {DeviceUI, DeviceStateUI, DeviceEventUI} from './components/device/default'
import {Theme} from './components/theme/default'

window.addEventListener('DOMContentLoaded', (e: Event): void => {
    const applicationElement: HTMLElement = document.querySelector('.container') as HTMLElement;
    const deviceState: DeviceState = defaultDeviceState();

    const deviceUI = new DeviceUI(applicationElement, deviceState);
    const deviceEventUI = new DeviceEventUI(deviceState, deviceUI);

    const deviceStateFormat = new NineBitsDeviceStateFormat();
    const deviceStateUI = new DeviceStateUI(deviceState, deviceStateFormat);

    const switchThemeAnchorElement: HTMLAnchorElement = document.querySelector('.anchor-switch-theme') as HTMLAnchorElement;
    const theme = new Theme(
        'land.md.stadler-form-oskar.ui.theme',
        ['light', 'dark'],
        true,
        switchThemeAnchorElement
    )

    deviceUI.render();
    deviceStateUI.render();
})
