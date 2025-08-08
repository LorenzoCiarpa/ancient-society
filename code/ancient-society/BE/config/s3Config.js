const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const {serverConfig} = require('./serverConfig')

const s3Config = new AWS.S3({
    accessKeyId: serverConfig.AWS.AWS_IAM_USER_KEY,
    secretAccessKey: serverConfig.AWS.AWS_IAM_USER_SECRET,
    Bucket: serverConfig.AWS.AWS_BUCKET_NAME,
    region:'us-east-1'
  });

const multerS3Config = multerS3({
    s3: s3Config,
    bucket: serverConfig.AWS.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {

        let imageNameSplitted = file.originalname != undefined && file.originalname != null ? file.originalname.split('.') : [];
        let extension = imageNameSplitted.length > 0 ? imageNameSplitted[imageNameSplitted.length - 1] : 'null';
        
        cb(null, req.locals.address + '.' + extension);

        req.locals.imageName = file.originalname;
        req.locals.imageExtension = extension;
    }
});




module.exports={s3Config, multerS3Config}
