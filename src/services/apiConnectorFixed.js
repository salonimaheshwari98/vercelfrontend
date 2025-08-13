import axios from "axios"

export const axiosInstance=axios.create({});
const BACK_URL = process.env.REACT_APP_BACK_URL;

export const apiConnector=(method,url,bodyData,headers,params)=>{
    return axiosInstance({
        method:`${method}`,
        url:`${url}`,
        data:bodyData?bodyData:null,
        headers:headers?headers:null,
        params:params?params:null,
    });
    //instance of axios is created and the flow will be 
    //on clicking button we will land to services and then 
    //to controller then to any function of controllers

    

}
