const http = require('http');

console.log('🧪 Testando API de grupos...');

// Testar GET /api/groups
const options = {
    hostname: 'localhost',
    port: 2028,
    path: '/api/groups',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('Response:', data);
        
        if (res.statusCode === 200) {
            console.log('✅ API de grupos funcionando!');
            
            // Testar POST /api/groups
            testCreateGroup();
        } else {
            console.log('❌ Erro na API de grupos');
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Erro na requisição:', error.message);
});

req.end();

function testCreateGroup() {
    console.log('\n🧪 Testando criação de grupo...');
    
    const postData = JSON.stringify({
        name: 'Grupo Teste API',
        leader_name: 'Líder Teste',
        description: 'Descrição teste via API'
    });
    
    const postOptions = {
        hostname: 'localhost',
        port: 2028,
        path: '/api/groups',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    const postReq = http.request(postOptions, (res) => {
        console.log(`Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('Response:', data);
            
            if (res.statusCode === 201) {
                console.log('✅ Criação de grupo funcionando!');
            } else {
                console.log('❌ Erro na criação de grupo');
            }
        });
    });
    
    postReq.on('error', (error) => {
        console.error('❌ Erro na requisição POST:', error.message);
    });
    
    postReq.write(postData);
    postReq.end();
}
