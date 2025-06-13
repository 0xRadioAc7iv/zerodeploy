import { Resend } from 'resend';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);

		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: corsHeaders(),
			});
		}

		if (request.method !== 'POST' || url.pathname !== '/') {
			return new Response('Not found', {
				status: 404,
				headers: corsHeaders(),
			});
		}

		let body: { recipient: string; fullName?: string; buildId?: string; type: string };

		try {
			body = await request.json();
		} catch (err) {
			return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json', ...corsHeaders() },
			});
		}

		const { recipient, fullName, type } = body;

		if (((type === 'accountCreated' || type === 'accountDeleted') && !fullName) || (type === 'deployFailed' && !body.buildId)) {
			return new Response(JSON.stringify({ error: 'Missing required fields' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json', ...corsHeaders() },
			});
		}

		const subject = {
			accountCreated: 'Welcome to ZeroDeploy!',
			accountDeleted: `Goodbye from ZeroDeploy, ${fullName}`,
			deployFailed: 'Deployment Failed',
		}[type];

		const html = {
			accountCreated: `
        <div style="font-family:Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;padding:32px;border:1px solid #eaeaea;border-radius:8px;background-color:#ffffff;">
          <h2 style="color:#111;">Welcome aboard, ${fullName} 👋</h2>
          <p style="font-size:16px;color:#444;">Your ZeroDeploy account was created successfully. You’re now ready to build, deploy, and scale your apps effortlessly.</p>
          <p style="font-size:16px;color:#444;">Here’s what you can do next:</p>
          <ul style="padding-left:20px;font-size:16px;color:#444;">
            <li>Deploy instantly with zero configuration</li>
            <li>Monitor builds and logs in real-time</li>
          </ul>
          <a href="https://zerodeploy.xyz/dashboard" style="display:inline-block;margin-top:16px;padding:10px 20px;background-color:#000;color:#fff;border-radius:4px;text-decoration:none;">Go to Dashboard</a>
        </div>
      `,

			accountDeleted: `
        <div style="font-family:Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;padding:32px;border:1px solid #eaeaea;border-radius:8px;background-color:#ffffff;">
          <h2 style="color:#111;">We're sad to see you go, ${fullName} 😔</h2>
          <p style="font-size:16px;color:#444;">Your ZeroDeploy account has been deleted. All associated data and deployments have been removed.</p>
        </div>
      `,

			deployFailed: `
	    <div style="font-family:Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;padding:32px;border:1px solid #eaeaea;border-radius:8px;background-color:#ffffff;">
	      <h2 style="color:#b91c1c;">🚨 Deployment Failed</h2>
	      <p style="font-size:16px;color:#444;">Your deployment <strong>${body.buildId}</strong> on ZeroDeploy did not complete successfully.</p>
	      <p style="font-size:16px;color:#444;">Possible reasons include build errors, misconfigurations, or missing files.</p>
	      <p style="font-size:16px;color:#444;">Please check the logs and try redeploying once the issue is resolved.</p>
	      <a href="https://zerodeploy.xyz/dashboard/builds/${body.buildId}" style="display:inline-block;margin-top:16px;padding:10px 20px;background-color:#b91c1c;color:#fff;border-radius:4px;text-decoration:none;">View Build Logs</a>
	    </div>
	  `,
		}[type];

		if (!subject || !html) {
			return new Response(JSON.stringify({ error: 'Invalid email type' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json', ...corsHeaders() },
			});
		}

		const resend = new Resend(env.RESEND_API_KEY);

		try {
			await resend.emails.send({
				from: 'ZeroDeploy <send@zerodeploy.xyz>',
				to: [recipient],
				subject,
				html,
			});
		} catch (err) {
			return new Response(JSON.stringify({ error: 'Failed to send email' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json', ...corsHeaders() },
			});
		}

		return new Response(JSON.stringify({ status: 'sent' }), {
			headers: { 'Content-Type': 'application/json', ...corsHeaders() },
		});
	},
} satisfies ExportedHandler<Env>;

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': 'https://zerodeploy.xyz',
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
	};
}
