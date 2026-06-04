import { browser } from '$app/environment';
import { PreferencesManager, type PreferencesSerial } from './preferences.svelte';
import { SimulacionesManager, type SimulacionesSerial } from './simulaciones.svelte';

export const RAMOLIBRELAB_KEY_PREFIX = 'RAMOLIBRELAB_';
const PREFERENCES_KEY = `${RAMOLIBRELAB_KEY_PREFIX}PREFERENCES_V1`;
const SIMULACIONES_KEY = `${RAMOLIBRELAB_KEY_PREFIX}SIMULACIONES_V1`;

export type FullSnapshot = {
	[PREFERENCES_KEY]: PreferencesSerial;
	[SIMULACIONES_KEY]: SimulacionesSerial;
};

class RootStore {
	private _preferences = new PreferencesManager();
	private _simulaciones = new SimulacionesManager();

	get preferences() {
		return this._preferences;
	}

	get simulaciones() {
		return this._simulaciones;
	}

	get empty() {
		return this._preferences.empty() && this._simulaciones.empty();
	}

	constructor() {
		if (browser) this.load();
		$effect.root(() => {
			$effect(() => {
				db.save();
			});
		});
	}

	createSnapshot() {
		const snapshot = {
			[PREFERENCES_KEY]: this._preferences.toSerial(),
			[SIMULACIONES_KEY]: this._simulaciones.toSerial()
		};

		return snapshot;
	}

	fromSnapshot(snapshot: FullSnapshot) {
		Object.keys(localStorage).forEach((key) => {
			if (key.startsWith(RAMOLIBRELAB_KEY_PREFIX)) {
				localStorage.removeItem(key);
			}
		});

		Object.entries(snapshot).forEach(([key, val]) => {
			localStorage.setItem(key, JSON.stringify(val));
		});

		this.load();
	}

	private load() {
		console.log('RootStore:load');
		if (!browser) return;
		const preferencesData = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}');
		if (preferencesData) this._preferences.fromSerial(preferencesData);
		const simulacionesData = JSON.parse(localStorage.getItem(SIMULACIONES_KEY) || '{}');
		if (simulacionesData) this._simulaciones.fromSerial(simulacionesData);
	}

	private save() {
		console.log('RootStore:save');
		if (!browser) return;
		const preferencesData = JSON.stringify(this._preferences.toSerial());
		localStorage.setItem(PREFERENCES_KEY, preferencesData);
		const simulacionesData = JSON.stringify(this._simulaciones.toSerial());
		localStorage.setItem(SIMULACIONES_KEY, simulacionesData);
	}

	clear() {
		console.log('RootStore:clear');
		this._preferences.clear();
		this._simulaciones.clear();
	}
}

export const db = new RootStore();
