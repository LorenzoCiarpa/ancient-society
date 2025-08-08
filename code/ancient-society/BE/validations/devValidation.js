const Validator = require("../utils/validator");

class DevValidation{
    static getChallengeWinnersValidation(req){
        let number = req.body.number;
        let idItem = req.body.idItem;
        if(!Validator.validateInput(idItem,number)){
            return {
                success: false,
                error: {
                    errorMessage: "inpunt null or undefined"
                }
            }
        }
        if(!Validator.isNaturalInteger(number)){
            return {
                success: false,
                error: {
                    errorMessage: "number is not a number"
                }
            } 
        }

        if(!Validator.isNaturalInteger(idItem)){
            return {
                success: false,
                error: {
                    errorMessage: "idItem is not a number"
                }
            } 
        }

        return {
            success: true
        }
    }
}

module.exports = { DevValidation }