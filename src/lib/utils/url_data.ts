export type UrlEncodedPayload = string;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(data: Uint8Array): string {
	let binary = '';
	for (const byte of data) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(payload: string): Uint8Array {
	const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
	const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

export function encodeUrlData<T>(data: T): UrlEncodedPayload {
	const json = JSON.stringify(data);
	const bytes = encoder.encode(json);
	return toBase64Url(bytes);
}

export function decodeUrlData<T>(payload: UrlEncodedPayload): T {
	const bytes = fromBase64Url(payload);
	const json = decoder.decode(bytes);
	return JSON.parse(json) as T;
}
