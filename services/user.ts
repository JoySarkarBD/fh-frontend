import axiosClient from "@/lib/axiosClient"
import { axiosServer } from "@/lib/axiosServer"


export const getUserClient = async()=>{
const resp = axiosClient.get('/users/me');
return resp;
}
export const getUserServer = async()=>{
const api = await axiosServer();
const resp = api.get('/users/me')
return resp
}
