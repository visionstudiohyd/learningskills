/**
 * Custom Next.js server — the entry point cPanel's Node.js selector
 * (Phusion Passenger) starts instead of `next start`.
 *
 * Why a custom server is required here:
 *   Passenger does not run a process that picks its own port. It hands the
 *   application a listening socket it has already bound, exposed as PORT. On
 *   Linux that is usually a UNIX socket path (/tmp/passenger.../socket), and
 *   occasionally a TCP port. `next start` cannot accept a socket path, so we
 *   create the HTTP server ourselves and listen exactly where Passenger says.
 *
 * Running it outside Passenger works too (`PORT=3000 node server.js`), which
 * keeps local production smoke-tests honest.
 */
import { createServer } from 'node:http';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';

// Passenger sets PORT to a socket path; local runs use a plain TCP port.
const listenOn = process.env.PORT || '3000';
const isSocket = typeof listenOn === 'string' && listenOn.startsWith('/');
const hostname = process.env.HOSTNAME || '0.0.0.0';

const app = next({
  dev,
  hostname,
  // `port` must be a number for Next's own URL building; omit it when Passenger
  // gave us a filesystem socket.
  port: isSocket ? undefined : Number(listenOn),
});
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer((req, res) => {
      handle(req, res).catch((error) => {
        console.error('[server] request failed:', error);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      });
    });

    if (isSocket) {
      server.listen(listenOn);
    } else {
      server.listen(Number(listenOn), hostname);
    }

    server.on('listening', () => {
      console.log(
        `[server] ready on ${isSocket ? listenOn : `${hostname}:${listenOn}`} (${process.env.NODE_ENV || 'development'})`
      );
    });

    // Passenger restarts the process; exit cleanly so in-flight requests finish.
    const shutdown = (signal) => {
      console.log(`[server] ${signal} received, shutting down`);
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 10_000).unref();
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  })
  .catch((error) => {
    console.error('[server] failed to start Next.js:', error);
    process.exit(1);
  });
