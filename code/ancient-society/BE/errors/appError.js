const { ReasonPhrases, StatusCodes, getReasonPhrase } = require('http-status-codes');
const SEVERITY = require('./severityErrors')

// centralized error object that derives from Node’s Error
class AppError extends Error{
    constructor(internalInfo = {
            logMessage : 'Generic Internal Error',
            internalCode: 0
        },
        httpCode, 
        description,
        isOperational = true, 
        responseObject = null, 
        severity = 6
    ){
        super();  //the argument is the string to print near the name, see super('ciao');

        this.name = this.constructor.name;
        this.logMessage = internalInfo.logMessage || 'Generic Internal Error';
        this.internalCode = internalInfo.internalCode || 0;
        this.httpCode = httpCode;
        this.description = description;
        this.isOperational = isOperational;
        
        this.responseObject = {
            success: false,
            error: responseObject ? responseObject : description
        };

        this.severity = severity;
        Error.captureStackTrace(this, this.constructor);

    }
    
};

//4XX Error codes
class BadRequestError extends AppError{
    constructor(logMessage, responseObject = { errorMessage: ReasonPhrases.BAD_REQUEST }){
        super(
            {logMessage}, 
            StatusCodes.BAD_REQUEST, 
            ReasonPhrases.BAD_REQUEST,
            true,
            responseObject,
            SEVERITY.ALL);  //the argument is the string to print near the name, see super('ciao');

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);

    }
    
};


class UnauthorizedError extends AppError{
    constructor(logMessage, responseObject = { errorMessage: ReasonPhrases.UNAUTHORIZED }){
        super(
            {logMessage}, 
            StatusCodes.UNAUTHORIZED, 
            ReasonPhrases.UNAUTHORIZED,
            true,
            responseObject,
            SEVERITY.ALL);  //the argument is the string to print near the name, see super('ciao');

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);

    }
    
};

class ForbiddenError extends AppError{
    constructor(logMessage, responseObject = { errorMessage: ReasonPhrases.FORBIDDEN }){
        super(
            {logMessage}, 
            StatusCodes.FORBIDDEN, 
            ReasonPhrases.FORBIDDEN,
            true,
            responseObject,
            SEVERITY.ALL);  //the argument is the string to print near the name, see super('ciao');

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);

    }
    
};

class NotFoundError extends AppError{
    constructor(logMessage, responseObject = { errorMessage: ReasonPhrases.NOT_FOUND }){
        super(
            {logMessage}, 
            StatusCodes.NOT_FOUND, 
            ReasonPhrases.NOT_FOUND,
            true,
            responseObject,
            SEVERITY.ALL);  //the argument is the string to print near the name, see super('ciao');

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);

    }
    
};

class MethodNotAllowedError extends AppError{
    constructor(logMessage, responseObject = { errorMessage: ReasonPhrases.METHOD_NOT_ALLOWED }){
        super(
            {logMessage}, 
            StatusCodes.METHOD_NOT_ALLOWED, 
            ReasonPhrases.METHOD_NOT_ALLOWED,
            true,
            responseObject,
            SEVERITY.ALL);  //the argument is the string to print near the name, see super('ciao');

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);

    }
    
};



//500XX Error Codes
class InternalError extends AppError{
    constructor(logMessage, responseObject = { errorMessage: ReasonPhrases.INTERNAL_SERVER_ERROR }){
        super(
            {logMessage}, 
            StatusCodes.INTERNAL_SERVER_ERROR, 
            ReasonPhrases.INTERNAL_SERVER_ERROR,
            true,
            responseObject,
            SEVERITY.ALL);  //the argument is the string to print near the name, see super('ciao');

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);

    }
    
};

class BadGatewayError extends AppError{
    constructor(logMessage, responseObject = { errorMessage: ReasonPhrases.BAD_GATEWAY }){
        super(
            {logMessage}, 
            StatusCodes.BAD_GATEWAY, 
            ReasonPhrases.BAD_GATEWAY,
            true,
            responseObject,
            SEVERITY.ALL);  //the argument is the string to print near the name, see super('ciao');

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);

    }
    
}; 


module.exports = {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    MethodNotAllowedError,
    InternalError,
    BadGatewayError,
}