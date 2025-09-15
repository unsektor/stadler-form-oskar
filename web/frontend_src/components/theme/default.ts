// very stupid application theme switcher
export class Theme {
    constructor(
        private readonly storageKey: string,
        private readonly themeList: string[],
        private readonly noClassForDefaultTheme: boolean = true,
        private switchThemeAnchorElement: HTMLAnchorElement,
    ) {
        let theme = localStorage.getItem(this.storageKey) || this.themeList[0];
        this.set(theme);

        const self = this;

        this.switchThemeAnchorElement.addEventListener('click', (e: Event): void => {
            const nextTheme = self.getNextTheme();
            self.set(nextTheme)
            e.preventDefault()
        });
    }

    private getNextTheme(): string {
        const currentTheme = this.get();
        return this.themeList[(this.themeList.indexOf(currentTheme) + 1) % this.themeList.length]
    }

    public get(): string {
        for (const theme of this.themeList) {
            if (document.body.classList.contains(`body_${theme}`)) {
                return theme;
            }
        }

        return this.themeList[0];
    }

    public set(theme: string): void {
        if (this.themeList.indexOf(theme) === -1) {
            return;
        }

        for (let theme of this.themeList) {
            document.body.classList.remove(`body_${theme}`)
        }

        localStorage.setItem(this.storageKey, theme);

        if (this.noClassForDefaultTheme && theme !== this.themeList[0]) {
            document.body.classList.add(`body_${theme}`);
        }

        const nextAfterNextTheme = this.getNextTheme()
        this.switchThemeAnchorElement.innerText = `Switch theme to ${nextAfterNextTheme}`;
    }
}
