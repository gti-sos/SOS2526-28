const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["robots.txt","style.css"]),
	mimeTypes: {".txt":"text/plain",".css":"text/css"},
	_: {
		client: {start:"_app/immutable/entry/start.DigWVWHU.js",app:"_app/immutable/entry/app.ajgOTaZ-.js",imports:["_app/immutable/entry/start.DigWVWHU.js","_app/immutable/chunks/DQXPDX99.js","_app/immutable/chunks/Ao8hT-MN.js","_app/immutable/chunks/4Mvdq9dQ.js","_app/immutable/entry/app.ajgOTaZ-.js","_app/immutable/chunks/Ao8hT-MN.js","_app/immutable/chunks/BQzx_G52.js","_app/immutable/chunks/N_yu8ttR.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/4Mvdq9dQ.js","_app/immutable/chunks/WePMYWRw.js","_app/immutable/chunks/CLsQXN_c.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-M74_Z1UD.js')),
			__memo(() => import('./chunks/1-4UcOWEUF.js')),
			__memo(() => import('./chunks/2-tMqmT2KB.js')),
			__memo(() => import('./chunks/3-Bwq2b6nT.js')),
			__memo(() => import('./chunks/4-OCvqWvPT.js')),
			__memo(() => import('./chunks/5--hrhtcm1.js')),
			__memo(() => import('./chunks/6-Db0jbSdA.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/about",
				pattern: /^\/about\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/beneficial-ownership-merchant-fleets",
				pattern: /^\/beneficial-ownership-merchant-fleets\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/company-esg-scores-financial-performances",
				pattern: /^\/company-esg-scores-financial-performances\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/deliberate-violence-against-civilians-events-worldwide",
				pattern: /^\/deliberate-violence-against-civilians-events-worldwide\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
