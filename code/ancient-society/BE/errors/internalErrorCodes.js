internal_reason_phrases = {
    0: 'NOTHING',
    1: 'BAN'
}

module.exports.internalStatusCodes = {
    NOTHING: 0,
    BAN: 1
}

module.exports.getInternalPhrase = (errorCode) => internal_reason_phrases[errorCode];