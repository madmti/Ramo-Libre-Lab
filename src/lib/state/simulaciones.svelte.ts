import type { Serializable } from '$lib/types/state';
import { generateUUID } from '$lib/utils/crypto';
import { SvelteDate, SvelteMap } from 'svelte/reactivity';

export interface Simulacion {
	id: string;
	name: string;
	date: Date;
	modo: 'visual' | 'script';
	scriptRaw: string;
	variables: Record<string, number>;
	/** Raw text de la regla/statement actualmente seleccionado en Sistema.svelte */
	activeStatementRaw: string;
}

export type SimulacionKey = string;
export type SimulacionesSerial = [SimulacionKey, Simulacion][];
export type Simulaciones = SvelteMap<SimulacionKey, Simulacion>;

const NO_USABLE_ID = 'FAKE_ID_DONT_SAVE';

function getDefaultSimulacion(): Simulacion {
	return {
		id: NO_USABLE_ID,
		name: 'Nueva Simulacion',
		date: new SvelteDate(),
		modo: 'visual',
		scriptRaw: '',
		variables: {
			C1: 30,
			C2: 20,
			Labs: 100
		},
		activeStatementRaw: ''
	};
}

export class SimulacionesManager implements Serializable<SimulacionesSerial> {
	private _simulaciones = $state<Simulaciones>(new SvelteMap());
	private _actual = $state<Simulacion>(getDefaultSimulacion());

	loadActual(newActual: Simulacion) {
		this._actual = {
			...getDefaultSimulacion(),
			...newActual,
			variables: { ...newActual.variables },
			date: new SvelteDate(newActual.date),
			id: NO_USABLE_ID
		};
	}

	updateActual(updates: Partial<Simulacion>) {
		this._actual = {
			...this._actual,
			...updates,
			...(updates.variables && { variables: { ...this._actual.variables, ...updates.variables } }),
			id: this._actual.id
		};
	}

	updateVariable(name: string, value: number) {
		this._actual.variables[name] = value;
	}

	fromSerial(json: SimulacionesSerial): void {
		if (json && json.length > 0) {
			const hydrated = json.map(([key, value]) => {
				value.date = new SvelteDate(value.date);
				return [key, value] as [SimulacionKey, Simulacion];
			});
			this._simulaciones = new SvelteMap(hydrated);
			if (this._actual.id !== NO_USABLE_ID) {
				const existing = this._simulaciones.get(this._actual.id);
				if (existing) this.loadById(this._actual.id);
			}
			return;
		}
		this._simulaciones = new SvelteMap();
		this._actual = getDefaultSimulacion();
	}

	toSerial(): SimulacionesSerial {
		return Array.from(this._simulaciones.entries());
	}

	clear(): void {
		this._simulaciones.clear();
		this._actual = getDefaultSimulacion();
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

	resetActual() {
		this._actual = getDefaultSimulacion();
	}

	saveActual() {
		const isNew = this._actual.id === NO_USABLE_ID;
		const targetId = isNew ? generateUUID() : this._actual.id;
		const toSave: Simulacion = {
			...this._actual,
			variables: $state.snapshot(this._actual.variables),
			id: targetId,
			date: new SvelteDate()
		};
		this._simulaciones.set(toSave.id, toSave);
		this._actual = toSave;
	}

	loadById(id: string) {
		const toLoad = this._simulaciones.get(id);
		if (toLoad) {
			this._actual = {
				...toLoad,
				variables: { ...toLoad.variables },
				date: new SvelteDate(toLoad.date)
			};
		}
	}

	deleteById(id: string) {
		this._simulaciones.delete(id);
		if (this._actual.id === id) {
			this._actual = getDefaultSimulacion();
		}
	}
}
