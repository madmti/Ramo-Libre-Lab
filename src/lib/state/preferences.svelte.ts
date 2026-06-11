import type { Serializable } from '$lib/types/state';
import { themes, type Theme } from '@ramolibre/core/ui-themes';

export interface PreferencesSerial {
	theme: Theme;
}

const DEFAULT_PREFERENCES: PreferencesSerial = {
	theme: 'dark'
};

export class PreferencesManager implements Serializable<PreferencesSerial> {
	private _prefs = $state<PreferencesSerial>(DEFAULT_PREFERENCES);

	fromSerial(json: PreferencesSerial): void {
		this._prefs = {
			...DEFAULT_PREFERENCES,
			...json
		};
	}

	toSerial(): PreferencesSerial {
		return this._prefs;
	}

	clear(): void {
		this._prefs = DEFAULT_PREFERENCES;
	}

	empty(): boolean {
		return this._prefs.theme === DEFAULT_PREFERENCES.theme;
	}

	get theme() {
		return this._prefs.theme;
	}

	set theme(value: Theme) {
		this._prefs.theme = value;
		this.applyTheme();
	}

	applyTheme() {
		const root = document.documentElement;
		const cls = themes.map((t) => t.class).filter((c) => !!c);
		root.classList.remove(...cls);
		root.classList.add(this._prefs.theme);
	}
}
