import { browser } from '$app/environment';
import { PreferencesManager } from './preferences.svelte';

export const RAMOLIBRELAB_KEY_PREFIX = 'RAMOLIBRELAB_';
const PREFERENCES_KEY = `${RAMOLIBRELAB_KEY_PREFIX}PREFERENCES_V1`;

class RootStore {
	private _preferences = new PreferencesManager();

	get preferences() {
		return this._preferences;
	}

	get empty() {
		return this._preferences.empty();
	}

	constructor() {
		if (browser) this.load();
	}

	fromURL(url: URL) {
		console.log('RootStore:fromURL', url);
	}

	private load() {
		console.log('RootStore:load');
		if (!browser) return;
		const preferencesData = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}');
		if (preferencesData) this._preferences.fromSerial(preferencesData);
	}

	private save() {
		console.log('RootStore:save');
		if (!browser) return;
		const preferencesData = JSON.stringify(this._preferences.toSerial());
		localStorage.setItem(PREFERENCES_KEY, preferencesData);
	}

	private clear() {
		console.log('RootStore:clear');
		this._preferences.clear();
	}
}

export const db = new RootStore();
