export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const host = url.hostname;
		const subdomain = host.split('.')[0];
		let uri = url.pathname;

		if (subdomain && subdomain !== 'www' && subdomain !== 'site') {
			const prefix = `/builds/${subdomain}`;

			if (!uri.startsWith(prefix)) {
				uri = uri === '/' ? `${prefix}/index.html` : `${prefix}${uri}`;
			}
		}

		const key = uri.startsWith('/') ? uri.slice(1) : uri;
		const object = await env.DEPLOY_BUCKET.get(key);

		if (!object) {
			return new Response('Not Found', { status: 404 });
		}

		return new Response(object.body, {
			headers: {
				'Content-Type': getMimeType(uri),
				'Cache-Control': 'public, max-age=3600',
			},
		});
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
