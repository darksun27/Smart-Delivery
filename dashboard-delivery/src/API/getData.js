import axios from 'axios'

const deliveryData = axios.create({
    baseURL: 'http://192.168.29.214:5000'
})

export default deliveryData;