import type { Serializable } from '$lib/types/state';
import { generateUUID } from '$lib/utils/crypto';
import { SvelteDate, SvelteMap } from 'svelte/reactivity';

export interface Simulacion {
	id: string;
	name: string;
	date: Date;
}

const NO_USABLE_ID = 'FAKE_ID_DONT_SAVE';

const DEFAULT_SIMULACION: Simulacion = {
	id: NO_USABLE_ID,
	name: 'Nueva Simulacion',
	date: new Date()
};

export type SimulacionKey = string;
export type SimulacionesSerial = [SimulacionKey, Simulacion][];
export type Simulaciones = SvelteMap<SimulacionKey, Simulacion>;

export class SimulacionesManager implements Serializable<SimulacionesSerial> {
	private _simulaciones = $state<Simulaciones>(new SvelteMap());
	private _actual = $state<Simulacion>(DEFAULT_SIMULACION);

	loadActual(newActual: Simulacion) {
		this._actual = {
			...newActual,
			id: NO_USABLE_ID
		};
	}

	updateActual(updates: Partial<Simulacion>) {
		this._actual = {
			...this._actual,
			...updates,
			id: NO_USABLE_ID
		};
	}

	fromSerial(json: SimulacionesSerial): void {
		if (json && json.length > 0) {
			this._simulaciones = new SvelteMap(json);
			if (this._actual.id !== DEFAULT_SIMULACION.id) {
				const existing = this._simulaciones.get(this._actual.id);
				if (existing) this._actual = existing;
			}
			return;
		}
		this._simulaciones = new SvelteMap();
		this._actual = DEFAULT_SIMULACION;
	}

	toSerial(): SimulacionesSerial {
		return Array.from(this._simulaciones.entries());
	}

	clear(): void {
		this._simulaciones.clear();
	}

	empty(): boolean {
		return this._simulaciones.size === 0;
	}

	get actual() {
		return this._actual;
	}

	get all() {
		return this._simulaciones;
	}

	saveActual() {
		const toSave: Simulacion = {
			...this._actual,
			id: generateUUID(),
			date: new SvelteDate()
		};
		this._simulaciones.set(toSave.id, toSave);
		this._actual = toSave;
	}

	loadById(id: string) {
		const toLoad = this._simulaciones.get(id);
		if (toLoad) this._actual = toLoad;
	}

	deleteById(id: string) {
		this._simulaciones.delete(id);
	}
}
