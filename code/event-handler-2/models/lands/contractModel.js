// const contracCreation = require('../../controllers/landcontractController');
const mysql = require('../../config/databaseConfig');
const landModel = require('./landModel');


let LandService = new landModel.LandService();

class ContractService{
    constructor(){}

    async mintContractOnData(event){
        console.log("mintContractOnData event:",event)
        let owner = event.returnValues.owner
        let idContract=event.returnValues.idContract
        let signature= event.returnValues.signature
        let creation = true;

        //change voucher status
        let changeVoucher
        try {
            changeVoucher = await LandService.setVoucherStatus(owner,idContract,creation);//status lasciato vuoto per dubbio
            console.log("response in setVoucherStatus", changeVoucher)
        } catch (error) {
            console.log("error in setVoucherStatus", error)
            return
        }
        if(changeVoucher.affectedRows == 0) return

        let changeContract
        try {
            changeContract = await LandService.setContractStatus(owner,idContract,'active');
            console.log("response in setContractStatus", changeContract)
        } catch (error) {
            console.log("error in setContractStatus",error);
            return
        }
        if(changeContract.affectedRows == 0 ) return





    }

    async deleteContractOnData(event){
        console.log("deleteContractOnData event:",event)
        let owner = event.returnValues.owner
        let idContract=event.returnValues.idContract
        let signature= event.returnValues.signature
        let creation = false


        //change voucher status
        let changeVoucher
        try {
            changeVoucher = await LandService.setVoucherStatus(owner,idContract,creation);//status lasciato vuoto per dubbio
            console.log("response in setVoucherStatus", changeVoucher)
        } catch (error) {
            console.log("error in setVoucherStatus", error)
            return
        }
        if(changeVoucher.affectedRows == 0 ) return

        let changeContract
        try {
            changeContract = await LandService.setContractStatus(owner,idContract,'deleted');
            console.log("response in setContractStatus", changeContract)
        } catch (error) {
            console.log("error in setContractStatus",error);
            return
        }
        if(changeContract.affectedRows == 0 ) return

        try {
            changeContract = await LandService.removeContractLandInstance(owner,idContract);
            console.log("response in removeContractLandInstance", changeContract)
        } catch (error) {
            console.log("error in removeContractLandInstance",error);
            return
        }

        if(changeContract.affectedRows == 0 ) return




    }

    async mintContractOnChange(change){
        console.log("Change in mintContractOnChange : ", change);
    }

    async mintContractOnError(error){
        console.log("Error in mintContractOnError : ", error);
    }

    async deleteContractOnChange(change){
        console.log("Change in deleteContractOnChange : ", change);
    }

    async deleteContractOnError(error){
        console.log("Error in deleteContractOnError : ", error);
    }
    
}
module.exports={ContractService}