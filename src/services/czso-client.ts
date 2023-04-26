import axios from "axios"

export default axios.create({
    baseURL: "https://apl.czso.cz/iSMS/do_cis_export?kodcis=100&typdat=0&cisjaz=203&format=2&separator=%2C"
})