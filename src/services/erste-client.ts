import axios from "axios"

export default axios.create({
    baseURL: "https://webapi.developers.erstegroup.com/api/csas/public/sandbox/v3/places",
    headers: {
        "WEB-API-key": "ec995b11-35d4-4e69-bb98-0c22bbaf622c"
    }
})