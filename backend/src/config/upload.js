const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../uploads');
        
        // Criar diretório se não existir
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Gerar nome único para o arquivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const filename = file.fieldname + '-' + uniqueSuffix + extension;
        cb(null, filename);
    }
});

// Filtro para tipos de arquivo permitidos
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não permitido. Apenas JPG, PNG e PDF são aceitos.'), false);
    }
};

// Configuração do multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 10 // Máximo 10 arquivos por upload
    },
    fileFilter: fileFilter
});

// Middleware para upload de foto do membro
const uploadPhoto = upload.single('photo');

// Middleware para upload de arquivos do membro
const uploadFiles = upload.array('files', 10);

// Função para deletar arquivo
function deleteFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Função para mover arquivo de temp para definitivo
function moveFile(oldPath, newPath) {
    return new Promise((resolve, reject) => {
        // Criar diretório de destino se não existir
        const destDir = path.dirname(newPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        
        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Função para listar arquivos de um membro
function listMemberFiles(memberId) {
    return new Promise((resolve, reject) => {
        const memberPath = path.join(__dirname, '../../uploads', `member_${memberId}`);
        
        if (!fs.existsSync(memberPath)) {
            resolve([]);
            return;
        }
        
        fs.readdir(memberPath, (err, files) => {
            if (err) {
                reject(err);
            } else {
                const fileList = files.map(file => ({
                    name: file,
                    path: path.join(memberPath, file),
                    size: fs.statSync(path.join(memberPath, file)).size,
                    created: fs.statSync(path.join(memberPath, file)).birthtime
                }));
                resolve(fileList);
            }
        });
    });
}

module.exports = {
    uploadPhoto,
    uploadFiles,
    deleteFile,
    moveFile,
    listMemberFiles
};
