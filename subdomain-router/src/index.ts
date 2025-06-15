export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const host = url.hostname;
		const subdomain = host.split('.')[0];
		let uri = url.pathname;

		// Maintenance Mode check
		if (subdomain && subdomain !== 'www' && subdomain !== 'site') {
			const maintenanceKey = `maintenance:${subdomain}`;
			const inMaintenance = await env.KV_BINDING.get(maintenanceKey);

			if (inMaintenance === 'true') {
				const maintenancePage = await env.DEPLOY_BUCKET.get('maintenance.html');

				if (!maintenancePage) {
					return new Response('Under Maintenance', { status: 503 });
				}

				return new Response(maintenancePage.body, {
					status: 503,
					headers: {
						'Content-Type': 'text/html',
						'Cache-Control': 'no-store',
					},
				});
			}

			const prefix = `/builds/${subdomain}`;

			if (!uri.startsWith(prefix)) {
				uri = uri === '/' ? `${prefix}/index.html` : `${prefix}${uri}`;
			}
		}

		const key = uri.startsWith('/') ? uri.slice(1) : uri;

		const cacheKey = new Request(request.url, request);
		const cache = caches.default;

		let response = await cache.match(cacheKey);
		if (response) {
			return response;
		}

		const object = await env.DEPLOY_BUCKET.get(key);

		if (!object) {
			const notFoundPage = await env.DEPLOY_BUCKET.get('404.html');

			if (!notFoundPage) {
				return new Response('Page Not found', { status: 404 });
			}

			response = new Response(notFoundPage.body, {
				status: 200,
				headers: {
					'Content-Type': 'text/html',
					'Cache-Control': 'public, max-age=60',
				},
			});

			ctx.waitUntil(cache.put(cacheKey, response.clone()));
			return response;
		}

		const mime = getMimeType(uri);
		const cacheHeaders = getCacheHeaders(uri);

		response = new Response(object.body, {
			headers: {
				'Content-Type': mime,
				...cacheHeaders,
			},
		});

		ctx.waitUntil(cache.put(cacheKey, response.clone()));
		return response;
	},
} satisfies ExportedHandler<Env>;

function getMimeType(path: string) {
	if (path.endsWith('.html')) return 'text/html';
	if (path.endsWith('.js')) return 'application/javascript';
	if (path.endsWith('.css')) return 'text/css';
	if (path.endsWith('.json')) return 'application/json';
	if (path.endsWith('.svg')) return 'image/svg+xml';
	if (path.endsWith('.png')) return 'image/png';
	return 'application/octet-stream';
}

function getCacheHeaders(path: string): Record<string, string> {
	if (/\.(js|css|png|jpg|jpeg|gif|svg|woff2|ttf|eot|otf)$/.test(path)) {
		return { 'Cache-Control': 'public, immutable, max-age=31536000' };
	}
	if (path.endsWith('.html') || path.endsWith('.json')) {
		return { 'Cache-Control': 'public, max-age=300' };
	}
	return { 'Cache-Control': 'public, max-age=3600' };
}
