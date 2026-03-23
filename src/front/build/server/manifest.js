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
		client: {start:"_app/immutable/entry/start.B6Nz4WUV.js",app:"_app/immutable/entry/app.C2nlLWv2.js",imports:["_app/immutable/entry/start.B6Nz4WUV.js","_app/immutable/chunks/gBrvu3bH.js","_app/immutable/chunks/C-zfE2iW.js","_app/immutable/entry/app.C2nlLWv2.js","_app/immutable/chunks/gBrvu3bH.js","_app/immutable/chunks/B0BvW1x3.js","_app/immutable/chunks/Cfug8aQt.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-CGMGQeGl.js')),
			__memo(() => import('./chunks/1-DYm6Jf3R.js')),
			__memo(() => import('./chunks/2-DkcDX8DU.js')),
			__memo(() => import('./chunks/3-CH4cGLCU.js')),
			__memo(() => import('./chunks/4-BLT5oEpR.js')),
			__memo(() => import('./chunks/5-DQSDikvf.js')),
			__memo(() => import('./chunks/6-B8rQNdQe.js'))
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
