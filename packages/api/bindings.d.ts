// hack to get global working
export {};
declare global {
	const SECRET_API_KEY: string;
	const KVStore: KVNamespace;
	const DRY_RUN: boolean;
}
