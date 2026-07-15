import axios from "axios";

const API = axios.create({
  baseURL: "https://familyreactnode-production.up.railway.app/api",
});

export default API;