import type { Serializable } from '$lib/types/state';
import { generateUUID } from '$lib/utils/crypto';
import { SvelteDate, SvelteMap } from 'svelte/reactivity';

export interface Simulacion {
	id: string;
	name: string;
	date: Date | null;
}

const DEFAULT_SIMULACION: Simulacion = {
	id: 'FAKE_ID_DONT_SAVE',
	name: 'Simulacion 0',
	date: null
};

export type SimulacionKey = string;
export type SimulacionesSerial = [SimulacionKey, Simulacion][];
export type Simulaciones = SvelteMap<SimulacionKey, Simulacion>;

const DEMO_SIMULACIONES: Simulaciones = new SvelteMap(
	[
		{
			name: 'INF-134 - Peor Escenario',
			date: new SvelteDate('2026-06-03')
		},
		{
			name: 'Aproximación con Gamma 1.1',
			date: new SvelteDate('2026-05-28')
		},
		{
			name: 'Simulación Redes de Computadores',
			date: new SvelteDate('2026-05-15')
		}
	].map((sim, idx) => {
		const id = (idx + 1).toString();
		return [id, { ...sim, id }];
	})
);

const DEMO_ACTUAL = DEMO_SIMULACIONES.values().next().value ?? DEFAULT_SIMULACION;

export class SimulacionesManager implements Serializable<SimulacionesSerial> {
	private _simulaciones = $state<Simulaciones>(new SvelteMap(DEMO_SIMULACIONES));
	private _actual = $state<Simulacion>(DEMO_ACTUAL);

	loadActual(newActual: Simulacion) {
		this._actual = newActual;
	}

	fromSerial(json: SimulacionesSerial): void {
		if (json && json.length > 0) {
			this._simulaciones = new SvelteMap(json);
			this._actual = this._simulaciones.values().next().value ?? DEFAULT_SIMULACION;
			return;
		}
		this._simulaciones = new SvelteMap(DEMO_SIMULACIONES);
		this._actual = DEMO_ACTUAL;
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
	}

	loadById(id: string) {
		const toLoad = this._simulaciones.get(id);
		if (toLoad) this._actual = toLoad;
	}

	deleteById(id: string) {
		this._simulaciones.delete(id);
	}
}
