export type DeviceState = {
    power: boolean;
    water: boolean;
    fan: boolean;  // (!fan) -> pause || !water || !power
    dimmer: number;  // 0-2 (0 = выкл, 1 = тускло, 2 = ярко)
    filter: boolean;
    speed: number;  // 1-2
    hygrostat: number;  // 0-5 (0 = выкл)
}

export function defaultDeviceState(): DeviceState {
    return {
        power: false,
        water: true,
        fan: true,
        dimmer: 2,
        filter: true,
        speed: 1,
        hygrostat: 1,
    }
}