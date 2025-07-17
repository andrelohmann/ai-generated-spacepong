
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 54977;

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname);

    switch(req.url) {
        case '/':
        case '/index.html':
            filePath = path.join(filePath, 'index.html');
            break;
        case '/game.js':
            filePath = path.join(filePath, 'game.js');
            break;
        default:
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('404 Not Found');
            return;
    }

    const ext = path.extname(filePath);
    const contentType = getContentType(ext) || 'text/html';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('404 Not Found');
            } else {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('500 Internal Server Error');
            }
        } else {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With'
            });
            res.end(content);
        }
    });
});

const getContentType = (ext) => {
    switch(ext) {
        case '.js': return 'application/javascript';
        case '.html': return 'text/html';
        case '.css': return 'text/css';
        default: return null;
    }
};

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`You can also access it at http://0.0.0.0:${PORT}/`);
});
